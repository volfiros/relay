import { describe, expect, it } from "bun:test";
import { makeRouteTestDeps, routeContext } from "../test/routeTestDeps";
import { createHandoffRoute, updateHandoffStatusRoute } from "./handoffRoutes";

describe("handoff routes", () => {
  it("creates future-me and any-mod handoffs and resolves them", async () => {
    const deps = makeRouteTestDeps();

    const futureMe = await createHandoffRoute(deps, routeContext, {
      caseId: "case1",
      targetType: "comment",
      targetId: "t1_alpha",
      recipientType: "future_me",
      requestedAction: "Review later",
      body: "Check this again tomorrow.",
      urgency: "normal",
      dueAt: null,
    });
    const anyMod = await createHandoffRoute(deps, routeContext, {
      caseId: "case1",
      targetType: "comment",
      targetId: "t1_alpha",
      recipientType: "any_available_mod",
      requestedAction: "Second look",
      body: "Need another mod.",
      urgency: "high",
      dueAt: null,
    });
    const resolved = await updateHandoffStatusRoute(deps, routeContext, futureMe.id, "resolved");

    expect(futureMe.toSelf).toBe(true);
    expect(anyMod.toAnyAvailableMod).toBe(true);
    expect(resolved.status).toBe("resolved");
  });
});
