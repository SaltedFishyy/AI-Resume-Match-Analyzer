import Link from "next/link";
import { ArrowRight, CalendarDays, FileSearch, History, KeyRound, Plus } from "lucide-react";

export type HistoryAnalysis = { id: string; matchScore: number; jobDescription: string; missingKeywords: string[]; createdAt: Date };
type AnalysisHistoryProps = { analyses: HistoryAnalysis[]; error?: string };

function getJobPreview(jobDescription: string) {
  const normalized = jobDescription.replace(/\s+/g, " ").trim();
  return normalized.length > 180 ? `${normalized.slice(0, 180)}…` : normalized;
}

function scoreTone(score: number) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (score >= 60) return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-amber-50 text-amber-700 ring-amber-100";
}

export function AnalysisHistory({ analyses, error }: AnalysisHistoryProps) {
  if (error) return <div role="alert" className="surface-card rounded-2xl border-red-200 bg-red-50/90 p-8 text-center"><FileSearch className="mx-auto h-10 w-10 text-red-400" /><h2 className="mt-4 font-bold text-red-900">History unavailable</h2><p className="mt-2 text-sm text-red-700">{error}</p></div>;
  if (analyses.length === 0) return <div className="surface-card rounded-3xl border-dashed p-12 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><History className="h-7 w-7" /></span><h2 className="mt-5 text-xl font-bold text-slate-950">No saved analyses yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Run your first resume match to see scores, missing keywords, and recommendations here.</p><Link href="/analyze" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"><Plus className="h-4 w-4" /> New analysis</Link></div>;

  return <div className="grid gap-5 lg:grid-cols-2">{analyses.map((analysis) => (
    <article key={analysis.id} className="surface-card group rounded-2xl p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_60px_-35px_rgba(37,99,235,0.35)]">
      <div className="flex items-start justify-between gap-4"><div className={`rounded-xl px-4 py-3 text-center ring-1 ${scoreTone(analysis.matchScore)}`}><p className="text-2xl font-black">{analysis.matchScore}%</p><p className="text-[10px] font-bold uppercase tracking-wide">match</p></div><time className="flex items-center gap-2 text-xs font-medium text-slate-500" dateTime={analysis.createdAt.toISOString()}><CalendarDays className="h-4 w-4" />{analysis.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</time></div>
      <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{getJobPreview(analysis.jobDescription)}</p>
      <div className="mt-5"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><KeyRound className="h-3.5 w-3.5" /> Missing keywords</p><div className="mt-3 flex min-h-7 flex-wrap gap-2">{analysis.missingKeywords.length ? analysis.missingKeywords.slice(0,3).map(keyword => <span key={keyword} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">{keyword}</span>) : <span className="text-xs text-slate-400">No major keywords missing</span>}</div></div>
      <div className="mt-6 border-t border-slate-100 pt-4"><Link href={`/history/${analysis.id}`} className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition group-hover:gap-3">View full analysis <ArrowRight className="h-4 w-4" /></Link></div>
    </article>
  ))}</div>;
}
