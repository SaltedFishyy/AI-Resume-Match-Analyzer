type ScoreCardProps = {
  score: number;
};

function getMatchLabel(score: number) {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Moderate match";
  if (score >= 40) return "Partial match";
  return "Low match";
}

export function ScoreCard({ score }: ScoreCardProps) {
  const matchLabel = getMatchLabel(score);

  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 border-blue-100 bg-blue-50 text-center">
          <span className="text-3xl font-bold tracking-tight">{score}</span>
          <span className="text-sm font-medium text-muted-foreground">/ 100</span>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Overall match</p>
          <h3 className="mt-2 text-2xl font-bold">{matchLabel}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This score is based on your skills, relevant experience, projects, and keyword coverage for this role.
          </p>
        </div>
      </div>
    </section>
  );
}
