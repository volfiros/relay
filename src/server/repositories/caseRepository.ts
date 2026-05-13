import type { CaseCard } from "../domain/types";
import { keys } from "./keys";
import type { RelayRedis } from "./redisTypes";

export class CaseRepository {
  constructor(private readonly redis: RelayRedis) {}

  async saveCase(caseCard: CaseCard): Promise<void> {
    const existing = await this.getCase(caseCard.subredditId, caseCard.id);
    if (existing) {
      await this.removeIndexes(existing);
    }

    await this.redis.set(keys.case(caseCard.subredditId, caseCard.id), JSON.stringify(caseCard));
    await this.addIndexes(caseCard);
  }

  async getCase(subredditId: string, caseId: string): Promise<CaseCard | null> {
    const value = await this.redis.get(keys.case(subredditId, caseId));
    return value ? (JSON.parse(value) as CaseCard) : null;
  }

  async listCaseIdsByTarget(subredditId: string, targetId: string): Promise<string[]> {
    return this.redis.zRange(keys.caseByTarget(subredditId, targetId), 0, -1);
  }

  async listCaseIdsByAuthor(subredditId: string, authorKey: string): Promise<string[]> {
    return this.redis.zRange(keys.caseByAuthor(subredditId, authorKey), 0, -1);
  }

  async listCaseIdsByOwner(subredditId: string, modId: string): Promise<string[]> {
    return this.redis.zRange(keys.caseByOwner(subredditId, modId), 0, -1);
  }

  async listRecentlyUpdatedCaseIds(subredditId: string, limit: number): Promise<string[]> {
    const ids = await this.redis.zRange(keys.casesUpdated(subredditId), 0, -1);
    return ids.reverse().slice(0, limit);
  }

  async listCaseIdsByStatus(subredditId: string, status: CaseCard["status"]): Promise<string[]> {
    return this.redis.zRange(keys.caseByStatus(subredditId, status), 0, -1);
  }

  private async addIndexes(caseCard: CaseCard): Promise<void> {
    const score = Date.parse(caseCard.updatedAt);
    const member = caseCard.id;
    await this.redis.zAdd(keys.caseByStatus(caseCard.subredditId, caseCard.status), [{ score, member }]);
    await this.redis.zAdd(keys.caseByCreator(caseCard.subredditId, caseCard.creatorModId), [{ score, member }]);
    await this.redis.zAdd(keys.caseByOwner(caseCard.subredditId, caseCard.ownerModId), [{ score, member }]);
    await this.redis.zAdd(keys.caseByTarget(caseCard.subredditId, caseCard.targetId), [{ score, member }]);
    await this.redis.zAdd(keys.casesUpdated(caseCard.subredditId), [{ score, member }]);

    if (caseCard.relatedAuthor) {
      await this.redis.zAdd(keys.caseByAuthor(caseCard.subredditId, caseCard.relatedAuthor), [{ score, member }]);
    }

    for (const reviewerId of caseCard.assignedReviewerIds) {
      await this.redis.zAdd(keys.caseByReviewer(caseCard.subredditId, reviewerId), [{ score, member }]);
    }
  }

  private async removeIndexes(caseCard: CaseCard): Promise<void> {
    const member = caseCard.id;
    await this.redis.zRem(keys.caseByStatus(caseCard.subredditId, caseCard.status), [member]);
    await this.redis.zRem(keys.caseByCreator(caseCard.subredditId, caseCard.creatorModId), [member]);
    await this.redis.zRem(keys.caseByOwner(caseCard.subredditId, caseCard.ownerModId), [member]);
    await this.redis.zRem(keys.caseByTarget(caseCard.subredditId, caseCard.targetId), [member]);
    await this.redis.zRem(keys.casesUpdated(caseCard.subredditId), [member]);

    if (caseCard.relatedAuthor) {
      await this.redis.zRem(keys.caseByAuthor(caseCard.subredditId, caseCard.relatedAuthor), [member]);
    }

    for (const reviewerId of caseCard.assignedReviewerIds) {
      await this.redis.zRem(keys.caseByReviewer(caseCard.subredditId, reviewerId), [member]);
    }
  }
}
