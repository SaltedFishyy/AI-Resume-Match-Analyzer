import { z } from "zod";

export const analysisRequestSchema = z.object({
  resumeText: z.string().trim().min(100).max(50_000),
  jobDescription: z.string().trim().min(100).max(30_000),
});

export const modelAnalysisResultSchema = z.object({
  skillsMatchScore: z.number().int().min(0).max(40),
  experienceRelevanceScore: z.number().int().min(0).max(25),
  projectRelevanceScore: z.number().int().min(0).max(20),
  keywordCoverageScore: z.number().int().min(0).max(15),
  strengths: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  skillGaps: z.array(z.string()),
  bulletSuggestions: z.array(z.string()),
  actionPlan: z.array(z.string()),
});

export const analysisResultSchema = modelAnalysisResultSchema.extend({
  matchScore: z.number().int().min(0).max(100),
});

export type AnalysisResultData = z.infer<typeof analysisResultSchema>;
