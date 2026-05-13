import type { CaseCard } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";

const ACTIVE_DUPLICATE_STATUSES = new Set(["open", "watching", "needs_review", "handed_off"]);

export class DuplicateCaseService {
  constructor(private readonly cases: CaseRepository) {}

  async findOpenDuplicates(subredditId: string, targetId: string): Promise<CaseCard[]> {
    const ids = await this.cases.listCaseIdsByTarget(subredditId, targetId);
    const loaded = await Promise.all(ids.map((id) => this.cases.getCase(subredditId, id)));
    return loaded.filter((caseCard): caseCard is CaseCard => {
      return Boolean(caseCard && ACTIVE_DUPLICATE_STATUSES.has(caseCard.status));
    });
  }
}
