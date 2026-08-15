import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { consumeDailyAnalysisQuota, DailyAnalysisLimitReachedError } from "@/lib/analysis-quota";
import { getCurrentAppUser } from "@/lib/current-user";
import { getOpenAIClient } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import {
  analysisRequestSchema,
  analysisResultSchema,
  modelAnalysisResultSchema,
} from "@/lib/validators";

const SYSTEM_PROMPT = `You are an expert resume analyst helping a job seeker compare a resume with a job description.

Return four integer rubric scores using these exact ranges every time:
- skillsMatchScore: 0 to 40
- experienceRelevanceScore: 0 to 25
- projectRelevanceScore: 0 to 20
- keywordCoverageScore: 0 to 15

Do not return or invent a final matchScore. The server calculates it from the four rubric scores. Use the same rubric consistently for every analysis.
Base every score and observation only on explicit evidence in the supplied resume and job description. If evidence is missing, do not assume it exists and do not award points for it.
Do not adjust the score based on writing style unless the job description explicitly requires communication or writing skills.
Return concise, practical feedback.
For bullet suggestions, write improved example bullets without inventing achievements, employers, metrics, or skills.
Keep each list focused and avoid repeating the same advice.`;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const { resumeText, jobDescription } = analysisRequestSchema.parse(body);
    const user = await getCurrentAppUser();
    const openai = getOpenAIClient();
    await consumeDailyAnalysisQuota(user.id);

    const response = await openai.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      text: {
        format: zodTextFormat(modelAnalysisResultSchema, "resume_analysis"),
      },
    });

    if (!response.output_parsed) {
      return NextResponse.json({ error: "The AI did not return a usable analysis. Please try again." }, { status: 502 });
    }

    const modelResult = modelAnalysisResultSchema.parse(response.output_parsed);
    const rubricTotal =
      modelResult.skillsMatchScore +
      modelResult.experienceRelevanceScore +
      modelResult.projectRelevanceScore +
      modelResult.keywordCoverageScore;
    const matchScore = Math.min(100, Math.max(0, rubricTotal));
    const result = analysisResultSchema.parse({ ...modelResult, matchScore });

    try {
      await prisma.resumeAnalysis.create({
        data: {
          userId: user.id,
          resumeText,
          jobDescription,
          matchScore: result.matchScore,
          strengths: result.strengths,
          missingKeywords: result.missingKeywords,
          skillGaps: result.skillGaps,
          bulletSuggestions: result.bulletSuggestions,
          actionPlan: result.actionPlan,
        },
      });
    } catch (databaseError) {
      console.error("Saving resume analysis failed:", databaseError);
      return NextResponse.json(
        { error: "The analysis was completed, but it could not be saved. Please check the database connection and try again." },
        { status: 503 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Please provide a resume and job description of at least 100 characters each." }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "OpenAI is not configured.") {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof Error && error.message === "Authentication is not configured.") {
      return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
    }

    if (error instanceof Error && error.message === "You must be signed in.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof DailyAnalysisLimitReachedError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    console.error("Resume analysis failed:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
