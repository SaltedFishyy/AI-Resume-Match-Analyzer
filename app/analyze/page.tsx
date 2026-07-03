import { AppShell } from "@/components/AppShell";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Analyze your fit</h1>
      <p className="mt-2 text-muted-foreground">Paste both documents to receive a focused comparison.</p>
      <AnalyzeForm />
    </AppShell>
  );
}
