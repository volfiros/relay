import { describe, expect, it } from "bun:test";
import { makeCase } from "../test/fixtures";
import { calculateRetentionExpiresAt } from "./retentionService";

describe("calculateRetentionExpiresAt", () => {
  it("expires ordinary resolved cases after 90 days", () => {
    expect(calculateRetentionExpiresAt(makeCase({ resolvedAt: "2026-05-13T00:00:00.000Z" }))).toBe(
      "2026-08-11T00:00:00.000Z",
    );
  });

  it("expires sensitive resolved cases after 30 days", () => {
    expect(
      calculateRetentionExpiresAt(makeCase({ resolvedAt: "2026-05-13T00:00:00.000Z", isSensitive: true })),
    ).toBe("2026-06-12T00:00:00.000Z");
  });

  it("does not expire unresolved cases", () => {
    expect(calculateRetentionExpiresAt(makeCase({ resolvedAt: null }))).toBeNull();
  });
});
