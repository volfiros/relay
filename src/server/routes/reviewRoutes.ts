import type { ReviewDecision, ReviewRequest } from "../domain/types";
import { assertReviewTransition } from "../domain/transitions";
import type { ReviewRepository } from "../repositories/reviewRepository";
import type { AuditService } from "../services/auditService";
import type { PermissionService } from "../services/permissionService";
import type { RouteContext } from "./routeTypes";

export async function createReviewRoute(
  deps: { permissions: PermissionService; reviews: ReviewRepository; audit: AuditService },
  ctx: RouteContext,
  request: { caseId: string; question: string; category: string },
): Promise<ReviewRequest> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const now = new Date().toISOString();
  const review: ReviewRequest = {
    id: crypto.randomUUID(),
    subredditId: ctx.subredditId,
    caseId: request.caseId,
    requestedByModId: ctx.modId,
    requestedReviewerModId: null,
    anyReviewer: true,
    question: request.question,
    category: request.category,
    status: "pending",
    decision: null,
    reviewerComment: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
  await deps.reviews.save(review);
  await deps.audit.recordCaseEvent({
    subredditId: ctx.subredditId,
    caseId: request.caseId,
    actorModId: ctx.modId,
    eventType: "review_requested",
    payload: { reviewId: review.id, question: request.question },
    createdAt: now,
  });
  return review;
}

export async function completeReviewRoute(
  deps: { permissions: PermissionService; reviews: ReviewRepository; audit: AuditService },
  ctx: RouteContext,
  reviewId: string,
  request: { decision: ReviewDecision | null; reviewerComment: string | null },
): Promise<ReviewRequest> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  if (!request.decision && !request.reviewerComment) {
    throw new Error("Review completion requires a decision or comment");
  }
  const review = await deps.reviews.get(ctx.subredditId, reviewId);
  if (!review) throw new Error("Review not found");
  assertReviewTransition(review.status, "completed");
  const now = new Date().toISOString();
  const next: ReviewRequest = {
    ...review,
    status: "completed",
    decision: request.decision,
    reviewerComment: request.reviewerComment,
    updatedAt: now,
    completedAt: now,
  };
  await deps.reviews.save(next);
  await deps.audit.recordCaseEvent({
    subredditId: ctx.subredditId,
    caseId: review.caseId,
    actorModId: ctx.modId,
    eventType: "review_completed",
    payload: { reviewId, decision: request.decision },
    createdAt: now,
  });
  return next;
}
