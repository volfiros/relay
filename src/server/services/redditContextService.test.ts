import { describe, expect, it } from "bun:test";
import { RedditContextService } from "./redditContextService";

describe("RedditContextService", () => {
  it("returns available post context with missing flags", async () => {
    const service = new RedditContextService({
      async getTarget() {
        return {
          targetPermalink: "https://reddit.com/r/test/comments/a",
          targetSummary: "Questionable post",
          targetAuthor: "author_a",
        };
      },
    });

    const context = await service.getContext({ targetType: "post", targetId: "t3_alpha" });

    expect(context.targetSummary).toBe("Questionable post");
    expect(context.missingContextFlags).toContain("report_context_unavailable");
    expect(context.missingContextFlags).toContain("thread_context_unavailable");
  });

  it("adds parent missing flag for comments without parent context", async () => {
    const service = new RedditContextService({ async getTarget() { return {}; } });

    const context = await service.getContext({ targetType: "comment", targetId: "t1_alpha" });

    expect(context.missingContextFlags).toContain("parent_context_unavailable");
  });
});
