import { describe, expect, it } from "bun:test";
import {
  CASE_STATUSES,
  FOLLOWUP_STATUSES,
  HANDOFF_STATUSES,
  REVIEW_DECISIONS,
  REVIEW_STATUSES,
  TARGET_TYPES,
  URGENCIES,
} from "./types";

describe("Relay domain constants", () => {
  it("matches the MVP case statuses from the spec", () => {
    expect(CASE_STATUSES).toEqual(["open", "watching", "needs_review", "handed_off", "resolved", "archived"]);
  });

  it("matches the MVP target and workflow constants", () => {
    expect(TARGET_TYPES).toEqual(["post", "comment", "user", "thread", "modmail", "other"]);
    expect(URGENCIES).toEqual(["low", "normal", "high", "urgent"]);
    expect(HANDOFF_STATUSES).toEqual(["open", "read", "accepted", "resolved", "archived"]);
    expect(REVIEW_STATUSES).toEqual(["pending", "in_review", "completed", "canceled"]);
    expect(REVIEW_DECISIONS).toEqual(["agree", "disagree", "needs_more_context", "no_action", "escalate"]);
    expect(FOLLOWUP_STATUSES).toEqual(["active", "snoozed", "completed", "canceled"]);
  });
});
