import type { CaseEventRepository } from "../repositories/caseEventRepository";
import type { CaseRepository } from "../repositories/caseRepository";

export class IncidentExportService {
  constructor(
    private readonly cases: CaseRepository,
    private readonly events: CaseEventRepository,
  ) {}

  async exportMarkdown(subredditId: string, caseId: string): Promise<string> {
    const caseCard = await this.cases.getCase(subredditId, caseId);
    if (!caseCard) throw new Error("Case not found");
    const eventIds = await this.events.listEventIdsForCase(subredditId, caseId);
    const events = await Promise.all(eventIds.map((eventId) => this.events.get(subredditId, caseId, eventId)));
    const lines = [
      `# ${caseCard.title}`,
      "",
      `Target: ${caseCard.targetPermalink}`,
      `Status: ${caseCard.status}`,
      `Urgency: ${caseCard.urgency}`,
      `Created: ${caseCard.createdAt}`,
      `Updated: ${caseCard.updatedAt}`,
      `Sensitive: ${caseCard.isSensitive ? "yes" : "no"}`,
      "",
      "## Summary",
      "",
      caseCard.summary,
      "",
      "## Timeline",
      "",
      ...events
        .filter((event) => event !== null)
        .map((event) => `- ${event.createdAt} ${event.eventType} by ${event.actorModId}: ${JSON.stringify(event.payload)}`),
    ];
    return lines.join("\n");
  }
}
