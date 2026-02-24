import { adminDb } from "@/lib/firebaseAdmin";
import { PROBLEM_DETAILS_COLLECTION } from "@/constants/firestore";
import {
  PROBLEM_SCHEMA_VERSION,
  ProblemDetails,
  ProcessingLayerMeta,
} from "@/types/problem";

const COLLECTION = PROBLEM_DETAILS_COLLECTION;

export const STALE_AFTER_MS = 2 * 60 * 1000; // 2 minutes

type ProcessingLayer = keyof NonNullable<
  NonNullable<ProblemDetails["processingMeta"]>["layers"]
>;

export type PracticeLayer = "testCases" | "edgeCases" | "hints" | "pitfalls";

export type ClaimFramingResult =
  | { status: "claimed" }
  | { status: "already_complete" }
  | { status: "already_processing" };

export type ClaimPracticeLayersResult =
  | { status: "claimed"; claimedLayers: PracticeLayer[] }
  | { status: "already_complete" }
  | { status: "already_processing" };

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

/**
 * Atomically claims a generation slot for framing layer.
 * Uses a Firestore transaction to prevent concurrent generation and
 * protect completed data from being overwritten.
 *
 * Framing layer is claimable when:
 * - No status exists (first generation)
 * - Schema version is outdated (full regeneration needed)
 * - Prompt version is outdated (layer regeneration needed)
 * - Status is "processing" but stale (previous attempt died)
 */
export async function claimFramingGeneration(
  slug: string,
  opts: { staleAfterMs: number; currentPromptVersion: number },
): Promise<ClaimFramingResult> {
  const { staleAfterMs, currentPromptVersion } = opts;
  const ref = adminDb.collection(COLLECTION).doc(slug);

  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.exists ? (doc.data() as ProblemDetails) : null;
    const storedSchemaVersion = data?.processingMeta?.schemaVersion ?? 0;
    const layerMeta = data?.processingMeta?.layers?.framing;

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
      ["processingMeta.layers.framing"]: {
        status: "processing",
        updatedAt: Date.now(),
      },
    };

    if (!doc.exists) {
      tx.set(ref, {
        titleSlug: slug,
        processingMeta: {
          schemaVersion: PROBLEM_SCHEMA_VERSION,
          layers: { framing: { status: "processing", updatedAt: Date.now() } },
        },
      });
    } else {
      if (schemaOutdated) {
        processingMeta["processingMeta.schemaVersion"] = PROBLEM_SCHEMA_VERSION;
      }
      tx.update(ref, processingMeta);
    }

    return { status: "claimed" } as const;
  });
}

/**
 * Atomically claims generation slots for all outdated practice layers.
 * Uses all-or-nothing semantics: if any needed layer is currently being
 * processed by another request (non-stale), returns "already_processing"
 * rather than partially claiming.
 */
export async function claimPracticeLayers(
  slug: string,
  layerPromptVersions: Record<PracticeLayer, number>,
  opts: { staleAfterMs: number },
): Promise<ClaimPracticeLayersResult> {
  const { staleAfterMs } = opts;
  const ref = adminDb.collection(COLLECTION).doc(slug);
  const layers: PracticeLayer[] = [
    "testCases",
    "edgeCases",
    "hints",
    "pitfalls",
  ];

  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.exists ? (doc.data() as ProblemDetails) : null;
    const storedSchemaVersion = data?.processingMeta?.schemaVersion ?? 0;
    const schemaOutdated = storedSchemaVersion < PROBLEM_SCHEMA_VERSION;

    const needsGeneration: PracticeLayer[] = [];
    let hasInFlight = false;

    for (const layer of layers) {
      const meta = data?.processingMeta?.layers?.[layer];

      if (
        meta?.status === "complete" &&
        !schemaOutdated &&
        meta.promptVersion >= layerPromptVersions[layer]
      ) {
        continue; // up-to-date
      }

      if (
        meta?.status === "processing" &&
        !schemaOutdated &&
        Date.now() - meta.updatedAt < staleAfterMs
      ) {
        hasInFlight = true;
        break;
      }

      needsGeneration.push(layer);
    }

    if (hasInFlight) {
      return { status: "already_processing" } as const;
    }

    if (needsGeneration.length === 0) {
      return { status: "already_complete" } as const;
    }

    const now = Date.now();
    const updates: Record<string, unknown> = {};
    for (const layer of needsGeneration) {
      updates[`processingMeta.layers.${layer}`] = {
        status: "processing",
        updatedAt: now,
      };
    }

    if (!doc.exists) {
      const layersInit: Record<string, unknown> = {};
      for (const layer of needsGeneration) {
        layersInit[layer] = { status: "processing", updatedAt: now };
      }
      tx.set(ref, {
        titleSlug: slug,
        processingMeta: {
          schemaVersion: PROBLEM_SCHEMA_VERSION,
          layers: layersInit,
        },
      });
    } else {
      if (schemaOutdated) {
        updates["processingMeta.schemaVersion"] = PROBLEM_SCHEMA_VERSION;
      }
      tx.update(ref, updates);
    }

    return { status: "claimed", claimedLayers: needsGeneration } as const;
  });
}
