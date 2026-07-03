import { ScoreCard } from "@/components/ScoreCard";
import type { AnalysisResultData } from "@/lib/validators";

type ResultListProps = {
  title: string;
  items: string[];
};

function ResultList({ title, items }: ResultListProps) {
  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No items identified.</p>
      )}
    </section>
  );
}

export function AnalysisResult({ result }: { result: AnalysisResultData }) {
  return (
    <section className="mt-10 space-y-6" aria-live="polite">
      <h2 className="text-2xl font-bold">Your analysis</h2>
      <ScoreCard score={result.matchScore} />
      <div className="grid gap-6 md:grid-cols-2">
        <ResultList title="Strengths" items={result.strengths} />
        <ResultList title="Missing keywords" items={result.missingKeywords} />
        <ResultList title="Skill gaps" items={result.skillGaps} />
        <ResultList title="Resume bullet suggestions" items={result.bulletSuggestions} />
      </div>
      <ResultList title="Action plan" items={result.actionPlan} />
    </section>
  );
}
