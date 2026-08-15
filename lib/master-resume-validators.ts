import { z } from "zod";

export const bulletProvenanceValues = [
  "USER_ENTERED",
  "IMPORTED_FROM_RESUME_TEXT",
  "IMPORTED_FROM_PDF",
  "USER_CONFIRMED_AI_SUGGESTION",
] as const;

const nullableText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value ? value : null))
    .nullable()
    .optional();

const requiredText = (maxLength: number) => z.string().trim().min(1).max(maxLength);

const nullableUrl = z
  .string()
  .trim()
  .max(500)
  .url()
  .transform((value) => (value ? value : null))
  .or(z.literal("").transform(() => null))
  .nullable()
  .optional();

const stringList = (maxItems: number, maxLength: number) =>
  z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((value) => {
      const rawItems = Array.isArray(value) ? value : value?.split(/[,\n]/) ?? [];
      return rawItems.map((item) => item.trim()).filter(Boolean);
    })
    .pipe(z.array(z.string().max(maxLength)).max(maxItems));

const idSchema = z.string().min(1).optional();

export const resumeBulletInputSchema = z.object({
  id: idSchema,
  text: requiredText(1_000),
  tags: stringList(8, 40),
  provenance: z.enum(bulletProvenanceValues).default("USER_ENTERED"),
  sourceNote: nullableText(300),
  position: z.number().int().min(0),
});

export const resumeEducationInputSchema = z.object({
  id: idSchema,
  school: requiredText(160),
  degree: nullableText(120),
  fieldOfStudy: nullableText(120),
  location: nullableText(120),
  startDate: nullableText(120),
  endDate: nullableText(120),
  notes: nullableText(1_000),
  position: z.number().int().min(0),
});

export const resumeExperienceInputSchema = z.object({
  id: idSchema,
  company: requiredText(160),
  title: requiredText(160),
  location: nullableText(120),
  startDate: nullableText(120),
  endDate: nullableText(120),
  isCurrent: z.boolean().default(false),
  technologies: stringList(30, 80),
  position: z.number().int().min(0),
  bullets: z.array(resumeBulletInputSchema).max(20),
});

export const resumeProjectInputSchema = z.object({
  id: idSchema,
  name: requiredText(160),
  url: nullableUrl,
  repositoryUrl: nullableUrl,
  technologies: stringList(30, 80),
  startDate: nullableText(120),
  endDate: nullableText(120),
  position: z.number().int().min(0),
  bullets: z.array(resumeBulletInputSchema).max(20),
});

export const resumeSkillInputSchema = z.object({
  id: idSchema,
  name: requiredText(80),
  category: nullableText(80),
  position: z.number().int().min(0),
});

export const masterResumeInputSchema = z.object({
  education: z.array(resumeEducationInputSchema).max(20),
  experiences: z.array(resumeExperienceInputSchema).max(30),
  projects: z.array(resumeProjectInputSchema).max(50),
  skills: z.array(resumeSkillInputSchema).max(100),
});

export type ResumeBulletInput = z.infer<typeof resumeBulletInputSchema>;
export type ResumeEducationInput = z.infer<typeof resumeEducationInputSchema>;
export type ResumeExperienceInput = z.infer<typeof resumeExperienceInputSchema>;
export type ResumeProjectInput = z.infer<typeof resumeProjectInputSchema>;
export type ResumeSkillInput = z.infer<typeof resumeSkillInputSchema>;
export type MasterResumeInput = z.infer<typeof masterResumeInputSchema>;
export type BulletProvenanceValue = (typeof bulletProvenanceValues)[number];
