import type { Urgency } from "../domain/types";
import { keys } from "../repositories/keys";
import type { RelayRedis } from "../repositories/redisTypes";

export interface RelaySettings {
  caseCategories: string[];
  handoffCategories: string[];
  defaultUrgency: Urgency;
  retentionDays: number;
  sensitiveRetentionDays: number;
  secondReviewEnabled: boolean;
  unassignedHandoffsEnabled: boolean;
  personalFilters: {
    showUnassignedHandoffs: boolean;
    showStaleCases: boolean;
    compactMode: boolean;
  };
}

export const DEFAULT_SETTINGS: RelaySettings = {
  caseCategories: ["Rule review", "Appeal risk", "Recurring behavior", "Sensitive thread"],
  handoffCategories: ["Needs action", "Needs context", "Watch only"],
  defaultUrgency: "normal",
  retentionDays: 90,
  sensitiveRetentionDays: 30,
  secondReviewEnabled: true,
  unassignedHandoffsEnabled: true,
  personalFilters: {
    showUnassignedHandoffs: true,
    showStaleCases: true,
    compactMode: false,
  },
};

export class SettingsService {
  constructor(private readonly redis: RelayRedis) {}

  async getSettings(subredditId: string): Promise<RelaySettings> {
    const value = await this.redis.get(keys.settings(subredditId));
    if (!value) return DEFAULT_SETTINGS;
    return mergeSettings(JSON.parse(value) as Partial<RelaySettings>);
  }

  async updateSettings(subredditId: string, patch: Partial<RelaySettings>): Promise<RelaySettings> {
    const next = mergeSettings({ ...(await this.getSettings(subredditId)), ...patch });
    validateRetention(next.retentionDays, "retentionDays");
    validateRetention(next.sensitiveRetentionDays, "sensitiveRetentionDays");
    await this.redis.set(keys.settings(subredditId), JSON.stringify(next));
    return next;
  }
}

function mergeSettings(value: Partial<RelaySettings>): RelaySettings {
  return {
    ...DEFAULT_SETTINGS,
    ...value,
    personalFilters: {
      ...DEFAULT_SETTINGS.personalFilters,
      ...value.personalFilters,
    },
  };
}

function validateRetention(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
}
