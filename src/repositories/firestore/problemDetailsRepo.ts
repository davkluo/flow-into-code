import { adminDb } from "@/lib/firebaseAdmin";
import { ProblemDetails, ProcessingLayerMeta } from "@/types/problem";

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

/**
 * Atomically claims a generation slot for a processing layer.
 * Uses a Firestore transaction to prevent concurrent generation and
 * protect completed data from being overwritten.
 */
export async function claimGeneration(
  slug: string,
  layer: ProcessingLayer,
  staleAfterMs: number,
): Promise<ClaimResult> {
  const ref = adminDb.collection(COLLECTION).doc(slug);

  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.exists ? (doc.data() as ProblemDetails) : null;
    const layerMeta = data?.processingMeta?.layers?.[layer];

    if (layerMeta?.status === "complete") {
      return { status: "already_complete" } as const;
    }

    if (
      layerMeta?.status === "processing" &&
      Date.now() - layerMeta.updatedAt < staleAfterMs
    ) {
      return { status: "already_processing" } as const;
    }

    // No status or stale "processing" — claim it
    if (!doc.exists) {
      tx.set(ref, {
        titleSlug: slug,
        processingMeta: {
          layers: { [layer]: { status: "processing", updatedAt: Date.now() } },
        },
      });
    } else {
      tx.update(ref, {
        [`processingMeta.layers.${layer}`]: {
          status: "processing",
          updatedAt: Date.now(),
        },
      });
    }

    return { status: "claimed" } as const;
  });
}
