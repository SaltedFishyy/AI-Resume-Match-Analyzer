import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Check, Clock3, FileText, History, KeyRound, Lightbulb, Search, ShieldCheck, Sparkles, Target } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  { icon: FileText, color: "blue", title: "Paste your resume", description: "Add the resume text you plan to use for your application." },
  { icon: BriefcaseBusiness, color: "orange", title: "Paste the job description", description: "Share the role requirements so the analysis stays job-specific." },
  { icon: BarChart3, color: "emerald", title: "Get your match analysis", description: "Review your score, gaps, keywords, and practical next steps." },
];

const features = [
  { icon: Search, color: "blue", title: "Higher match clarity", description: "See what matters most so you can focus your resume." },
  { icon: BarChart3, color: "emerald", title: "Rubric-based analysis", description: "A consistent score across four key dimensions." },
  { icon: Target, color: "rose", title: "Find skill and keyword gaps", description: "Identify what is missing or needs stronger evidence." },
  { icon: History, color: "violet", title: "Track your progress", description: "Return to every saved analysis whenever you need it." },
  { icon: Lightbulb, color: "amber", title: "Actionable suggestions", description: "Get practical ways to improve your existing content." },
  { icon: ShieldCheck, color: "cyan", title: "Saved to your account", description: "Your saved analyses stay associated with your account." },
];

const tones: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600", orange: "bg-orange-50 text-orange-600", emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600", cyan: "bg-cyan-50 text-cyan-600",
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="relative border-b border-slate-200/70">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered career insights
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">AI Resume<br />Match Analyzer</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">Compare your resume against a job description and get a clear match score, missing keywords, skill gaps, and practical improvements.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/analyze" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl">Analyze my resume <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/history" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"><Clock3 className="h-4 w-4" /> View history</Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 text-xs font-medium text-slate-600 sm:grid-cols-3">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Account-based history</span>
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" /> AI-powered</span>
              <span className="flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /> Actionable</span>
            </div>
          </div>
          <AnalysisPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-24">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A focused analysis in three simple steps</h2>
        <p className="mt-3 text-slate-500">Just the two documents that matter for your application.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => <article key={step.title} className="surface-card rounded-2xl p-7 text-center transition hover:-translate-y-1"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tones[step.color]}`}><step.icon className="h-6 w-6" /></span><span className="mx-auto mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{index + 1}</span><h3 className="mt-4 font-bold text-slate-950">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p></article>)}
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/55">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div><p className="eyebrow">Why job seekers love it</p><h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Smarter insights. Better applications. More interviews.</h2><div className="mt-10 grid gap-7 sm:grid-cols-2">{features.map((feature) => <div key={feature.title} className="flex gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[feature.color]}`}><feature.icon className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-slate-900">{feature.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{feature.description}</p></div></div>)}</div></div>
          <div className="surface-card self-center rounded-3xl p-5 sm:p-7"><div className="flex items-center gap-3 border-b border-slate-100 pb-5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><BarChart3 className="h-5 w-5" /></span><p className="font-bold text-slate-900">Detailed analysis preview</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-semibold text-slate-500">Score breakdown</p>{[["Skills",78],["Experience",81],["Keywords",92]].map(([label,value]) => <div key={label as string} className="mt-5"><div className="flex justify-between text-xs font-semibold"><span>{label}</span><span>{value}%</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-500" style={{width:`${value}%`}} /></div></div>)}</div><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-semibold text-slate-500">Recommendations</p><ul className="mt-4 space-y-3 text-xs text-slate-600">{["Add missing technical skills","Quantify achievements","Highlight relevant projects"].map(item => <li key={item} className="flex gap-2"><Check className="h-4 w-4 text-emerald-500" />{item}</li>)}</ul><Link href="/analyze" className="mt-6 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Start your analysis</Link></div></div></div>
        </div>
      </section>
    </main>
  );
}

function AnalysisPreview() {
  return <div className="surface-card relative rounded-3xl p-4 sm:p-6"><div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]"><div className="rounded-2xl bg-slate-50 p-6 text-center"><p className="text-xs font-semibold text-slate-500">Overall match score</p><div className="mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#10b981_0_84%,#e2e8f0_84%)] p-3"><div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white"><span className="text-4xl font-black text-slate-950">84</span><span className="text-xs text-slate-500">/100</span></div></div></div><div className="rounded-2xl border border-slate-100 bg-white p-6"><p className="text-xs font-semibold text-slate-500">Match strength</p><p className="mt-2 text-xl font-bold text-emerald-600">Great match 🎉</p><p className="mt-2 text-xs leading-5 text-slate-500">Your resume aligns with many of the key requirements for this role.</p><span className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Strong candidate</span></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-slate-100 p-5"><div className="flex justify-between text-xs font-bold"><span>Keyword match</span><span>92%</span></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full w-[92%] rounded-full bg-emerald-500" /></div></div><div className="rounded-2xl border border-slate-100 p-5"><p className="text-xs font-bold">Top strengths</p><ul className="mt-3 space-y-2 text-xs text-slate-500"><li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500"/>Project management</li><li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500"/>Data analysis</li></ul></div></div></div>;
}
