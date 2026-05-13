import type { CaseStatus, FollowUpStatus, HandoffStatus, ReviewStatus } from "./types";

const caseTransitions: Record<CaseStatus, CaseStatus[]> = {
  open: ["watching", "needs_review", "handed_off", "resolved"],
  watching: ["open", "needs_review", "handed_off", "resolved"],
  needs_review: ["open", "handed_off", "resolved"],
  handed_off: ["open", "needs_review", "resolved"],
  resolved: ["archived"],
  archived: ["open"],
};

const handoffTransitions: Record<HandoffStatus, HandoffStatus[]> = {
  open: ["read", "accepted", "resolved"],
  read: ["accepted", "resolved"],
  accepted: ["resolved"],
  resolved: ["archived"],
  archived: [],
};

const reviewTransitions: Record<ReviewStatus, ReviewStatus[]> = {
  pending: ["in_review", "completed", "canceled"],
  in_review: ["completed", "canceled"],
  completed: [],
  canceled: [],
};

const followUpTransitions: Record<FollowUpStatus, FollowUpStatus[]> = {
  active: ["snoozed", "completed", "canceled"],
  snoozed: ["active", "completed", "canceled"],
  completed: [],
  canceled: [],
};

function assertTransition<T extends string>(label: string, transitions: Record<T, T[]>, from: T, to: T): void {
  if (from === to) return;
  if (!transitions[from].includes(to)) {
    throw new Error(`Invalid ${label} transition: ${from} -> ${to}`);
  }
}

export function assertCaseTransition(from: CaseStatus, to: CaseStatus): void {
  assertTransition("case", caseTransitions, from, to);
}

export function assertHandoffTransition(from: HandoffStatus, to: HandoffStatus): void {
  assertTransition("handoff", handoffTransitions, from, to);
}

export function assertReviewTransition(from: ReviewStatus, to: ReviewStatus): void {
  assertTransition("review", reviewTransitions, from, to);
}

export function assertFollowUpTransition(from: FollowUpStatus, to: FollowUpStatus): void {
  assertTransition("follow-up", followUpTransitions, from, to);
}
