import { AppShell } from "@/components/AppShell";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <AppShell>
      <div className="relative -mx-6 -my-10 min-h-screen overflow-hidden bg-slate-50 px-6 py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.14),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.08),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative mx-auto max-w-6xl">
          <header className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              {["Rubric based", "Keyword aware", "Saved to history"].map((chip) => (
                <span key={chip} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
                  {chip}
                </span>
              ))}
            </div>
            <h1 className="mt-6 bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              Resume Match Analysis
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Compare your resume against a job description and get a rubric based match score, missing keywords, skill gaps, and practical resume suggestions.
            </p>
          </header>
          <AnalyzeForm />
        </div>
      </div>
    </AppShell>
  );
}
