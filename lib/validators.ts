import { z } from "zod";

export const analysisRequestSchema = z.object({
  resumeText: z.string().trim().min(100).max(50_000),
  jobDescription: z.string().trim().min(100).max(30_000),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
