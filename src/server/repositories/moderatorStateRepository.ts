import type { ModeratorState } from "../domain/types";
import { keys } from "./keys";
import type { RelayRedis } from "./redisTypes";

export class ModeratorStateRepository {
  constructor(private readonly redis: RelayRedis) {}

  async save(state: ModeratorState): Promise<void> {
    await this.redis.set(keys.modstate(state.subredditId, state.modId), JSON.stringify(state));
  }

  async get(subredditId: string, modId: string): Promise<ModeratorState | null> {
    const value = await this.redis.get(keys.modstate(subredditId, modId));
    return value ? (JSON.parse(value) as ModeratorState) : null;
  }
}
