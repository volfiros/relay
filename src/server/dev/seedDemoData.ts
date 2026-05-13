import type { CaseCard, FollowUp, HandoffNote, ReviewRequest } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";
import type { FollowUpRepository } from "../repositories/followupRepository";
import type { HandoffRepository } from "../repositories/handoffRepository";
import type { ReviewRepository } from "../repositories/reviewRepository";

export const DEMO_SUBREDDIT_ID = "demo_subreddit";
export const DEMO_SUBREDDIT_NAME = "RelayDemo";
export const DEMO_PRIMARY_MOD_ID = "mod_alex";
export const DEMO_REVIEWER_MOD_ID = "mod_riley";

export interface DemoSeedResult {
  scenarioIds: string[];
  caseIds: string[];
  handoffIds: string[];
  reviewIds: string[];
  followUpIds: string[];
}

export interface DemoSeedRepositories {
  cases: CaseRepository;
  handoffs: HandoffRepository;
  reviews: ReviewRepository;
  followUps: FollowUpRepository;
}

const BASE_DATE = "2026-05-13T00:00:00.000Z";

export async function seedDemoData(repositories: DemoSeedRepositories): Promise<DemoSeedResult> {
  const cases = buildDemoCases();
  const handoffs = buildDemoHandoffs();
  const reviews = buildDemoReviews();
  const followUps = buildDemoFollowUps();

  for (const caseCard of cases) {
    await repositories.cases.saveCase(caseCard);
  }
  for (const handoff of handoffs) {
    await repositories.handoffs.save(handoff);
  }
  for (const review of reviews) {
    await repositories.reviews.save(review);
  }
  for (const followUp of followUps) {
    await repositories.followUps.save(followUp);
  }

  return {
    scenarioIds: [
      "borderline-review",
      "any-mod-handoff",
      "heated-thread-followup",
      "duplicate-target",
      "deleted-target",
      "stale-followup",
      "resolved-prior-history",
    ],
    caseIds: cases.map((caseCard) => caseCard.id),
    handoffIds: handoffs.map((handoff) => handoff.id),
    reviewIds: reviews.map((review) => review.id),
    followUpIds: followUps.map((followUp) => followUp.id),
  };
}

function buildDemoCases(): CaseCard[] {
  return [
    makeDemoCase({
      id: "case_borderline_review",
      title: "Borderline comment needing second review",
      targetId: "t1_borderline_review",
      assignedReviewerIds: [DEMO_REVIEWER_MOD_ID],
      status: "needs_review",
      summary: "Comment may cross the community conduct line, but thread context matters.",
    }),
    makeDemoCase({
      id: "case_any_mod_handoff",
      title: "Session handoff for heated exchange",
      targetId: "t1_any_mod_handoff",
      status: "handed_off",
      urgency: "high",
      summary: "Moderator is going offline and wants another mod to continue review.",
    }),
    makeDemoCase({
      id: "case_heated_thread_followup",
      title: "Heated thread follow-up",
      targetType: "post",
      targetId: "t3_heated_thread",
      status: "watching",
      summary: "Thread needs another look after discussion cools down.",
    }),
    makeDemoCase({
      id: "case_duplicate_target",
      title: "Existing open case for duplicate warning",
      targetId: "t1_duplicate_target",
      status: "open",
      summary: "This case should appear as a duplicate warning from Decision Brief.",
    }),
    makeDemoCase({
      id: "case_deleted_target",
      title: "Deleted target still readable",
      targetId: "t1_deleted_target",
      targetAuthor: null,
      status: "open",
      summary: "Linked content is unavailable, but the saved case remains useful.",
    }),
    makeDemoCase({
      id: "case_stale_followup",
      title: "Stale follow-up case",
      targetId: "t1_stale_followup",
      updatedAt: "2026-05-08T00:00:00.000Z",
      status: "watching",
      summary: "This stale item should surface during catch-up.",
    }),
    makeDemoCase({
      id: "case_resolved_prior_history",
      title: "Resolved prior rule-review case",
      targetId: "t1_resolved_prior_history",
      status: "resolved",
      resolvedAt: "2026-05-12T00:00:00.000Z",
      summary: "Prior similar decision resolved with a factual moderator summary.",
    }),
  ];
}

