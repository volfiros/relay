import { describe, expect, it } from "bun:test";
import { InMemoryRedis } from "../test/inMemoryRedis";
import { DEFAULT_SETTINGS, SettingsService } from "./settingsService";

describe("SettingsService", () => {
  it("returns defaults when no settings are saved", async () => {
    const service = new SettingsService(new InMemoryRedis());

    await expect(service.getSettings("sub1")).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("updates and validates retention values", async () => {
    const service = new SettingsService(new InMemoryRedis());

    await expect(service.updateSettings("sub1", { retentionDays: 120 })).resolves.toMatchObject({ retentionDays: 120 });
    await expect(service.updateSettings("sub1", { retentionDays: 0 })).rejects.toThrow(
      "retentionDays must be a positive integer",
    );
  });
});
