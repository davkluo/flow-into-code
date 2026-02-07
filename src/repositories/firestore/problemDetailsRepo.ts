import { adminDb } from "@/lib/firebaseAdmin";
import { ProblemDetails, ProcessingLayerMeta } from "@/types/problem";

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
  layer: keyof NonNullable<
    NonNullable<ProblemDetails["processingMeta"]>["layers"]
  >,
  meta: ProcessingLayerMeta,
): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(slug);
  await ref.update({
    [`processingMeta.layers.${layer}`]: meta,
  });
}
