import { AppShell } from "@/components/AppShell";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <AppShell>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl">
          <header className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              {["Rubric based", "Keyword aware", "Saved to history"].map((chip) => (
                <span key={chip} className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
                  {chip}
                </span>
              ))}
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
              Resume Match Analysis
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Compare your resume against a job description and get a rubric-based match score, missing keywords, skill gaps, and practical resume suggestions.
            </p>
          </header>
          <AnalyzeForm />
        </div>
      </div>
    </AppShell>
  );
}
