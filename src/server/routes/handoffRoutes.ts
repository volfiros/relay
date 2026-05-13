import type { HandoffNote } from "../domain/types";
import { assertHandoffTransition } from "../domain/transitions";
import type { HandoffRepository } from "../repositories/handoffRepository";
import type { AuditService } from "../services/auditService";
import type { PermissionService } from "../services/permissionService";
import type { RouteContext } from "./routeTypes";

export type HandoffRecipientType = "future_me" | "any_available_mod";

export async function createHandoffRoute(
  deps: { permissions: PermissionService; handoffs: HandoffRepository; audit: AuditService },
  ctx: RouteContext,
  request: {
    caseId: string;
    targetType: "post" | "comment";
    targetId: string;
    recipientType: HandoffRecipientType;
    requestedAction: string;
    body: string;
    urgency: HandoffNote["urgency"];
    dueAt: string | null;
  },
): Promise<HandoffNote> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const now = new Date().toISOString();
  const handoff: HandoffNote = {
    id: crypto.randomUUID(),
    subredditId: ctx.subredditId,
    caseId: request.caseId,
    targetType: request.targetType,
    targetId: request.targetId,
    fromModId: ctx.modId,
    toModId: request.recipientType === "future_me" ? ctx.modId : null,
    toAnyAvailableMod: request.recipientType === "any_available_mod",
    toSelf: request.recipientType === "future_me",
    urgency: request.urgency,
    requestedAction: request.requestedAction,
    body: request.body,
    createdAt: now,
    updatedAt: now,
    dueAt: request.dueAt,
    readAt: null,
    resolvedAt: null,
    status: "open",
  };
  await deps.handoffs.save(handoff);
  await deps.audit.recordCaseEvent({
    subredditId: ctx.subredditId,
    caseId: request.caseId,
    actorModId: ctx.modId,
    eventType: "handoff_created",
    payload: { handoffId: handoff.id, requestedAction: request.requestedAction },
    createdAt: now,
  });
  return handoff;
}

export async function updateHandoffStatusRoute(
  deps: { permissions: PermissionService; handoffs: HandoffRepository; audit: AuditService },
  ctx: RouteContext,
  handoffId: string,
  status: HandoffNote["status"],
): Promise<HandoffNote> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  const handoff = await deps.handoffs.get(ctx.subredditId, handoffId);
  if (!handoff) throw new Error("Handoff not found");
  assertHandoffTransition(handoff.status, status);
  const now = new Date().toISOString();
  const next: HandoffNote = {
    ...handoff,
    status,
    updatedAt: now,
    resolvedAt: status === "resolved" ? now : handoff.resolvedAt,
    readAt: status === "read" ? now : handoff.readAt,
  };
  await deps.handoffs.save(next);
  if (status === "resolved") {
    await deps.audit.recordCaseEvent({
      subredditId: ctx.subredditId,
      caseId: handoff.caseId,
      actorModId: ctx.modId,
      eventType: "handoff_resolved",
      payload: { handoffId },
      createdAt: now,
    });
  }
  return next;
}
