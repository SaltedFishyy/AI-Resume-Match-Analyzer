import { AnalysisHistory } from "@/components/AnalysisHistory";
import { AppShell } from "@/components/AppShell";

export default function HistoryPage() {
  return <AppShell><h1 className="text-3xl font-bold">Analysis history</h1><p className="mb-8 mt-2 text-muted-foreground">Review previous resume and job matches.</p><AnalysisHistory /></AppShell>;
}
