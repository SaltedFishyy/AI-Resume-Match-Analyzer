import { AppShell } from "@/components/AppShell";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ResumeInput } from "@/components/ResumeInput";

export default function AnalyzePage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Analyze your fit</h1>
      <p className="mt-2 text-muted-foreground">Paste both documents to receive a focused comparison.</p>
      <form className="mt-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2"><span className="font-medium">Resume</span><ResumeInput /></label>
          <label className="space-y-2"><span className="font-medium">Job description</span><JobDescriptionInput /></label>
        </div>
        <button type="submit" disabled className="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-50">Analysis API coming next</button>
      </form>
    </AppShell>
  );
}
