import { z } from "zod";

export const ProblemMetadataSchema = z.object({
  summary: z.string(),
  hints: z.array(z.string()).min(1),
  solutionOutlines: z.array(z.string()).min(1),
});