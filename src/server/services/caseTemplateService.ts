import type { Urgency } from "../domain/types";
import type { RelayRedis } from "../repositories/redisTypes";

export interface CaseTemplate {
  id: string;
  subredditId: string;
  title: string;
  category: string;
  urgency: Urgency;
  notePrompt: string;
  enabled: boolean;
}

export class CaseTemplateService {
  constructor(private readonly redis: RelayRedis) {}

  async saveTemplate(template: CaseTemplate): Promise<void> {
    const templates = await this.listTemplates(template.subredditId, true);
    const next = templates.filter((item) => item.id !== template.id).concat(template);
    await this.redis.set(templateKey(template.subredditId), JSON.stringify(next));
  }

  async listTemplates(subredditId: string, includeDisabled = false): Promise<CaseTemplate[]> {
    const value = await this.redis.get(templateKey(subredditId));
    const templates = value ? (JSON.parse(value) as CaseTemplate[]) : [];
    return includeDisabled ? templates : templates.filter((template) => template.enabled);
  }
}

function templateKey(subredditId: string): string {
  return `templates:${subredditId}`;
}
