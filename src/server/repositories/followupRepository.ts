import type { FollowUp } from "../domain/types";
import { keys } from "./keys";
import type { RelayRedis } from "./redisTypes";

export class FollowUpRepository {
  constructor(private readonly redis: RelayRedis) {}

  async save(followUp: FollowUp): Promise<void> {
    await this.redis.set(keys.followup(followUp.subredditId, followUp.id), JSON.stringify(followUp));
    await this.redis.zAdd(keys.followupsByOwner(followUp.subredditId, followUp.ownerModId), [
      { score: Date.parse(followUp.updatedAt), member: followUp.id },
    ]);
    await this.redis.zAdd(keys.followupsByTarget(followUp.subredditId, followUp.targetId), [
      { score: Date.parse(followUp.updatedAt), member: followUp.id },
    ]);
  }

  async get(subredditId: string, followUpId: string): Promise<FollowUp | null> {
    const value = await this.redis.get(keys.followup(subredditId, followUpId));
    return value ? (JSON.parse(value) as FollowUp) : null;
  }

  async listFollowUpIdsForOwner(subredditId: string, modId: string): Promise<string[]> {
    return this.redis.zRange(keys.followupsByOwner(subredditId, modId), 0, -1);
  }

  async listFollowUpIdsForTarget(subredditId: string, targetId: string): Promise<string[]> {
    return this.redis.zRange(keys.followupsByTarget(subredditId, targetId), 0, -1);
  }
}
