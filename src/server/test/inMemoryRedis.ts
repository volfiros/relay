import type { RelayRedis } from "../repositories/redisTypes";

export class InMemoryRedis implements RelayRedis {
  private values = new Map<string, string>();
  private sortedSets = new Map<string, Map<string, number>>();

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.values.delete(key);
    this.sortedSets.delete(key);
  }

  async zAdd(key: string, members: Array<{ score: number; member: string }>): Promise<void> {
    const set = this.sortedSets.get(key) ?? new Map<string, number>();
    for (const item of members) {
      set.set(item.member, item.score);
    }
    this.sortedSets.set(key, set);
  }

  async zRem(key: string, members: string[]): Promise<void> {
    const set = this.sortedSets.get(key);
    if (!set) return;
    for (const member of members) {
      set.delete(member);
    }
  }

  async zRange(key: string, start: number, stop: number): Promise<string[]> {
    const values = [...(this.sortedSets.get(key)?.entries() ?? [])]
      .sort((a, b) => a[1] - b[1])
      .map(([member]) => member);
    const normalizedStop = stop < 0 ? values.length + stop : stop;
    return values.slice(start, normalizedStop + 1);
  }

  async zRangeByScore(key: string, min: number, max: number): Promise<string[]> {
    return [...(this.sortedSets.get(key)?.entries() ?? [])]
      .filter(([, score]) => score >= min && score <= max)
      .sort((a, b) => a[1] - b[1])
      .map(([member]) => member);
  }
}
