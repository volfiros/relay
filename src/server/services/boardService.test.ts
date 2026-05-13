import { describe, expect, it } from "bun:test";
import { BoardService } from "./boardService";
import { makeCase, makeFollowUp, makeHandoff, makeReview } from "../test/fixtures";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("BoardService", () => {
  it("aggregates existing MVP objects without generic tasks", async () => {
    const deps = makeRouteTestDeps();
    const service = new BoardService(deps.cases, deps.reviews, deps.handoffs, deps.followUps);

    await deps.cases.saveCase(makeCase({ id: "case_open", status: "open", urgency: "urgent" }));
    await deps.cases.saveCase(makeCase({ id: "case_review", status: "needs_review", assignedReviewerIds: ["mod_b"] }));
    await deps.reviews.save(makeReview({ id: "review_any", caseId: "case_review", requestedReviewerModId: null, anyReviewer: true }));
    await deps.handoffs.save(
      makeHandoff({ id: "handoff_stale", caseId: "case_open", toModId: null, toAnyAvailableMod: true, updatedAt: "2026-05-12T00:00:00.000Z" }),
    );
    await deps.followUps.save(makeFollowUp({ id: "followup_active", caseId: "case_open", targetId: "t1_comment" }));

    const board = await service.buildBoard({ subredditId: "sub1", now: "2026-05-13T12:00:00.000Z" });

    expect(board.openCases.map((item) => item.id)).toEqual(["case_open", "case_review"]);
    expect(board.pendingReviews.map((item) => item.id)).toEqual(["review_any"]);
    expect(board.staleHandoffs.map((item) => item.id)).toEqual(["handoff_stale"]);
    expect(board.activeFollowUps.map((item) => item.id)).toEqual(["followup_active"]);
    expect(board.activitySummary).toEqual({
      openCaseCount: 2,
      pendingReviewCount: 1,
      staleHandoffCount: 1,
      activeFollowUpCount: 1,
    });
  });

  it("filters board cases by owner and reviewer", async () => {
    const deps = makeRouteTestDeps();
    const service = new BoardService(deps.cases, deps.reviews, deps.handoffs, deps.followUps);

    await deps.cases.saveCase(makeCase({ id: "case_a", ownerModId: "mod_a", assignedReviewerIds: ["mod_b"] }));
    await deps.cases.saveCase(makeCase({ id: "case_c", ownerModId: "mod_c", assignedReviewerIds: ["mod_d"] }));

    const board = await service.buildBoard({
      subredditId: "sub1",
      now: "2026-05-13T12:00:00.000Z",
      filters: { ownerModId: "mod_a", reviewerModId: "mod_b" },
    });

    expect(board.openCases.map((item) => item.id)).toEqual(["case_a"]);
  });
});
