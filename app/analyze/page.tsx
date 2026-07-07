import { AppShell } from "@/components/AppShell";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <AppShell>
      <header className="max-w-3xl">
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Rubric based scoring
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Resume Match Analysis</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Paste your resume and a job description to get a rubric based match score, missing keywords, skill gaps, and practical resume suggestions.
        </p>
      </header>
      <AnalyzeForm />
    </AppShell>
  );
}
