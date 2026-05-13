import type { CaseCard, FollowUp, HandoffNote, ReviewRequest } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";
import type { FollowUpRepository } from "../repositories/followupRepository";
import type { HandoffRepository } from "../repositories/handoffRepository";
import type { ModeratorStateRepository } from "../repositories/moderatorStateRepository";
import type { ReviewRepository } from "../repositories/reviewRepository";

export interface CatchUpDto {
  needsMyReview: CatchUpItemDto[];
  handoffsToMe: CatchUpItemDto[];
  unassignedHandoffs: CatchUpItemDto[];
  myFollowUps: CatchUpItemDto[];
  updatedSinceLastSeen: CatchUpItemDto[];
  staleCases: CatchUpItemDto[];
  recentlyResolved: CatchUpItemDto[];
  lastSeenAt: string | null;
}

export interface CatchUpItemDto {
  id: string;
  kind: "case" | "handoff" | "review" | "followup";
  caseId: string | null;
  title: string;
  status: string;
  urgency: string;
  updatedAt: string;
  targetPermalink: string | null;
}

export class CatchUpService {
  constructor(
    private readonly cases: CaseRepository,
    private readonly handoffs: HandoffRepository,
    private readonly reviews: ReviewRepository,
    private readonly followUps: FollowUpRepository,
    private readonly moderatorStates: ModeratorStateRepository,
  ) {}

  async buildCatchUp(input: { subredditId: string; modId: string; now: string }): Promise<CatchUpDto> {
    const state = await this.moderatorStates.get(input.subredditId, input.modId);
    const lastSeenAt = state?.lastCatchUpSeenAt ?? null;
    const [reviewIds, handoffIds, unassignedHandoffIds, followUpIds, recentCaseIds] = await Promise.all([
      this.reviews.listReviewIdsForReviewer(input.subredditId, input.modId),
      this.handoffs.listHandoffIdsForRecipient(input.subredditId, input.modId),
      this.handoffs.listUnassignedHandoffIds(input.subredditId),
      this.followUps.listFollowUpIdsForOwner(input.subredditId, input.modId),
      this.cases.listRecentlyUpdatedCaseIds(input.subredditId, 50),
    ]);

    const [reviewItems, handoffItems, unassignedHandoffItems, followUpItems, recentCases] = await Promise.all([
      Promise.all(reviewIds.map((id) => this.reviewToItem(input.subredditId, id))),
      Promise.all(handoffIds.map((id) => this.handoffToItem(input.subredditId, id))),
      Promise.all(unassignedHandoffIds.map((id) => this.handoffToItem(input.subredditId, id))),
      Promise.all(followUpIds.map((id) => this.followUpToItem(input.subredditId, id))),
      Promise.all(recentCaseIds.map((id) => this.cases.getCase(input.subredditId, id))),
    ]);

    const cases = recentCases.filter((caseCard): caseCard is CaseCard => Boolean(caseCard));
    const updatedSinceLastSeen = lastSeenAt
      ? cases.filter((caseCard) => caseCard.updatedAt > lastSeenAt && caseCard.status !== "resolved").map(caseToItem)
      : [];
    const staleCases = cases.filter((caseCard) => isStale(caseCard, input.now)).map(caseToItem);
    const recentlyResolved = cases.filter((caseCard) => caseCard.status === "resolved").map(caseToItem);

    return {
      needsMyReview: reviewItems.filter(isCatchUpItem),
      handoffsToMe: handoffItems.filter(isCatchUpItem),
      unassignedHandoffs: unassignedHandoffItems.filter(isCatchUpItem),
      myFollowUps: followUpItems.filter(isCatchUpItem),
      updatedSinceLastSeen,
      staleCases,
      recentlyResolved,
      lastSeenAt,
    };
  }

  private async reviewToItem(subredditId: string, id: string): Promise<CatchUpItemDto | null> {
    const review = await this.reviews.get(subredditId, id);
    if (!review || review.status === "completed" || review.status === "canceled") return null;
    const caseCard = await this.cases.getCase(subredditId, review.caseId);
    return reviewToItem(review, caseCard);
  }

  private async handoffToItem(subredditId: string, id: string): Promise<CatchUpItemDto | null> {
    const handoff = await this.handoffs.get(subredditId, id);
    if (!handoff || handoff.status === "resolved" || handoff.status === "archived") return null;
    const caseCard = await this.cases.getCase(subredditId, handoff.caseId);
    return handoffToItem(handoff, caseCard);
  }

  private async followUpToItem(subredditId: string, id: string): Promise<CatchUpItemDto | null> {
    const followUp = await this.followUps.get(subredditId, id);
    if (!followUp || followUp.status === "completed" || followUp.status === "canceled") return null;
    const caseCard = await this.cases.getCase(subredditId, followUp.caseId);
    return followUpToItem(followUp, caseCard);
  }
}

function isCatchUpItem(item: CatchUpItemDto | null): item is CatchUpItemDto {
  return item !== null;
}

function caseToItem(caseCard: CaseCard): CatchUpItemDto {
  return {
    id: caseCard.id,
    kind: "case",
    caseId: caseCard.id,
    title: caseCard.title,
    status: caseCard.status,
    urgency: caseCard.urgency,
    updatedAt: caseCard.updatedAt,
    targetPermalink: caseCard.targetPermalink,
  };
}

function reviewToItem(review: ReviewRequest, caseCard: CaseCard | null): CatchUpItemDto {
  return {
    id: review.id,
    kind: "review",
    caseId: review.caseId,
    title: caseCard?.title ?? review.question,
    status: review.status,
    urgency: caseCard?.urgency ?? "normal",
    updatedAt: review.updatedAt,
    targetPermalink: caseCard?.targetPermalink ?? null,
  };
}

function handoffToItem(handoff: HandoffNote, caseCard: CaseCard | null): CatchUpItemDto {
  return {
    id: handoff.id,
    kind: "handoff",
    caseId: handoff.caseId,
    title: caseCard?.title ?? handoff.requestedAction,
    status: handoff.status,
    urgency: handoff.urgency,
    updatedAt: handoff.updatedAt,
    targetPermalink: caseCard?.targetPermalink ?? null,
  };
}

function followUpToItem(followUp: FollowUp, caseCard: CaseCard | null): CatchUpItemDto {
  return {
    id: followUp.id,
    kind: "followup",
    caseId: followUp.caseId,
    title: caseCard?.title ?? followUp.reason,
    status: followUp.status,
    urgency: caseCard?.urgency ?? "normal",
    updatedAt: followUp.updatedAt,
    targetPermalink: caseCard?.targetPermalink ?? null,
  };
}

function isStale(caseCard: CaseCard, now: string): boolean {
  const ageMs = Date.parse(now) - Date.parse(caseCard.updatedAt);
  return caseCard.status !== "resolved" && caseCard.status !== "archived" && ageMs >= 72 * 60 * 60 * 1000;
}
