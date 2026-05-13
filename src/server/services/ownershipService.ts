import type { CaseRepository } from "../repositories/caseRepository";
import type { AuditService } from "./auditService";
import type { PermissionService } from "./permissionService";

export class OwnershipService {
  constructor(
    private readonly permissions: PermissionService,
    private readonly cases: CaseRepository,
    private readonly audit: AuditService,
  ) {}

  async updateOwner(input: {
    subredditId: string;
    subredditName: string;
    actorModId: string;
    caseId: string;
    ownerModId: string;
  }) {
    await this.permissions.assertModeratorAccess(input.subredditName, input.actorModId);
    const caseCard = await this.cases.getCase(input.subredditId, input.caseId);
    if (!caseCard) throw new Error("Case not found");
    const now = new Date().toISOString();
    const next = { ...caseCard, ownerModId: input.ownerModId, updatedAt: now };
    await this.cases.saveCase(next);
    await this.audit.recordCaseEvent({
      subredditId: input.subredditId,
      caseId: input.caseId,
      actorModId: input.actorModId,
      eventType: "note_added",
      payload: { ownerChanged: true, from: caseCard.ownerModId, to: input.ownerModId },
      createdAt: now,
    });
    return next;
  }
}
