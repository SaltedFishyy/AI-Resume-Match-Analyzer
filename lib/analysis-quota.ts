import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const DAILY_ANALYSIS_LIMIT = 20;
export const DAILY_ANALYSIS_LIMIT_REACHED_MESSAGE = "Daily analysis limit reached. Please try again tomorrow.";

export class DailyAnalysisLimitReachedError extends Error {
  constructor() {
    super(DAILY_ANALYSIS_LIMIT_REACHED_MESSAGE);
    this.name = "DailyAnalysisLimitReachedError";
  }
}

export function getUtcDayBucket(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function consumeDailyAnalysisQuota(userId: string) {
  const usageRows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "DailyAnalysisUsage" ("id", "userId", "day", "count", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${userId}, ${getUtcDayBucket()}, 1, NOW(), NOW())
    ON CONFLICT ("userId", "day")
    DO UPDATE SET
      "count" = "DailyAnalysisUsage"."count" + 1,
      "updatedAt" = NOW()
    WHERE "DailyAnalysisUsage"."count" < ${DAILY_ANALYSIS_LIMIT}
    RETURNING "count"
  `;

  if (usageRows.length === 0) {
    throw new DailyAnalysisLimitReachedError();
  }

  return usageRows[0].count;
}
