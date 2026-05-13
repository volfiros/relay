import type { CaseCard, FollowUp, HandoffNote, ReviewRequest, Urgency } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";
import type { FollowUpRepository } from "../repositories/followupRepository";
import type { HandoffRepository } from "../repositories/handoffRepository";
import type { ReviewRepository } from "../repositories/reviewRepository";

export interface BoardFilters {
  status?: string;
  urgency?: Urgency;
  category?: string;
  ownerModId?: string;
  reviewerModId?: string;
  minAgeHours?: number;
}

export interface RelayBoardDto {
  openCases: BoardCaseDto[];
  pendingReviews: BoardReviewDto[];
  staleHandoffs: BoardHandoffDto[];
  activeFollowUps: BoardFollowUpDto[];
  activitySummary: BoardActivitySummaryDto;
}

export interface BoardCaseDto {
  id: string;
  title: string;
  status: string;
  urgency: string;
  category: string;
  ownerModId: string;
  updatedAt: string;
  targetPermalink: string;
}

export interface BoardReviewDto {
  id: string;
  caseId: string;
  question: string;
  status: string;
  updatedAt: string;
}

export interface BoardHandoffDto {
  id: string;
  caseId: string;
  requestedAction: string;
  urgency: string;
  updatedAt: string;
}

export interface BoardFollowUpDto {
  id: string;
  caseId: string;
  reason: string;
  status: string;
  dueAt: string | null;
}

export interface BoardActivitySummaryDto {
  openCaseCount: number;
  pendingReviewCount: number;
  staleHandoffCount: number;
  activeFollowUpCount: number;
}

export class BoardService {
  constructor(
    private readonly cases: CaseRepository,
    private readonly reviews: ReviewRepository,
    private readonly handoffs: HandoffRepository,
    private readonly followUps: FollowUpRepository,
  ) {}

  async buildBoard(input: { subredditId: string; now: string; filters?: BoardFilters }): Promise<RelayBoardDto> {
    const filters = input.filters ?? {};
    const statuses = ["open", "watching", "needs_review", "handed_off"] as const;
    const caseIds = new Set<string>();
    for (const status of statuses) {
      for (const id of await this.cases.listCaseIdsByStatus(input.subredditId, status)) {
        caseIds.add(id);
      }
    }

    const cases = (await Promise.all([...caseIds].map((id) => this.cases.getCase(input.subredditId, id))))
      .filter((caseCard): caseCard is CaseCard => Boolean(caseCard))
      .filter((caseCard) => matchesCaseFilters(caseCard, filters, input.now))
      .sort(sortCases);

    const pendingReviews = await this.loadPendingReviews(input.subredditId);
    const staleHandoffs = await this.loadStaleHandoffs(input.subredditId, input.now);
    const activeFollowUps = await this.loadActiveFollowUps(input.subredditId, cases);

    return {
      openCases: cases.map(toBoardCase),
      pendingReviews: pendingReviews.map(toBoardReview),
      staleHandoffs: staleHandoffs.map(toBoardHandoff),
      activeFollowUps: activeFollowUps.map(toBoardFollowUp),
      activitySummary: {
        openCaseCount: cases.length,
        pendingReviewCount: pendingReviews.length,
        staleHandoffCount: staleHandoffs.length,
        activeFollowUpCount: activeFollowUps.length,
      },
    };
  }

  private async loadPendingReviews(subredditId: string): Promise<ReviewRequest[]> {
    const ids = await this.reviews.listUnassignedReviewIds(subredditId);
    const reviews = await Promise.all(ids.map((id) => this.reviews.get(subredditId, id)));
    return reviews.filter((review): review is ReviewRequest => Boolean(review && review.status !== "completed" && review.status !== "canceled"));
  }

  private async loadStaleHandoffs(subredditId: string, now: string): Promise<HandoffNote[]> {
    const ids = await this.handoffs.listUnassignedHandoffIds(subredditId);
    const handoffs = await Promise.all(ids.map((id) => this.handoffs.get(subredditId, id)));
    return handoffs.filter((handoff): handoff is HandoffNote => {
      return Boolean(handoff && handoff.status !== "resolved" && Date.parse(now) - Date.parse(handoff.updatedAt) >= 24 * 60 * 60 * 1000);
    });
  }

  private async loadActiveFollowUps(subredditId: string, cases: CaseCard[]): Promise<FollowUp[]> {
    const ids = new Set<string>();
    for (const caseCard of cases) {
      for (const id of await this.followUps.listFollowUpIdsForTarget(subredditId, caseCard.targetId)) {
        ids.add(id);
      }
    }
    const followUps = await Promise.all([...ids].map((id) => this.followUps.get(subredditId, id)));
    return followUps.filter((followUp): followUp is FollowUp => Boolean(followUp && followUp.status !== "completed" && followUp.status !== "canceled"));
  }
}

function matchesCaseFilters(caseCard: CaseCard, filters: BoardFilters, now: string): boolean {
  if (filters.status && caseCard.status !== filters.status) return false;
  if (filters.urgency && caseCard.urgency !== filters.urgency) return false;
  if (filters.category && caseCard.category !== filters.category) return false;
  if (filters.ownerModId && caseCard.ownerModId !== filters.ownerModId) return false;
  if (filters.reviewerModId && !caseCard.assignedReviewerIds.includes(filters.reviewerModId)) return false;
  if (filters.minAgeHours && Date.parse(now) - Date.parse(caseCard.updatedAt) < filters.minAgeHours * 60 * 60 * 1000) return false;
  return true;
}

function sortCases(a: CaseCard, b: CaseCard): number {
  const urgencyRank = { urgent: 0, high: 1, normal: 2, low: 3 };
  return urgencyRank[a.urgency] - urgencyRank[b.urgency] || Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
}

function toBoardCase(caseCard: CaseCard): BoardCaseDto {
  return {
    id: caseCard.id,
    title: caseCard.title,
    status: caseCard.status,
    urgency: caseCard.urgency,
    category: caseCard.category,
    ownerModId: caseCard.ownerModId,
    updatedAt: caseCard.updatedAt,
    targetPermalink: caseCard.targetPermalink,
  };
}

function toBoardReview(review: ReviewRequest): BoardReviewDto {
  return {
    id: review.id,
    caseId: review.caseId,
    question: review.question,
    status: review.status,
    updatedAt: review.updatedAt,
  };
}

function toBoardHandoff(handoff: HandoffNote): BoardHandoffDto {
  return {
    id: handoff.id,
    caseId: handoff.caseId,
    requestedAction: handoff.requestedAction,
    urgency: handoff.urgency,
    updatedAt: handoff.updatedAt,
  };
}

function toBoardFollowUp(followUp: FollowUp): BoardFollowUpDto {
  return {
    id: followUp.id,
    caseId: followUp.caseId,
    reason: followUp.reason,
    status: followUp.status,
    dueAt: followUp.dueAt,
  };
}
