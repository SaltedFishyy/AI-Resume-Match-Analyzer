import { z } from "zod";

const nullableTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value ? value : null))
    .nullable()
    .optional();

const nullableEmail = z
  .string()
  .trim()
  .max(254)
  .email()
  .transform((value) => (value ? value : null))
  .or(z.literal("").transform(() => null))
  .nullable()
  .optional();

const nullableUrl = z
  .string()
  .trim()
  .max(500)
  .url()
  .transform((value) => (value ? value : null))
  .or(z.literal("").transform(() => null))
  .nullable()
  .optional();

function isValidDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const nullableDateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isValidDateOnly)
  .transform((value) => (value ? value : null))
  .or(z.literal("").transform(() => null))
  .nullable()
  .optional();

const roleTargetsSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    const rawTargets = Array.isArray(value) ? value : value?.split(/[,\n]/) ?? [];
    return rawTargets.map((target) => target.trim()).filter(Boolean);
  })
  .pipe(z.array(z.string().max(80)).max(10));

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

export const analysisResponseSchema = z.object({
  result: analysisResultSchema,
  saved: z.boolean(),
  warning: z.string().optional(),
});

export const profileInputSchema = z.object({
  legalName: nullableTrimmedString(120),
  preferredName: nullableTrimmedString(120),
  contactEmail: nullableEmail,
  phone: nullableTrimmedString(120),
  city: nullableTrimmedString(120),
  state: nullableTrimmedString(120),
  country: nullableTrimmedString(120),
  linkedInUrl: nullableUrl,
  githubUrl: nullableUrl,
  portfolioUrl: nullableUrl,
  workAuthorizationStatus: nullableTrimmedString(120),
  requiresSponsorshipNow: z.boolean().nullable().optional(),
  requiresSponsorshipInFuture: z.boolean().nullable().optional(),
  earliestStartDate: nullableDateString,
  relocationPreference: nullableTrimmedString(160),
  commonRoleTargets: roleTargetsSchema,
});

export type AnalysisResultData = z.infer<typeof analysisResultSchema>;
export type AnalysisResponseData = z.infer<typeof analysisResponseSchema>;
export type ProfileInputData = z.infer<typeof profileInputSchema>;
