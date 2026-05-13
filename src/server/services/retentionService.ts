import type { CaseCard } from "../domain/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateRetentionExpiresAt(caseCard: CaseCard): string | null {
  if (!caseCard.resolvedAt) return null;
  const days = caseCard.isSensitive ? 30 : 90;
  return new Date(Date.parse(caseCard.resolvedAt) + days * DAY_MS).toISOString();
}
