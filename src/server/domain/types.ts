export const TARGET_TYPES = ["post", "comment", "user", "thread", "modmail", "other"] as const;
export type TargetType = (typeof TARGET_TYPES)[number];

export const CASE_STATUSES = ["open", "watching", "needs_review", "handed_off", "resolved", "archived"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const URGENCIES = ["low", "normal", "high", "urgent"] as const;
export type Urgency = (typeof URGENCIES)[number];

export const HANDOFF_STATUSES = ["open", "read", "accepted", "resolved", "archived"] as const;
export type HandoffStatus = (typeof HANDOFF_STATUSES)[number];

export const REVIEW_STATUSES = ["pending", "in_review", "completed", "canceled"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_DECISIONS = ["agree", "disagree", "needs_more_context", "no_action", "escalate"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const FOLLOWUP_STATUSES = ["active", "snoozed", "completed", "canceled"] as const;
export type FollowUpStatus = (typeof FOLLOWUP_STATUSES)[number];

export const CASE_EVENT_TYPES = [
  "case_created",
  "note_added",
  "status_changed",
  "handoff_created",
  "handoff_resolved",
  "review_requested",
  "review_completed",
  "followup_created",
  "followup_completed",
  "case_resolved",
  "case_archived",
] as const;
export type CaseEventType = (typeof CASE_EVENT_TYPES)[number];

export interface CaseCard {
  id: string;
  subredditId: string;
  subredditName: string;
  title: string;
  category: string;
  status: CaseStatus;
  urgency: Urgency;
  targetType: TargetType;
  targetId: string;
  targetPermalink: string;
  targetAuthor: string | null;
  targetCreatedAt: string | null;
  creatorModId: string;
  ownerModId: string;
  assignedReviewerIds: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  retentionExpiresAt: string | null;
  summary: string;
  latestNotePreview: string | null;
  relatedAuthor: string | null;
  relatedThreadId: string | null;
  tags: string[];
  isSensitive: boolean;
}

export interface DecisionBrief {
  id: string;
  subredditId: string;
  targetType: TargetType;
  targetId: string;
  targetPermalink: string;
  generatedForModId: string;
  generatedAt: string;
  targetSummary: string;
  parentContext: string | null;
  threadContext: string | null;
  authorContext: string | null;
  reportContext: string | null;
  priorCaseRefs: Array<Pick<CaseCard, "id" | "title" | "status" | "updatedAt">>;
  missingContextFlags: string[];
}

export interface HandoffNote {
  id: string;
  subredditId: string;
  caseId: string;
  targetType: TargetType;
  targetId: string;
  fromModId: string;
  toModId: string | null;
  toAnyAvailableMod: boolean;
  toSelf: boolean;
  urgency: Urgency;
  requestedAction: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  readAt: string | null;
  resolvedAt: string | null;
  status: HandoffStatus;
}

export interface ReviewRequest {
  id: string;
  subredditId: string;
  caseId: string;
  requestedByModId: string;
  requestedReviewerModId: string | null;
  anyReviewer: boolean;
  question: string;
  category: string;
  status: ReviewStatus;
  decision: ReviewDecision | null;
  reviewerComment: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface FollowUp {
  id: string;
  subredditId: string;
  caseId: string;
  targetType: TargetType;
  targetId: string;
  createdByModId: string;
  ownerModId: string;
  reason: string;
  dueAt: string | null;
  status: FollowUpStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ModeratorState {
  subredditId: string;
  modId: string;
  lastCatchUpSeenAt: string | null;
  dismissedItemIds: string[];
  personalFilters: Record<string, boolean>;
  notificationPreferences: Record<string, boolean>;
  compactMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseEvent {
  id: string;
  subredditId: string;
  caseId: string;
  actorModId: string;
  eventType: CaseEventType;
  createdAt: string;
  payload: Record<string, unknown>;
}
