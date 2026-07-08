"use client";

import { FormEvent, useState } from "react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ResumeInput } from "@/components/ResumeInput";
import type { AnalysisResultData } from "@/lib/validators";

type AnalyzeApiResponse = AnalysisResultData | { error: string };

export function AnalyzeForm() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const responseText = await response.text();
      let data: AnalyzeApiResponse;

      try {
        data = JSON.parse(responseText) as AnalyzeApiResponse;
      } catch {
        throw new Error(
          "Server returned a non JSON response. Please check the terminal for the real API error.",
        );
      }

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Analysis failed. Please try again.");
      }

      if ("error" in data) throw new Error(data.error);
      setResult(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form className="mt-10" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
            <label htmlFor="resumeText" className="text-lg font-semibold">Resume</label>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Paste the resume text you plan to use for this application.
            </p>
            <ResumeInput value={resumeText} onChange={setResumeText} />
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
            <label htmlFor="jobDescription" className="text-lg font-semibold">Job description</label>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Paste the complete role description for a job-specific comparison.
            </p>
            <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          </section>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-w-48 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isLoading ? "Analyzing..." : "Analyze resume"}
          </button>
        </div>
      </form>

      {result && <AnalysisResult result={result} />}
    </>
  );
}
