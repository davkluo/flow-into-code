import z from "zod";

export const TagDocSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  commonHints: z.array(z.string()).default([]),
  commonPitfalls: z.array(z.string()).default([]),
});
