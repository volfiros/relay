import type { FollowUp } from "../domain/types";
import { assertFollowUpTransition } from "../domain/transitions";
import type { FollowUpRepository } from "../repositories/followupRepository";
import type { AuditService } from "../services/auditService";
import type { PermissionService } from "../services/permissionService";
import type { RouteContext } from "./routeTypes";

export async function createFollowUpRoute(
  deps: { permissions: PermissionService; followUps: FollowUpRepository; audit: AuditService },
  ctx: RouteContext,
  request: {
    caseId: string;
    targetType: "post" | "comment";
    targetId: string;
    reason: string;
    dueAt: string | null;
  },
): Promise<FollowUp> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const now = new Date().toISOString();
  const followUp: FollowUp = {
    id: crypto.randomUUID(),
    subredditId: ctx.subredditId,
    caseId: request.caseId,
    targetType: request.targetType,
    targetId: request.targetId,
    createdByModId: ctx.modId,
    ownerModId: ctx.modId,
    reason: request.reason,
    dueAt: request.dueAt,
    status: "active",
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
  await deps.followUps.save(followUp);
  await deps.audit.recordCaseEvent({
    subredditId: ctx.subredditId,
    caseId: request.caseId,
    actorModId: ctx.modId,
    eventType: "followup_created",
    payload: { followUpId: followUp.id, reason: request.reason },
    createdAt: now,
  });
  return followUp;
}

export async function updateFollowUpStatusRoute(
  deps: { permissions: PermissionService; followUps: FollowUpRepository; audit: AuditService },
  ctx: RouteContext,
  followUpId: string,
  status: FollowUp["status"],
): Promise<FollowUp> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const followUp = await deps.followUps.get(ctx.subredditId, followUpId);
  if (!followUp) throw new Error("Follow-up not found");
  assertFollowUpTransition(followUp.status, status);
  const now = new Date().toISOString();
  const next: FollowUp = {
    ...followUp,
    status,
    updatedAt: now,
    completedAt: status === "completed" ? now : followUp.completedAt,
  };
  await deps.followUps.save(next);
  if (status === "completed") {
    await deps.audit.recordCaseEvent({
      subredditId: ctx.subredditId,
      caseId: followUp.caseId,
      actorModId: ctx.modId,
      eventType: "followup_completed",
      payload: { followUpId },
      createdAt: now,
    });
  }
  return next;
}
