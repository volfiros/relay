export interface RelayRedis {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
  zAdd(key: string, members: Array<{ score: number; member: string }>): Promise<void>;
  zRem(key: string, members: string[]): Promise<void>;
  zRange(key: string, start: number, stop: number): Promise<string[]>;
  zRangeByScore(key: string, min: number, max: number): Promise<string[]>;
}
