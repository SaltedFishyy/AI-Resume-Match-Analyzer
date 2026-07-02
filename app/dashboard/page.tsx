import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Your career dashboard</h1>
      <p className="mt-2 text-muted-foreground">Start a new analysis or revisit a previous result.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link href="/analyze" className="rounded-lg border bg-white p-6 shadow-sm"><h2 className="font-semibold">New resume analysis</h2><p className="mt-2 text-sm text-muted-foreground">Compare your resume against a role.</p></Link>
        <Link href="/history" className="rounded-lg border bg-white p-6 shadow-sm"><h2 className="font-semibold">Analysis history</h2><p className="mt-2 text-sm text-muted-foreground">Review your saved recommendations.</p></Link>
      </div>
    </AppShell>
  );
}
