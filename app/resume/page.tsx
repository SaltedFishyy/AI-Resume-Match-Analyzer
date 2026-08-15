import { AppShell } from "@/components/AppShell";
import { MasterResumeForm } from "@/components/MasterResumeForm";

export default function ResumePage() {
  return (
    <AppShell>
      <p className="eyebrow">Resume</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Master resume</h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Maintain the structured education, experience, projects, skills, and factual bullets that future tailored resumes will use.
      </p>
      <MasterResumeForm />
    </AppShell>
  );
}
