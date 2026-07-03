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
      <form className="mt-8" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="font-medium">Resume</span>
            <ResumeInput value={resumeText} onChange={setResumeText} />
          </label>
          <label className="space-y-2">
            <span className="font-medium">Job description</span>
            <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          </label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={isLoading} className="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
          {isLoading ? "Analyzing…" : "Analyze resume"}
        </button>
      </form>
      {result && <AnalysisResult result={result} />}
    </>
  );
}
