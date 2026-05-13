import type { HandoffNote } from "../domain/types";
import { keys } from "./keys";
import type { RelayRedis } from "./redisTypes";

export class HandoffRepository {
  constructor(private readonly redis: RelayRedis) {}

  async save(handoff: HandoffNote): Promise<void> {
    await this.redis.set(keys.handoff(handoff.subredditId, handoff.id), JSON.stringify(handoff));
    const score = Date.parse(handoff.updatedAt);
    if (handoff.toModId) {
      await this.redis.zAdd(keys.handoffsByRecipient(handoff.subredditId, handoff.toModId), [
        { score, member: handoff.id },
      ]);
    }
    if (handoff.toAnyAvailableMod) {
      await this.redis.zAdd(keys.handoffsUnassigned(handoff.subredditId), [{ score, member: handoff.id }]);
    }
  }

  async get(subredditId: string, handoffId: string): Promise<HandoffNote | null> {
    const value = await this.redis.get(keys.handoff(subredditId, handoffId));
    return value ? (JSON.parse(value) as HandoffNote) : null;
  }

  async listHandoffIdsForRecipient(subredditId: string, modId: string): Promise<string[]> {
    return this.redis.zRange(keys.handoffsByRecipient(subredditId, modId), 0, -1);
  }

  async listUnassignedHandoffIds(subredditId: string): Promise<string[]> {
    return this.redis.zRange(keys.handoffsUnassigned(subredditId), 0, -1);
  }
}
