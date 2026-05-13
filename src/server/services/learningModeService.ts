import type { CaseCard } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";

export interface LearningModeCase {
  caseId: string;
  title: string;
  category: string;
  finalSummary: string;
  status: string;
  resolvedAt: string | null;
}

export class LearningModeService {
  constructor(private readonly cases: CaseRepository) {}

  async getResolvedCases(input: { subredditId: string; includeSensitive?: boolean }): Promise<Record<string, LearningModeCase[]>> {
    const ids = await this.cases.listCaseIdsByStatus(input.subredditId, "resolved");
    const cases = (await Promise.all(ids.map((id) => this.cases.getCase(input.subredditId, id))))
      .filter((caseCard): caseCard is CaseCard => Boolean(caseCard))
      .filter((caseCard) => input.includeSensitive || !caseCard.isSensitive);

    return cases.reduce<Record<string, LearningModeCase[]>>((grouped, caseCard) => {
      grouped[caseCard.category] ??= [];
      grouped[caseCard.category].push({
        caseId: caseCard.id,
        title: caseCard.title,
        category: caseCard.category,
        finalSummary: caseCard.summary,
        status: caseCard.status,
        resolvedAt: caseCard.resolvedAt,
      });
      return grouped;
    }, {});
  }
}
