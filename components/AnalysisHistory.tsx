export type HistoryAnalysis = {
  id: string;
  matchScore: number;
  jobDescription: string;
  missingKeywords: string[];
  createdAt: Date;
};

type AnalysisHistoryProps = {
  analyses: HistoryAnalysis[];
  error?: string;
};

function getJobPreview(jobDescription: string) {
  const normalized = jobDescription.replace(/\s+/g, " ").trim();
  return normalized.length > 180 ? `${normalized.slice(0, 180)}…` : normalized;
}

export function AnalysisHistory({ analyses, error }: AnalysisHistoryProps) {
  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
        You have not saved any analyses yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis) => (
        <article key={analysis.id} className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-2xl font-bold">{analysis.matchScore}% match</p>
            <time className="text-sm text-muted-foreground" dateTime={analysis.createdAt.toISOString()}>
              {analysis.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{getJobPreview(analysis.jobDescription)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.missingKeywords.slice(0, 3).map((keyword) => (
              <span key={keyword} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {keyword}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
