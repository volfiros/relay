import type { CaseCard } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";

export interface AppealMemoryResult {
  caseId: string;
  title: string;
  category: string;
  resolvedAt: string | null;
  summary: string;
  targetPermalink: string;
}

export class AppealMemoryService {
  constructor(private readonly cases: CaseRepository) {}

  async findRelevantCases(input: {
    subredditId: string;
    targetId?: string;
    relatedAuthor?: string;
    relatedThreadId?: string;
    category?: string;
  }): Promise<AppealMemoryResult[]> {
    const ids = new Set<string>();
    if (input.targetId) {
      for (const id of await this.cases.listCaseIdsByTarget(input.subredditId, input.targetId)) ids.add(id);
    }
    if (input.relatedAuthor) {
      for (const id of await this.cases.listCaseIdsByAuthor(input.subredditId, input.relatedAuthor)) ids.add(id);
    }
    for (const status of ["resolved", "archived"] as const) {
      for (const id of await this.cases.listCaseIdsByStatus(input.subredditId, status)) ids.add(id);
    }

    const loaded = await Promise.all([...ids].map((id) => this.cases.getCase(input.subredditId, id)));
    return loaded
      .filter((caseCard): caseCard is CaseCard => Boolean(caseCard))
      .filter((caseCard) => caseCard.status === "resolved" || caseCard.status === "archived")
      .filter((caseCard) => !caseCard.retentionExpiresAt || caseCard.retentionExpiresAt > new Date().toISOString())
      .filter((caseCard) => !input.relatedThreadId || caseCard.relatedThreadId === input.relatedThreadId)
      .filter((caseCard) => !input.category || caseCard.category === input.category)
      .map((caseCard) => ({
        caseId: caseCard.id,
        title: caseCard.title,
        category: caseCard.category,
        resolvedAt: caseCard.resolvedAt,
        summary: caseCard.summary,
        targetPermalink: caseCard.targetPermalink,
      }));
  }
}
