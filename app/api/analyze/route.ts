import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentAppUser } from "@/lib/current-user";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { analysisRequestSchema, analysisResultSchema } from "@/lib/validators";

const SYSTEM_PROMPT = `You are an expert resume analyst helping a job seeker compare a resume with a job description.
Return an objective score from 0 to 100 and concise, practical feedback.
Base every observation only on the supplied resume and job description.
For bullet suggestions, write improved example bullets without inventing achievements, employers, metrics, or skills.
Keep each list focused and avoid repeating the same advice.`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI is not configured." }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();
    const { resumeText, jobDescription } = analysisRequestSchema.parse(body);

    const response = await openai.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
      text: {
        format: zodTextFormat(analysisResultSchema, "resume_analysis"),
      },
    });

    if (!response.output_parsed) {
      return NextResponse.json({ error: "The AI did not return a usable analysis. Please try again." }, { status: 502 });
    }

    const result = analysisResultSchema.parse(response.output_parsed);

    try {
      const user = await getCurrentAppUser();

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

    console.error("Resume analysis failed:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
