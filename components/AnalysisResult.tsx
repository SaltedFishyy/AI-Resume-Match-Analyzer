import { ScoreCard } from "@/components/ScoreCard";
import type { AnalysisResultData } from "@/lib/validators";

type ResultListProps = {
  title: string;
  description: string;
  items: string[];
};

type RubricScoreProps = {
  label: string;
  description: string;
  score: number;
  maximum: number;
};

function ResultList({ title, description, items }: ResultListProps) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 space-y-4 text-sm leading-6 text-foreground/80">
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

function RubricScore({ label, description, score, maximum }: RubricScoreProps) {
  const percentage = Math.round((score / maximum) * 100);

  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{label}</h3>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
          {score} / {maximum}
        </span>
      </div>
      <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">{description}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
    </article>
  );
}

export function AnalysisResult({ result }: { result: AnalysisResultData }) {
  return (
    <section className="mt-12 space-y-8" aria-live="polite">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Resume insights</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Your analysis</h2>
        <p className="mt-2 text-muted-foreground">See where your resume aligns and what to improve before applying.</p>
      </header>

      <ScoreCard score={result.matchScore} />

      <section aria-labelledby="score-breakdown-title">
        <div className="mb-4">
          <h2 id="score-breakdown-title" className="text-xl font-semibold">Score breakdown</h2>
          <p className="mt-1 text-sm text-muted-foreground">The four factors used to calculate your overall match.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RubricScore label="Skills match" description="How closely your listed skills align with the role." score={result.skillsMatchScore} maximum={40} />
          <RubricScore label="Experience" description="How relevant your work experience is to the position." score={result.experienceRelevanceScore} maximum={25} />
          <RubricScore label="Projects" description="How well your projects demonstrate role-related ability." score={result.projectRelevanceScore} maximum={20} />
          <RubricScore label="Keywords" description="How thoroughly your resume covers important job terms." score={result.keywordCoverageScore} maximum={15} />
        </div>
      </section>

      <section aria-labelledby="recommendations-title">
        <div className="mb-4">
          <h2 id="recommendations-title" className="text-xl font-semibold">Detailed recommendations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use these findings to make focused improvements to your application.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <ResultList title="Strengths" description="Relevant qualifications already working in your favor." items={result.strengths} />
          <ResultList title="Missing keywords" description="Important terms from the job description not clearly represented." items={result.missingKeywords} />
          <ResultList title="Skill gaps" description="Capabilities the role requests that need stronger evidence." items={result.skillGaps} />
          <ResultList title="Resume bullet suggestions" description="Ways to make your existing experience more specific and relevant." items={result.bulletSuggestions} />
        </div>
      </section>

      <ResultList title="Action plan" description="The highest-priority steps to strengthen this application." items={result.actionPlan} />
    </section>
  );
}
