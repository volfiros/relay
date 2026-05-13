import { describe, expect, it } from "bun:test";
import { keys } from "./keys";

describe("Redis key conventions", () => {
  it("builds object and index keys from the design spec", () => {
    expect(keys.case("sub1", "case1")).toBe("case:sub1:case1");
    expect(keys.caseByStatus("sub1", "open")).toBe("idx:cases:subreddit:sub1:status:open");
    expect(keys.caseByTarget("sub1", "t3_post")).toBe("idx:cases:subreddit:sub1:target:t3_post");
    expect(keys.handoffsUnassigned("sub1")).toBe("idx:handoffs:subreddit:sub1:unassigned");
    expect(keys.eventsByCase("sub1", "case1")).toBe("idx:events:subreddit:sub1:case:case1");
  });
});
