import { describe, expect, it } from "bun:test";
import { makeRouteTestDeps, routeContext } from "../test/routeTestDeps";
import { createFollowUpRoute, updateFollowUpStatusRoute } from "./followupRoutes";

describe("follow-up routes", () => {
  it("creates, snoozes, and completes follow-ups", async () => {
    const deps = makeRouteTestDeps();

    const followUp = await createFollowUpRoute(deps, routeContext, {
      caseId: "case1",
      targetType: "comment",
      targetId: "t1_alpha",
      reason: "Check tomorrow",
      dueAt: null,
    });
    const snoozed = await updateFollowUpStatusRoute(deps, routeContext, followUp.id, "snoozed");
    const completed = await updateFollowUpStatusRoute(deps, routeContext, followUp.id, "completed");

    expect(followUp.status).toBe("active");
    expect(snoozed.status).toBe("snoozed");
    expect(completed.status).toBe("completed");
  });
});
