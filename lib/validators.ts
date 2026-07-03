import { z } from "zod";

export const analysisRequestSchema = z.object({
  resumeText: z.string().trim().min(100).max(50_000),
  jobDescription: z.string().trim().min(100).max(30_000),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export const analysisResultSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  skillGaps: z.array(z.string()),
  bulletSuggestions: z.array(z.string()),
  actionPlan: z.array(z.string()),
});

export type AnalysisResultData = z.infer<typeof analysisResultSchema>;
