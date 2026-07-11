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
    <section className="surface-card relative overflow-hidden rounded-3xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-blue-100/70 via-white to-violet-100/60" />
      <div className="relative grid gap-8 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#2563eb_0_var(--score),#dbeafe_var(--score)_100%)] p-3 shadow-xl shadow-blue-100" style={{ "--score": `${score}%` } as React.CSSProperties}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="text-4xl font-black tracking-tight text-slate-950">{score}</span>
          <span className="text-sm font-medium text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div>
          <p className="eyebrow">Overall match score</p>
          <h3 className="mt-2 text-3xl font-black text-slate-950">{matchLabel}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Based on skills, experience, projects, and keyword coverage.
          </p>
        </div>
      </div>
    </section>
  );
}
