import { AnalysisHistory, type HistoryAnalysis } from "@/components/AnalysisHistory";
import { AppShell } from "@/components/AppShell";
import { getCurrentAppUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  let analyses: HistoryAnalysis[] = [];
  let error: string | undefined;

  try {
    const user = await getCurrentAppUser();
    analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        matchScore: true,
        jobDescription: true,
        missingKeywords: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (databaseError) {
    console.error("Loading analysis history failed:", databaseError);
    error = "Analysis history could not be loaded. Please check the database connection.";
  }

  return (
    <AppShell>
      <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="eyebrow">Your progress</p><h1 className="mt-3 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">Analysis history</h1><p className="mt-3 text-slate-500">Review previous resume matches and revisit your recommendations.</p></div></header>
      <AnalysisHistory analyses={analyses} error={error} />
    </AppShell>
  );
}
