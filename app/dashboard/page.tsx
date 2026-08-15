import Link from "next/link";
import { ArrowRight, FileSearch, History, LibraryBig } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <p className="eyebrow">Dashboard</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Your resume workspace</h1>
      <p className="mt-3 text-slate-500">Start a new analysis or revisit a previous result.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Link href="/analyze" className="surface-card group rounded-2xl p-7 transition hover:-translate-y-1 hover:border-blue-200"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FileSearch className="h-6 w-6" /></span><h2 className="mt-5 text-lg font-bold text-slate-950">New resume analysis</h2><p className="mt-2 text-sm text-slate-500">Compare your resume against a target role.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600">Start analysis <ArrowRight className="h-4 w-4" /></span></Link>
        <Link href="/history" className="surface-card group rounded-2xl p-7 transition hover:-translate-y-1 hover:border-violet-200"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><History className="h-6 w-6" /></span><h2 className="mt-5 text-lg font-bold text-slate-950">Analysis history</h2><p className="mt-2 text-sm text-slate-500">Review your saved scores and recommendations.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-violet-600">View history <ArrowRight className="h-4 w-4" /></span></Link>
        <Link href="/resume" className="surface-card group rounded-2xl p-7 transition hover:-translate-y-1 hover:border-emerald-200"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><LibraryBig className="h-6 w-6" /></span><h2 className="mt-5 text-lg font-bold text-slate-950">Master resume</h2><p className="mt-2 text-sm text-slate-500">Maintain reusable facts, skills, projects, and bullets.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">Edit resume <ArrowRight className="h-4 w-4" /></span></Link>
      </div>
    </AppShell>
  );
}
