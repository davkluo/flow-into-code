import { ProblemDetails, ProcessingLayerMeta } from "@/types/leetcode";

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
