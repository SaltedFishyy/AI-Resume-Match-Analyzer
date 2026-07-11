import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getCurrentAppUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type AnalysisDetailPageProps = { params: Promise<{ id: string }> };

function DetailList({ title, description, items }: { title: string; description: string; items: string[] }) {
  return <section className="surface-card rounded-2xl p-6"><div className="border-b border-slate-100 pb-4"><h2 className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{items.length > 0 ? <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">{items.map((item,index) => <li key={`${title}-${index}`} className="flex gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" /><span>{item}</span></li>)}</ul> : <p className="mt-5 text-sm text-slate-500">No items identified.</p>}</section>;
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params; const user = await getCurrentAppUser();
  const analysis = await prisma.resumeAnalysis.findFirst({ where: { id, userId: user.id } });
  if (!analysis) notFound();

  return <AppShell>
    <Link href="/history" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-blue-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to history</Link>
    <header className="surface-card relative mt-6 overflow-hidden rounded-3xl p-6 sm:p-8"><div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-100/70 via-white to-violet-100/60" /><div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><p className="eyebrow">Saved analysis</p><h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Resume match details</h1><time className="mt-3 flex items-center gap-2 text-sm text-slate-500" dateTime={analysis.createdAt.toISOString()}><CalendarDays className="h-4 w-4" /> Created {analysis.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time></div><div className="rounded-2xl border border-blue-100 bg-white px-7 py-5 text-center shadow-lg shadow-blue-100/60"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Match score</p><p className="mt-1 text-4xl font-black text-blue-600">{analysis.matchScore}<span className="text-lg text-slate-400"> / 100</span></p></div></div></header>
    <div className="mt-8 grid gap-6 md:grid-cols-2"><DetailList title="Strengths" description="What already matches the job." items={analysis.strengths} /><DetailList title="Missing keywords" description="Important terms that are missing or weak in the resume." items={analysis.missingKeywords} /><DetailList title="Skill gaps" description="Skills or experience that need stronger evidence." items={analysis.skillGaps} /><DetailList title="Resume bullet suggestions" description="Suggested improvements based on the existing experience." items={analysis.bulletSuggestions} /></div>
    <div className="mt-6"><DetailList title="Action plan" description="The highest-priority improvements for this application." items={analysis.actionPlan} /></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2"><DocumentCard title="Resume text" description="The resume used for this analysis." text={analysis.resumeText} /><DocumentCard title="Job description" description="The role used for this comparison." text={analysis.jobDescription} /></div>
  </AppShell>;
}

function DocumentCard({ title, description, text }: { title: string; description: string; text: string }) {
  return <section className="surface-card rounded-2xl p-6"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FileText className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div><div className="mt-5 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700">{text}</div></section>;
}
