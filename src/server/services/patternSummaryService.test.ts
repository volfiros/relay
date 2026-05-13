import { describe, expect, it } from "bun:test";
import { PatternSummaryService } from "./patternSummaryService";
import { makeCase } from "../test/fixtures";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("PatternSummaryService", () => {
  it("summarizes repeated metadata patterns without enforcement recommendations", async () => {
    const deps = makeRouteTestDeps();
    const service = new PatternSummaryService(deps.cases);
    await deps.cases.saveCase(makeCase({ id: "case1", category: "Rule review", urgency: "high", assignedReviewerIds: ["mod_b"] }));
    await deps.cases.saveCase(makeCase({ id: "case2", category: "Rule review", urgency: "high", assignedReviewerIds: ["mod_b"] }));

    const rows = await service.summarize({
      subredditId: "sub1",
      from: "2026-05-13T00:00:00.000Z",
      to: "2026-05-13T23:59:59.000Z",
    });

    expect(rows).toContainEqual({
      kind: "category",
      label: "Rule review",
      count: 2,
      from: "2026-05-13T00:00:00.000Z",
      to: "2026-05-13T23:59:59.000Z",
    });
  });
});
