import { describe, expect, it } from "bun:test";
import {
  assertCaseTransition,
  assertFollowUpTransition,
  assertHandoffTransition,
  assertReviewTransition,
} from "./transitions";

describe("state transitions", () => {
  it("allows valid case transitions", () => {
    expect(() => assertCaseTransition("open", "needs_review")).not.toThrow();
    expect(() => assertCaseTransition("needs_review", "resolved")).not.toThrow();
    expect(() => assertCaseTransition("resolved", "archived")).not.toThrow();
  });

  it("rejects invalid case transitions", () => {
    expect(() => assertCaseTransition("archived", "resolved")).toThrow("Invalid case transition");
  });

  it("validates handoff, review, and follow-up transitions", () => {
    expect(() => assertHandoffTransition("open", "accepted")).not.toThrow();
    expect(() => assertReviewTransition("pending", "completed")).not.toThrow();
    expect(() => assertFollowUpTransition("snoozed", "active")).not.toThrow();
    expect(() => assertReviewTransition("completed", "pending")).toThrow("Invalid review transition");
  });
});
