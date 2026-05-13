import type { CaseEvent } from "../domain/types";
import { keys } from "./keys";
import type { RelayRedis } from "./redisTypes";

export class CaseEventRepository {
  constructor(private readonly redis: RelayRedis) {}

  async save(event: CaseEvent): Promise<void> {
    await this.redis.set(keys.caseEvent(event.subredditId, event.caseId, event.id), JSON.stringify(event));
    await this.redis.zAdd(keys.eventsByCase(event.subredditId, event.caseId), [
      { score: Date.parse(event.createdAt), member: event.id },
    ]);
  }

  async get(subredditId: string, caseId: string, eventId: string): Promise<CaseEvent | null> {
    const value = await this.redis.get(keys.caseEvent(subredditId, caseId, eventId));
    return value ? (JSON.parse(value) as CaseEvent) : null;
  }

  async listEventIdsForCase(subredditId: string, caseId: string): Promise<string[]> {
    return this.redis.zRange(keys.eventsByCase(subredditId, caseId), 0, -1);
  }
}
