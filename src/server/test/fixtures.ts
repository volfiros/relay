import type { CaseCard, FollowUp, HandoffNote, ModeratorState, ReviewRequest } from "../domain/types";

export function makeCase(overrides: Partial<CaseCard> = {}): CaseCard {
  return {
    id: "case1",
    subredditId: "sub1",
    subredditName: "RelayTest",
    title: "Borderline comment",
    category: "Rule review",
    status: "open",
    urgency: "normal",
    targetType: "comment",
    targetId: "t1_comment",
    targetPermalink: "https://reddit.com/r/RelayTest/comments/post/_/comment",
    targetAuthor: "author_a",
    targetCreatedAt: "2026-05-13T00:00:00.000Z",
    creatorModId: "mod_a",
    ownerModId: "mod_a",
    assignedReviewerIds: [],
    createdAt: "2026-05-13T00:00:00.000Z",
    updatedAt: "2026-05-13T00:10:00.000Z",
    resolvedAt: null,
    retentionExpiresAt: null,
    summary: "Needs review for context.",
    latestNotePreview: null,
    relatedAuthor: "author_a",
    relatedThreadId: "t3_post",
    tags: [],
    isSensitive: false,
    ...overrides,
  };
}

export function makeHandoff(overrides: Partial<HandoffNote> = {}): HandoffNote {
  return {
    id: "handoff1",
    subredditId: "sub1",
    caseId: "case1",
    targetType: "comment",
    targetId: "t1_comment",
    fromModId: "mod_a",
    toModId: "mod_b",
    toAnyAvailableMod: false,
    toSelf: false,
    urgency: "normal",
    requestedAction: "Review context",
    body: "Please check the thread context.",
    createdAt: "2026-05-13T00:00:00.000Z",
    updatedAt: "2026-05-13T00:10:00.000Z",
    dueAt: null,
    readAt: null,
    resolvedAt: null,
    status: "open",
    ...overrides,
  };
}

export function makeReview(overrides: Partial<ReviewRequest> = {}): ReviewRequest {
  return {
    id: "review1",
    subredditId: "sub1",
    caseId: "case1",
    requestedByModId: "mod_a",
    requestedReviewerModId: "mod_b",
    anyReviewer: false,
    question: "Does this need removal?",
    category: "Rule review",
    status: "pending",
    decision: null,
    reviewerComment: null,
    createdAt: "2026-05-13T00:00:00.000Z",
    updatedAt: "2026-05-13T00:10:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

export function makeFollowUp(overrides: Partial<FollowUp> = {}): FollowUp {
  return {
    id: "followup1",
    subredditId: "sub1",
    caseId: "case1",
    targetType: "comment",
    targetId: "t1_comment",
    createdByModId: "mod_a",
    ownerModId: "mod_a",
    reason: "Check later",
    dueAt: null,
    status: "active",
    createdAt: "2026-05-13T00:00:00.000Z",
    updatedAt: "2026-05-13T00:10:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

export function makeModeratorState(overrides: Partial<ModeratorState> = {}): ModeratorState {
  return {
    subredditId: "sub1",
    modId: "mod_a",
    lastCatchUpSeenAt: "2026-05-13T00:00:00.000Z",
    dismissedItemIds: [],
    personalFilters: {},
    notificationPreferences: {},
    compactMode: false,
    createdAt: "2026-05-13T00:00:00.000Z",
    updatedAt: "2026-05-13T00:10:00.000Z",
    ...overrides,
  };
}
