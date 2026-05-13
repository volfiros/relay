import { afterEach, describe, expect, it } from "bun:test";
import {
  DEMO_PRIMARY_MOD_ID,
  DEMO_REVIEWER_MOD_ID,
  DEMO_SUBREDDIT_ID,
  DEMO_SUBREDDIT_NAME,
  seedDemoData,
} from "./seedDemoData";
import { getDecisionBriefRoute } from "../routes/decisionBriefRoutes";
import { assertDemoRoutesEnabled, seedDemoRoute } from "../routes/devRoutes";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("demo scenarios", () => {
  afterEach(() => {
    delete process.env.RELAY_DEMO_ROUTES;
  });

  it("seeds every required demo scenario", async () => {
    const deps = makeRouteTestDeps();

    const result = await seedDemoData(deps);

    expect(result.scenarioIds).toEqual([
      "borderline-review",
      "any-mod-handoff",
      "heated-thread-followup",
      "duplicate-target",
      "deleted-target",
      "stale-followup",
      "resolved-prior-history",
    ]);
    expect(result.caseIds).toContain("case_borderline_review");
    expect(result.handoffIds).toContain("handoff_any_mod");
    expect(result.reviewIds).toContain("review_borderline");
    expect(result.followUpIds).toContain("followup_stale");
  });

  it("surfaces seeded demo records in My Catch-Up", async () => {
    const deps = makeRouteTestDeps();
    await seedDemoData(deps);

    const reviewerCatchUp = await deps.catchUp.buildCatchUp({
      subredditId: DEMO_SUBREDDIT_ID,
      modId: DEMO_REVIEWER_MOD_ID,
      now: "2026-05-13T12:00:00.000Z",
    });
    const primaryCatchUp = await deps.catchUp.buildCatchUp({
      subredditId: DEMO_SUBREDDIT_ID,
      modId: DEMO_PRIMARY_MOD_ID,
      now: "2026-05-13T12:00:00.000Z",
    });

    expect(reviewerCatchUp.needsMyReview.map((item) => item.id)).toContain("review_borderline");
    expect(primaryCatchUp.unassignedHandoffs.map((item) => item.id)).toContain("handoff_any_mod");
    expect(primaryCatchUp.myFollowUps.map((item) => item.id)).toContain("followup_heated_thread");
    expect(primaryCatchUp.staleCases.map((item) => item.id)).toContain("case_stale_followup");
  });

  it("surfaces duplicate and prior history in Decision Brief", async () => {
    const deps = makeRouteTestDeps({
      async getTarget({ targetId }) {
        return {
          targetPermalink: `https://reddit.com/r/RelayDemo/comments/${targetId}`,
          targetSummary: "Seeded target",
          targetAuthor: "demo_author",
        };
      },
    });
    await seedDemoData(deps);

    const duplicateBrief = await getDecisionBriefRoute(
      deps,
      { subredditId: DEMO_SUBREDDIT_ID, subredditName: DEMO_SUBREDDIT_NAME, modId: DEMO_PRIMARY_MOD_ID },
      { targetType: "comment", targetId: "t1_duplicate_target" },
    );
    const priorBrief = await getDecisionBriefRoute(
      deps,
      { subredditId: DEMO_SUBREDDIT_ID, subredditName: DEMO_SUBREDDIT_NAME, modId: DEMO_PRIMARY_MOD_ID },
      { targetType: "comment", targetId: "t1_resolved_prior_history" },
    );

    expect(duplicateBrief.duplicateWarning).toEqual({
      caseId: "case_duplicate_target",
      title: "Existing open case for duplicate warning",
      status: "open",
    });
    expect(priorBrief.priorCases.map((caseRef) => caseRef.id)).toContain("case_resolved_prior_history");
  });

  it("guards demo routes behind an environment flag", async () => {
    const deps = makeRouteTestDeps();

    expect(() => assertDemoRoutesEnabled()).toThrow("Demo routes disabled");
    process.env.RELAY_DEMO_ROUTES = "enabled";
    const result = await seedDemoRoute(deps);
    expect(result.scenarioIds).toContain("borderline-review");
  });
});
