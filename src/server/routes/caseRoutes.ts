import type { CaseCard, CaseStatus, Urgency } from "../domain/types";
import { assertCaseTransition } from "../domain/transitions";
import type { CaseRepository } from "../repositories/caseRepository";
import type { AuditService } from "../services/auditService";
import type { PermissionService } from "../services/permissionService";
import { calculateRetentionExpiresAt } from "../services/retentionService";
import type { RouteContext } from "./routeTypes";

export interface CreateCaseRequest {
  targetType: "post" | "comment";
  targetId: string;
  targetPermalink: string;
  targetAuthor?: string | null;
  title: string;
  category: string;
  status: CaseStatus;
  urgency: Urgency;
  summary: string;
  isSensitive: boolean;
}

export async function createCaseRoute(
  deps: { permissions: PermissionService; cases: CaseRepository; audit: AuditService },
  ctx: RouteContext,
  request: CreateCaseRequest,
): Promise<{ caseCard: CaseCard; eventHistoryIncomplete: boolean }> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const now = new Date().toISOString();
  const caseCard: CaseCard = {
    id: crypto.randomUUID(),
    subredditId: ctx.subredditId,
    subredditName: ctx.subredditName,
    title: request.title,
    category: request.category,
    status: request.status,
    urgency: request.urgency,
    targetType: request.targetType,
    targetId: request.targetId,
    targetPermalink: request.targetPermalink,
    targetAuthor: request.targetAuthor ?? null,
    targetCreatedAt: null,
    creatorModId: ctx.modId,
    ownerModId: ctx.modId,
    assignedReviewerIds: [],
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    retentionExpiresAt: null,
    summary: request.summary,
    latestNotePreview: request.summary.slice(0, 140),
    relatedAuthor: request.targetAuthor ?? null,
    relatedThreadId: null,
    tags: [],
    isSensitive: request.isSensitive,
  };
  await deps.cases.saveCase(caseCard);
  try {
    await deps.audit.recordCaseEvent({
      subredditId: ctx.subredditId,
      caseId: caseCard.id,
      actorModId: ctx.modId,
      eventType: "case_created",
      payload: { title: caseCard.title },
      createdAt: now,
    });
    return { caseCard, eventHistoryIncomplete: false };
  } catch {
    return { caseCard, eventHistoryIncomplete: true };
  }
}

export async function getCaseRoute(
  deps: { permissions: PermissionService; cases: CaseRepository },
  ctx: RouteContext,
  caseId: string,
): Promise<CaseCard> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const caseCard = await deps.cases.getCase(ctx.subredditId, caseId);
  if (!caseCard) throw new Error("Case not found");
  return caseCard;
}

export async function updateCaseStatusRoute(
  deps: { permissions: PermissionService; cases: CaseRepository; audit: AuditService },
  ctx: RouteContext,
  caseId: string,
  status: CaseStatus,
): Promise<CaseCard> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const caseCard = await deps.cases.getCase(ctx.subredditId, caseId);
  if (!caseCard) throw new Error("Case not found");
  assertCaseTransition(caseCard.status, status);
  const now = new Date().toISOString();
  const next: CaseCard = {
    ...caseCard,
    status,
    updatedAt: now,
    resolvedAt: status === "resolved" ? now : caseCard.resolvedAt,
  };
  next.retentionExpiresAt = calculateRetentionExpiresAt(next);
  await deps.cases.saveCase(next);
  await deps.audit.recordCaseEvent({
    subredditId: ctx.subredditId,
    caseId,
    actorModId: ctx.modId,
    eventType: status === "resolved" ? "case_resolved" : "status_changed",
    payload: { from: caseCard.status, to: status },
    createdAt: now,
  });
  return next;
}
