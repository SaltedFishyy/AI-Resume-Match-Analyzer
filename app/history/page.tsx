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
      <h1 className="text-3xl font-bold">Analysis history</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Review previous resume and job matches.</p>
      <AnalysisHistory analyses={analyses} error={error} />
    </AppShell>
  );
}
