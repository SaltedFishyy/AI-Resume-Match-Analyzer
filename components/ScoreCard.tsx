export function ScoreCard({ score }: { score: number }) {
  return <div className="rounded-lg border bg-white p-6"><p className="text-sm text-muted-foreground">Overall match</p><p className="mt-2 text-4xl font-bold">{score}%</p></div>;
}
