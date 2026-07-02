import { ScoreCard } from "@/components/ScoreCard";

export type AnalysisResultData = {
  matchScore: number;
  strengths: string[];
  missingKeywords: string[];
  skillGaps: string[];
  bulletSuggestions: string[];
  actionPlan: string[];
};

export function AnalysisResult({ result }: { result: AnalysisResultData }) {
  return <section className="grid gap-6"><ScoreCard score={result.matchScore} /></section>;
}
