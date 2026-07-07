import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

const steps = [
  { title: "Paste your resume", description: "Add the resume text you plan to use for your application." },
  { title: "Paste the job description", description: "Share the role requirements so the analysis stays job-specific." },
  { title: "Get a rubric based match analysis", description: "Review your score, gaps, keywords, and practical next steps." },
];

const features = [
  { title: "Stable match score", description: "A consistent 100-point rubric covering skills, experience, projects, and keywords." },
  { title: "Missing keyword detection", description: "See important job terms that are not clearly represented in your resume." },
  { title: "Skill gap analysis", description: "Identify capabilities the role requests that need stronger evidence." },
  { title: "Resume bullet suggestions", description: "Get focused suggestions for making your existing experience more relevant." },
  { title: "Analysis history", description: "Return to previous resume and job matches whenever you need them." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-semibold tracking-tight">AI Resume Match Analyzer</Link>
        {isClerkConfigured ? (
          <>
            <SignedOut><SignInButton mode="modal"><button className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted">Sign in</button></SignInButton></SignedOut>
            <SignedIn><UserButton /></SignedIn>
          </>
        ) : (
          <span className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800">Local preview</span>
        )}
      </nav>

      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center lg:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Resume intelligence for job seekers</p>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">AI Resume Match Analyzer</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">Compare your resume against a job description and get a clear match score, missing keywords, skill gaps, and resume improvement suggestions.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/analyze" className="rounded-lg bg-primary px-6 py-3 text-center font-medium text-primary-foreground shadow-sm transition hover:opacity-90">Analyze my resume</Link>
              <Link href="/history" className="rounded-lg border bg-white px-6 py-3 text-center font-medium shadow-sm transition hover:bg-muted">View analysis history</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl"><p className="text-sm font-medium uppercase tracking-wide text-primary">How it works</p><h2 className="mt-2 text-3xl font-bold tracking-tight">A focused analysis in three steps</h2><p className="mt-3 text-muted-foreground">No complicated setup—just the two documents that matter for the application.</p></div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => <article key={step.title} className="rounded-xl border bg-white p-6 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{index + 1}</span><h3 className="mt-5 text-lg font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p></article>)}
        </div>
      </section>

      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl"><p className="text-sm font-medium uppercase tracking-wide text-primary">What you get</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Practical insight for every application</h2><p className="mt-3 text-muted-foreground">Each result is designed to help you make clear, evidence-based resume improvements.</p></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => <article key={feature.title} className="rounded-xl border bg-background p-6"><h3 className="font-semibold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Make your next application more focused.</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Compare your resume with the role before you apply.</p>
        <Link href="/analyze" className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90">Start an analysis</Link>
      </section>
    </main>
  );
}