function buildDemoHandoffs(): HandoffNote[] {
  return [
    {
      id: "handoff_any_mod",
      subredditId: DEMO_SUBREDDIT_ID,
      caseId: "case_any_mod_handoff",
      targetType: "comment",
      targetId: "t1_any_mod_handoff",
      fromModId: DEMO_PRIMARY_MOD_ID,
      toModId: null,
      toAnyAvailableMod: true,
      toSelf: false,
      urgency: "high",
      requestedAction: "Continue review",
      body: "Please review the linked exchange and decide whether a second action is needed.",
      createdAt: BASE_DATE,
      updatedAt: BASE_DATE,
      dueAt: null,
      readAt: null,
      resolvedAt: null,
      status: "open",
    },
  ];
}

function buildDemoReviews(): ReviewRequest[] {
  return [
    {
      id: "review_borderline",
      subredditId: DEMO_SUBREDDIT_ID,
      caseId: "case_borderline_review",
      requestedByModId: DEMO_PRIMARY_MOD_ID,
      requestedReviewerModId: DEMO_REVIEWER_MOD_ID,
      anyReviewer: false,
      question: "Does this cross the rule 2 line in context?",
      category: "Rule review",
      status: "pending",
      decision: null,
      reviewerComment: null,
      createdAt: BASE_DATE,
      updatedAt: BASE_DATE,
      completedAt: null,
    },
  ];
}

function buildDemoFollowUps(): FollowUp[] {
  return [
    {
      id: "followup_heated_thread",
      subredditId: DEMO_SUBREDDIT_ID,
      caseId: "case_heated_thread_followup",
      targetType: "post",
      targetId: "t3_heated_thread",
      createdByModId: DEMO_PRIMARY_MOD_ID,
      ownerModId: DEMO_PRIMARY_MOD_ID,
      reason: "Recheck after discussion cools down.",
      dueAt: "2026-05-14T00:00:00.000Z",
      status: "active",
      createdAt: BASE_DATE,
      updatedAt: BASE_DATE,
      completedAt: null,
    },
    {
      id: "followup_stale",
      subredditId: DEMO_SUBREDDIT_ID,
      caseId: "case_stale_followup",
      targetType: "comment",
      targetId: "t1_stale_followup",
      createdByModId: DEMO_PRIMARY_MOD_ID,
      ownerModId: DEMO_PRIMARY_MOD_ID,
      reason: "This should be visibly stale.",
      dueAt: "2026-05-09T00:00:00.000Z",
      status: "active",
      createdAt: "2026-05-08T00:00:00.000Z",
      updatedAt: "2026-05-08T00:00:00.000Z",
      completedAt: null,
    },
  ];
}

function makeDemoCase(overrides: Partial<CaseCard>): CaseCard {
  return {
    id: "case_demo",
    subredditId: DEMO_SUBREDDIT_ID,
    subredditName: DEMO_SUBREDDIT_NAME,
    title: "Demo case",
    category: "Rule review",
    status: "open",
    urgency: "normal",
    targetType: "comment",
    targetId: "t1_demo",
    targetPermalink: "https://reddit.com/r/RelayDemo/comments/demo/_/comment",
    targetAuthor: "demo_author",
    targetCreatedAt: BASE_DATE,
    creatorModId: DEMO_PRIMARY_MOD_ID,
    ownerModId: DEMO_PRIMARY_MOD_ID,
    assignedReviewerIds: [],
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    resolvedAt: null,
    retentionExpiresAt: null,
    summary: "Demo summary",
    latestNotePreview: "Demo summary",
    relatedAuthor: "demo_author",
    relatedThreadId: "t3_demo",
    tags: [],
    isSensitive: false,
    ...overrides,
  };
}
