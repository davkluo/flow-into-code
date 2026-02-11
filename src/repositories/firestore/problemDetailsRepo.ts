import { adminDb } from "@/lib/firebaseAdmin";
import {
  PROBLEM_SCHEMA_VERSION,
  ProblemDetails,
  ProcessingLayerMeta,
} from "@/types/problem";

type ProcessingLayer = keyof NonNullable<
  NonNullable<ProblemDetails["processingMeta"]>["layers"]
>;

export type ClaimResult =
  | { status: "claimed" }
  | { status: "already_complete" }
  | { status: "already_processing" };

const COLLECTION = "problemDetails";

export interface ProblemDetailsRepo {
  getBySlug(slug: string): Promise<ProblemDetails | null>;

  createIfNotExists(
    slug: string,
    initial: Partial<ProblemDetails>,
  ): Promise<void>;

  updateSource(slug: string, source: ProblemDetails["source"]): Promise<void>;

  updateDerived(
    slug: string,
    derived: Partial<ProblemDetails["derived"]>,
  ): Promise<void>;

  updateProcessingMeta(
    slug: string,
    layer: keyof NonNullable<ProblemDetails["processingMeta"]>["layers"],
    meta: ProcessingLayerMeta,
  ): Promise<void>;
}

export async function getBySlug(slug: string): Promise<ProblemDetails | null> {
  const doc = await adminDb.collection(COLLECTION).doc(slug).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as ProblemDetails;
}

export async function createIfNotExists(
  slug: string,
  initial: Partial<ProblemDetails>,
): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(slug);
  await ref.set(initial, { merge: true });
}

export async function updateSource(
  slug: string,
  source: ProblemDetails["source"],
): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(slug);
  await ref.update({ source });
}

export async function updateDerived(
  slug: string,
  derived: Partial<NonNullable<ProblemDetails["derived"]>>,
): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(slug);
  const doc = await ref.get();
  const existing = doc.exists
    ? ((doc.data() as ProblemDetails).derived ?? {})
    : {};

  await ref.update({
    derived: { ...existing, ...derived },
  });
}

export async function updateProcessingMeta(
  slug: string,
  layer: ProcessingLayer,
  meta: ProcessingLayerMeta,
): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(slug);
  await ref.update({
    [`processingMeta.layers.${layer}`]: meta,
  });
}

export interface ClaimGenerationOpts {
  staleAfterMs: number;
  currentPromptVersion: number;
}

/**
 * Atomically claims a generation slot for a processing layer.
 * Uses a Firestore transaction to prevent concurrent generation and
 * protect completed data from being overwritten.
 *
 * A layer is claimable when:
 * - No status exists (first generation)
 * - Schema version is outdated (full regeneration needed)
 * - Prompt version is outdated (layer regeneration needed)
 * - Status is "processing" but stale (previous attempt died)
 */
export async function claimGeneration(
  slug: string,
  layer: ProcessingLayer,
  opts: ClaimGenerationOpts,
): Promise<ClaimResult> {
  const { staleAfterMs, currentPromptVersion } = opts;
  const ref = adminDb.collection(COLLECTION).doc(slug);

  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.exists ? (doc.data() as ProblemDetails) : null;
    const storedSchemaVersion = data?.processingMeta?.schemaVersion ?? 0;
    const layerMeta = data?.processingMeta?.layers?.[layer];

    const schemaOutdated = storedSchemaVersion < PROBLEM_SCHEMA_VERSION;
    const promptOutdated =
      layerMeta?.status === "complete" &&
      layerMeta.promptVersion < currentPromptVersion;

    if (
      layerMeta?.status === "complete" &&
      !schemaOutdated &&
      !promptOutdated
    ) {
      return { status: "already_complete" } as const;
    }

    if (
      layerMeta?.status === "processing" &&
      !schemaOutdated &&
      Date.now() - layerMeta.updatedAt < staleAfterMs
    ) {
      return { status: "already_processing" } as const;
    }

    // Claimable: no status, stale, or outdated version
    const processingMeta: Record<string, unknown> = {
      [`processingMeta.layers.${layer}`]: {
        status: "processing",
        updatedAt: Date.now(),
      },
    };

    if (!doc.exists) {
      tx.set(ref, {
        titleSlug: slug,
        processingMeta: {
          schemaVersion: PROBLEM_SCHEMA_VERSION,
          layers: { [layer]: { status: "processing", updatedAt: Date.now() } },
        },
      });
    } else {
      if (schemaOutdated) {
        processingMeta["processingMeta.schemaVersion"] =
          PROBLEM_SCHEMA_VERSION;
      }
      tx.update(ref, processingMeta);
    }

    return { status: "claimed" } as const;
  });
}
