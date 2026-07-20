"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, FileText, History, Lightbulb, RotateCcw, ShieldCheck, Sparkles, Target } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { PdfResumeUpload } from "@/components/PdfResumeUpload";
import { ResumeInput } from "@/components/ResumeInput";
import type { AnalysisResultData } from "@/lib/validators";

type AnalyzeApiResponse = AnalysisResultData | { error: string };

const SAMPLE_RESUME = `Jordan Lee\nProduct Analyst\n\nSUMMARY\nProduct analyst with four years of experience using SQL, Tableau, Excel, and customer research to improve digital products. Skilled in stakeholder communication, dashboard development, A/B testing, and translating business questions into measurable product insights.\n\nEXPERIENCE\nProduct Analyst, Northstar Software\n- Built Tableau dashboards used by product and operations teams to monitor adoption and retention.\n- Partnered with product managers and engineers to define metrics and analyze feature performance.\n- Used SQL to identify onboarding friction and recommend workflow improvements.\n- Presented findings and practical recommendations to cross-functional stakeholders.\n\nEDUCATION\nBachelor of Science in Information Systems`;
const SAMPLE_JOB = `We are seeking a Product Analyst to help our product teams make data-informed decisions. The ideal candidate has experience with SQL, Tableau, experimentation, product metrics, and stakeholder communication. Responsibilities include building dashboards, analyzing customer behavior, measuring feature performance, communicating insights, and partnering with product managers and engineers. Experience with Python, A/B testing, and SaaS products is preferred.`;

export function AnalyzeForm() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfResetSignal, setPdfResetSignal] = useState(0);

  function clearAll() { setResumeText(""); setJobDescription(""); setError(""); setResult(null); setPdfResetSignal((signal) => signal + 1); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setResult(null); setIsLoading(true);
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeText, jobDescription }) });
      const responseText = await response.text(); let data: AnalyzeApiResponse;
      try { data = JSON.parse(responseText) as AnalyzeApiResponse; } catch { throw new Error("Server returned a non JSON response. Please check the terminal for the real API error."); }
      if (!response.ok) throw new Error("error" in data ? data.error : "Analysis failed. Please try again.");
      if ("error" in data) throw new Error(data.error); setResult(data);
    } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Analysis failed. Please try again."); }
    finally { setIsLoading(false); }
  }

  return (
    <>
      <form className="mt-10" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <InputCard icon={FileText} tone="blue" title="Resume" description="Paste the resume text you plan to use for this application." count={resumeText.length} maximum={50_000} sampleLabel="Try sample resume" onSample={() => setResumeText(SAMPLE_RESUME)} footerMiddle={<PdfResumeUpload onTextExtracted={setResumeText} resetSignal={pdfResetSignal} />}>
            <ResumeInput value={resumeText} onChange={setResumeText} />
          </InputCard>
          <InputCard icon={BriefcaseBusiness} tone="violet" title="Job description" description="Paste the complete role description for a job-specific comparison." count={jobDescription.length} maximum={30_000} sampleLabel="Try sample job description" onSample={() => setJobDescription(SAMPLE_JOB)}>
            <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          </InputCard>
        </div>

        <div className="surface-card mt-5 grid gap-5 rounded-2xl p-5 sm:grid-cols-[1.4fr_repeat(4,1fr)] sm:items-center">
          <div><h2 className="font-bold text-slate-950">What you&apos;ll get</h2><p className="mt-1 text-xs text-slate-500">A focused analysis with actionable insights.</p></div>
          {[[Target,"Match score","bg-blue-50 text-blue-600"],[Clock3,"Missing keywords","bg-rose-50 text-rose-600"],[Sparkles,"Skill gaps","bg-orange-50 text-orange-600"],[Lightbulb,"Suggestions","bg-emerald-50 text-emerald-600"]].map(([Icon,label,tone]) => { const FeatureIcon = Icon as typeof Target; return <div key={label as string} className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone as string}`}><FeatureIcon className="h-5 w-5" /></span><span className="text-xs font-semibold text-slate-700">{label as string}</span></div>; })}
        </div>

        {error && <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-red-700 shadow-sm">{error}</p>}

        <div className="surface-card mt-5 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 px-2 text-xs text-slate-500"><ShieldCheck className="h-5 w-5 text-slate-400" /><span>Your analysis is saved securely to your history.</span></div>
          <button type="button" onClick={clearAll} disabled={isLoading} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Clear all</button>
          <Link href="/history" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><History className="h-4 w-4" /> View history</Link>
          <button type="submit" disabled={isLoading || resumeText.trim().length < 100 || jobDescription.trim().length < 100} className="focus-ring inline-flex min-w-56 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">{isLoading ? "Analyzing..." : "Analyze resume"}{!isLoading && <ArrowRight className="h-4 w-4" />}</button>
        </div>
      </form>
      {result && <AnalysisResult result={result} />}
    </>
  );
}

type InputCardProps = { icon: typeof FileText; tone: "blue" | "violet"; title: string; description: string; count: number; maximum: number; sampleLabel: string; onSample: () => void; footerMiddle?: React.ReactNode; children: React.ReactNode };
function InputCard({ icon: Icon, tone, title, description, count, maximum, sampleLabel, onSample, footerMiddle, children }: InputCardProps) {
  return <section className="surface-card rounded-3xl p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}><Icon className="h-5 w-5" /></span><div><label htmlFor={tone === "blue" ? "resumeText" : "jobDescription"} className="text-lg font-bold text-slate-950">{title}</label><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div><span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><ShieldCheck className="h-3.5 w-3.5" /> Private</span></div><div className="mt-6">{children}</div><div className="mt-3 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 sm:grid-cols-3 sm:items-center"><span className="text-xs text-slate-500 sm:text-left">{count.toLocaleString()} / {maximum.toLocaleString()} characters</span><div className="flex min-w-0 justify-center">{footerMiddle}</div><div className="flex justify-center sm:justify-end"><button type="button" onClick={onSample} className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50"><FileText className="h-3.5 w-3.5" /> {sampleLabel}</button></div></div></section>;
}
