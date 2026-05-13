import { describe, expect, it } from "bun:test";
import { makeCase, makeFollowUp, makeHandoff, makeModeratorState, makeReview } from "../test/fixtures";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("CatchUpService", () => {
  it("returns all My Catch-Up sections", async () => {
    const deps = makeRouteTestDeps();
    await deps.moderatorStates.save(makeModeratorState({ lastCatchUpSeenAt: "2026-05-13T00:00:00.000Z" }));
    await deps.cases.saveCase(makeCase({ id: "case_review", assignedReviewerIds: ["mod_a"] }));
    await deps.cases.saveCase(makeCase({ id: "case_handoff", title: "Handoff case" }));
    await deps.cases.saveCase(makeCase({ id: "case_followup", title: "Follow-up case" }));
    await deps.cases.saveCase(
      makeCase({ id: "case_updated", title: "Updated case", updatedAt: "2026-05-13T05:00:00.000Z" }),
    );
    await deps.cases.saveCase(
      makeCase({ id: "case_stale", title: "Stale case", updatedAt: "2026-05-09T00:00:00.000Z" }),
    );
    await deps.cases.saveCase(makeCase({ id: "case_resolved", title: "Resolved case", status: "resolved" }));
    await deps.reviews.save(makeReview({ id: "review1", caseId: "case_review", requestedReviewerModId: "mod_a" }));
    await deps.handoffs.save(makeHandoff({ id: "handoff_to_me", caseId: "case_handoff", toModId: "mod_a" }));
    await deps.handoffs.save(makeHandoff({ id: "handoff_any", caseId: "case_handoff", toModId: null, toAnyAvailableMod: true }));
    await deps.followUps.save(makeFollowUp({ id: "followup1", caseId: "case_followup", ownerModId: "mod_a" }));

    const dto = await deps.catchUp.buildCatchUp({
      subredditId: "sub1",
      modId: "mod_a",
      now: "2026-05-13T12:00:00.000Z",
    });

    expect(dto.needsMyReview.map((item) => item.id)).toEqual(["review1"]);
    expect(dto.handoffsToMe.map((item) => item.id)).toEqual(["handoff_to_me"]);
    expect(dto.unassignedHandoffs.map((item) => item.id)).toEqual(["handoff_any"]);
    expect(dto.myFollowUps.map((item) => item.id)).toEqual(["followup1"]);
    expect(dto.updatedSinceLastSeen.map((item) => item.id)).toContain("case_updated");
    expect(dto.staleCases.map((item) => item.id)).toContain("case_stale");
    expect(dto.recentlyResolved.map((item) => item.id)).toContain("case_resolved");
  });
});
