import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
      <nav className="flex items-center justify-between">
        <span className="text-lg font-semibold">Career Copilot</span>
        {isClerkConfigured ? <><SignedOut><SignInButton mode="modal"><button className="rounded-lg border bg-white px-4 py-2 text-sm font-medium">Sign in</button></SignInButton></SignedOut><SignedIn><UserButton /></SignedIn></> : <span className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800">Local preview</span>}
      </nav>
      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mb-4 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Resume intelligence for job seekers</p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">Turn every application into a stronger one.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">Compare your resume with a job description, uncover gaps, and get a focused action plan.</p>
        <Link href="/analyze" className="mt-8 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground">Analyze my resume</Link>
      </section>
    </main>
  );
}
