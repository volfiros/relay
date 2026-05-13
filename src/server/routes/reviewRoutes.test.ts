import { describe, expect, it } from "bun:test";
import { makeRouteTestDeps, routeContext } from "../test/routeTestDeps";
import { completeReviewRoute, createReviewRoute } from "./reviewRoutes";

describe("review routes", () => {
  it("creates any-reviewer requests and completes them", async () => {
    const deps = makeRouteTestDeps();

    const review = await createReviewRoute(deps, routeContext, {
      caseId: "case1",
      question: "Does this need removal?",
      category: "Rule review",
    });
    const completed = await completeReviewRoute(deps, routeContext, review.id, {
      decision: "needs_more_context",
      reviewerComment: "Thread context is incomplete.",
    });

    expect(review.anyReviewer).toBe(true);
    expect(completed.status).toBe("completed");
    expect(completed.decision).toBe("needs_more_context");
  });

  it("requires a decision or comment to complete review", async () => {
    const deps = makeRouteTestDeps();
    const review = await createReviewRoute(deps, routeContext, {
      caseId: "case1",
      question: "Does this need removal?",
      category: "Rule review",
    });

    await expect(completeReviewRoute(deps, routeContext, review.id, { decision: null, reviewerComment: null })).rejects.toThrow(
      "Review completion requires a decision or comment",
    );
  });
});
