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
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_-35px_rgba(79,70,229,0.45)] backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-100/70 via-blue-50/50 to-violet-100/70" />
      <div className="relative grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 border-indigo-100 bg-white text-center shadow-lg shadow-indigo-100/70">
          <span className="text-3xl font-bold tracking-tight">{score}</span>
          <span className="text-sm font-medium text-muted-foreground">/ 100</span>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Match Score</p>
          <h3 className="mt-2 text-2xl font-bold">{matchLabel}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Based on skills, experience, projects, and keyword coverage.
          </p>
        </div>
      </div>
    </section>
  );
}
