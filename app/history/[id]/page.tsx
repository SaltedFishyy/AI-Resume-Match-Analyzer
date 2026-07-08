import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentAppUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AnalysisDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailList({ title, description, items }: { title: string; description: string; items: string[] }) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {items.length > 0 ? (
        <ul className="mt-5 space-y-3 text-sm leading-6 text-foreground/80">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">No items identified.</p>
      )}
    </section>
  );
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentAppUser();
  const analysis = await prisma.resumeAnalysis.findFirst({
    where: { id, userId: user.id },
  });

  if (!analysis) notFound();

  return (
    <AppShell>
      <Link href="/history" className="text-sm font-medium text-primary hover:underline">← Back to history</Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-5 border-b pb-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Saved analysis</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Resume match details</h1>
          <time className="mt-2 block text-sm text-muted-foreground" dateTime={analysis.createdAt.toISOString()}>
            Created {analysis.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        </div>
        <div className="rounded-xl border bg-white px-6 py-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Match score</p>
          <p className="mt-1 text-3xl font-bold">{analysis.matchScore} / 100</p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <DetailList title="Strengths" description="What already matches the job." items={analysis.strengths} />
        <DetailList title="Missing keywords" description="Important terms that are missing or weak in the resume." items={analysis.missingKeywords} />
        <DetailList title="Skill gaps" description="Skills or experience that need stronger evidence." items={analysis.skillGaps} />
        <DetailList title="Resume bullet suggestions" description="Suggested improvements based on the existing experience." items={analysis.bulletSuggestions} />
      </div>

      <div className="mt-6">
        <DetailList title="Action plan" description="The highest-priority improvements for this application." items={analysis.actionPlan} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DocumentCard title="Resume text" description="The resume used for this analysis." text={analysis.resumeText} />
        <DocumentCard title="Job description" description="The role used for this comparison." text={analysis.jobDescription} />
      </div>
    </AppShell>
  );
}

function DocumentCard({ title, description, text }: { title: string; description: string; text: string }) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-6">
        {text}
      </div>
    </section>
  );
}
