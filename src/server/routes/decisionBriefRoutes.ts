import type { TargetType } from "../domain/types";
import type { CaseRepository } from "../repositories/caseRepository";
import type { FollowUpRepository } from "../repositories/followupRepository";
import type { DuplicateCaseService } from "../services/duplicateCaseService";
import type { PermissionService } from "../services/permissionService";
import type { RedditContextService } from "../services/redditContextService";
import type { RouteContext } from "./routeTypes";

export interface DecisionBriefDto {
  targetType: "post" | "comment";
  targetId: string;
  targetPermalink: string;
  targetSummary: string;
  targetAuthor: string | null;
  parentContext: string | null;
  threadContext: string | null;
  authorContext: string | null;
  reportContext: string | null;
  priorCases: Array<{ id: string; title: string; status: string; updatedAt: string }>;
  existingFollowUp: { id: string; status: string; dueAt: string | null } | null;
  duplicateWarning: { caseId: string; title: string; status: string } | null;
  missingContextFlags: string[];
}

export async function getDecisionBriefRoute(
  deps: {
    permissions: PermissionService;
    redditContext: RedditContextService;
    duplicates: DuplicateCaseService;
    cases: CaseRepository;
    followUps: FollowUpRepository;
  },
  ctx: RouteContext,
  query: { targetType: TargetType; targetId: string },
): Promise<DecisionBriefDto> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  if (query.targetType !== "post" && query.targetType !== "comment") {
    throw new Error("Unsupported target type");
  }

  const [context, duplicates, followUpIds, caseIds] = await Promise.all([
    deps.redditContext.getContext(query),
    deps.duplicates.findOpenDuplicates(ctx.subredditId, query.targetId),
    deps.followUps.listFollowUpIdsForTarget(ctx.subredditId, query.targetId),
    deps.cases.listCaseIdsByTarget(ctx.subredditId, query.targetId),
  ]);
  const priorCases = (await Promise.all(caseIds.map((id) => deps.cases.getCase(ctx.subredditId, id))))
    .filter((caseCard) => caseCard !== null)
    .map((caseCard) => ({
      id: caseCard.id,
      title: caseCard.title,
      status: caseCard.status,
      updatedAt: caseCard.updatedAt,
    }));
  const existingFollowUp = followUpIds[0] ? await deps.followUps.get(ctx.subredditId, followUpIds[0]) : null;
  const duplicate = duplicates[0] ?? null;

  return {
    targetType: query.targetType,
    targetId: query.targetId,
    targetPermalink: context.targetPermalink,
    targetSummary: context.targetSummary,
    targetAuthor: context.targetAuthor,
    parentContext: context.parentContext,
    threadContext: context.threadContext,
    authorContext: context.authorContext,
    reportContext: context.reportContext,
    priorCases,
    existingFollowUp: existingFollowUp
      ? { id: existingFollowUp.id, status: existingFollowUp.status, dueAt: existingFollowUp.dueAt }
      : null,
    duplicateWarning: duplicate ? { caseId: duplicate.id, title: duplicate.title, status: duplicate.status } : null,
    missingContextFlags: context.missingContextFlags,
  };
}
