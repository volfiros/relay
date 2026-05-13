import type { CaseEvent, CaseEventType } from "../domain/types";
import type { CaseEventRepository } from "../repositories/caseEventRepository";

export class AuditService {
  constructor(private readonly events: CaseEventRepository) {}

  async recordCaseEvent(input: {
    subredditId: string;
    caseId: string;
    actorModId: string;
    eventType: CaseEventType;
    payload: Record<string, unknown>;
    createdAt: string;
  }): Promise<CaseEvent> {
    const event: CaseEvent = {
      id: crypto.randomUUID(),
      subredditId: input.subredditId,
      caseId: input.caseId,
      actorModId: input.actorModId,
      eventType: input.eventType,
      createdAt: input.createdAt,
      payload: input.payload,
    };
    await this.events.save(event);
    return event;
  }
}
