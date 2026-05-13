import { describe, expect, it } from "bun:test";
import { AppealMemoryService } from "./appealMemoryService";
import { makeCase } from "../test/fixtures";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("AppealMemoryService", () => {
  it("finds retained resolved cases by target, author, thread, and category", async () => {
    const deps = makeRouteTestDeps();
    const service = new AppealMemoryService(deps.cases);
    await deps.cases.saveCase(
      makeCase({
        id: "case_resolved_1",
        title: "Prior appeal-risk removal",
        category: "Appeal risk",
        status: "resolved",
        targetId: "t1_alpha",
        relatedAuthor: "author_a",
        relatedThreadId: "t3_alpha",
        resolvedAt: "2026-05-13T00:00:00.000Z",
        summary: "Moderator-authored resolution summary",
      }),
    );

    const results = await service.findRelevantCases({
      subredditId: "sub1",
      targetId: "t1_alpha",
      relatedAuthor: "author_a",
      relatedThreadId: "t3_alpha",
      category: "Appeal risk",
    });

    expect(results).toEqual([
      {
        caseId: "case_resolved_1",
        title: "Prior appeal-risk removal",
        category: "Appeal risk",
        resolvedAt: "2026-05-13T00:00:00.000Z",
        summary: "Moderator-authored resolution summary",
        targetPermalink: "https://reddit.com/r/RelayTest/comments/post/_/comment",
      },
    ]);
  });
});
