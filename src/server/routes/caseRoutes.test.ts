import { describe, expect, it } from "bun:test";
import { makeRouteTestDeps, routeContext } from "../test/routeTestDeps";
import { createCaseRoute, getCaseRoute, updateCaseStatusRoute } from "./caseRoutes";

describe("case routes", () => {
  it("creates, reads, and resolves cases with audit events", async () => {
    const deps = makeRouteTestDeps();

    const created = await createCaseRoute(deps, routeContext, {
      targetType: "comment",
      targetId: "t1_alpha",
      targetPermalink: "https://reddit.com/r/test/comments/a/_/b",
      targetAuthor: "author_a",
      title: "Borderline rule 2 comment",
      category: "rule_review",
      status: "open",
      urgency: "normal",
      summary: "Comment needs a second look.",
      isSensitive: false,
    });
    const loaded = await getCaseRoute(deps, routeContext, created.caseCard.id);
    const resolved = await updateCaseStatusRoute(deps, routeContext, created.caseCard.id, "resolved");
    const eventIds = await deps.events.listEventIdsForCase("sub1", created.caseCard.id);

    expect(created.eventHistoryIncomplete).toBe(false);
    expect(loaded.title).toBe("Borderline rule 2 comment");
    expect(resolved.status).toBe("resolved");
    expect(resolved.retentionExpiresAt).not.toBeNull();
    expect(eventIds).toHaveLength(2);
  });
});
