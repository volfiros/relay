import type { CaseStatus } from "../domain/types";

export const keys = {
  case: (subredditId: string, caseId: string) => `case:${subredditId}:${caseId}`,
  brief: (subredditId: string, briefId: string) => `brief:${subredditId}:${briefId}`,
  handoff: (subredditId: string, handoffId: string) => `handoff:${subredditId}:${handoffId}`,
  review: (subredditId: string, reviewId: string) => `review:${subredditId}:${reviewId}`,
  followup: (subredditId: string, followupId: string) => `followup:${subredditId}:${followupId}`,
  modstate: (subredditId: string, modId: string) => `modstate:${subredditId}:${modId}`,
  caseEvent: (subredditId: string, caseId: string, eventId: string) =>
    `caseevent:${subredditId}:${caseId}:${eventId}`,
  caseByStatus: (subredditId: string, status: CaseStatus) =>
    `idx:cases:subreddit:${subredditId}:status:${status}`,
  caseByCreator: (subredditId: string, modId: string) => `idx:cases:subreddit:${subredditId}:creator:${modId}`,
  caseByOwner: (subredditId: string, modId: string) => `idx:cases:subreddit:${subredditId}:owner:${modId}`,
  caseByReviewer: (subredditId: string, modId: string) => `idx:cases:subreddit:${subredditId}:reviewer:${modId}`,
  caseByTarget: (subredditId: string, targetId: string) => `idx:cases:subreddit:${subredditId}:target:${targetId}`,
  caseByAuthor: (subredditId: string, authorKey: string) => `idx:cases:subreddit:${subredditId}:author:${authorKey}`,
  casesUpdated: (subredditId: string) => `idx:cases:subreddit:${subredditId}:updated`,
  handoffsByRecipient: (subredditId: string, modId: string) =>
    `idx:handoffs:subreddit:${subredditId}:recipient:${modId}`,
  handoffsUnassigned: (subredditId: string) => `idx:handoffs:subreddit:${subredditId}:unassigned`,
  reviewsByReviewer: (subredditId: string, modId: string) =>
    `idx:reviews:subreddit:${subredditId}:reviewer:${modId}`,
  reviewsUnassigned: (subredditId: string) => `idx:reviews:subreddit:${subredditId}:unassigned`,
  followupsByOwner: (subredditId: string, modId: string) => `idx:followups:subreddit:${subredditId}:owner:${modId}`,
  followupsByTarget: (subredditId: string, targetId: string) => `idx:followups:subreddit:${subredditId}:target:${targetId}`,
  eventsByCase: (subredditId: string, caseId: string) => `idx:events:subreddit:${subredditId}:case:${caseId}`,
  settings: (subredditId: string) => `settings:${subredditId}`,
};
