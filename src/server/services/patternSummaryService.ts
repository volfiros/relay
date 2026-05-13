import type { CaseCard } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";

export interface PatternSummaryRow {
  kind: "category" | "author" | "thread" | "urgency" | "reviewer";
  label: string;
  count: number;
  from: string;
  to: string;
}

export class PatternSummaryService {
  constructor(private readonly cases: CaseRepository) {}

  async summarize(input: { subredditId: string; from: string; to: string }): Promise<PatternSummaryRow[]> {
    const ids = await this.cases.listRecentlyUpdatedCaseIds(input.subredditId, 500);
    const cases = (await Promise.all(ids.map((id) => this.cases.getCase(input.subredditId, id))))
      .filter((caseCard): caseCard is CaseCard => Boolean(caseCard))
      .filter((caseCard) => caseCard.updatedAt >= input.from && caseCard.updatedAt <= input.to);
    const counters = new Map<string, PatternSummaryRow>();

    for (const caseCard of cases) {
      count(counters, "category", caseCard.category, input);
      count(counters, "urgency", caseCard.urgency, input);
      if (caseCard.relatedAuthor) count(counters, "author", caseCard.relatedAuthor, input);
      if (caseCard.relatedThreadId) count(counters, "thread", caseCard.relatedThreadId, input);
      for (const reviewerId of caseCard.assignedReviewerIds) count(counters, "reviewer", reviewerId, input);
    }

    return [...counters.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }
}

function count(
  counters: Map<string, PatternSummaryRow>,
  kind: PatternSummaryRow["kind"],
  label: string,
  range: { from: string; to: string },
): void {
  const key = `${kind}:${label}`;
  const existing = counters.get(key);
  if (existing) {
    existing.count += 1;
    return;
  }
  counters.set(key, { kind, label, count: 1, from: range.from, to: range.to });
}
