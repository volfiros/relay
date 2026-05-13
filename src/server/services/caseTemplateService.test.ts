import { describe, expect, it } from "bun:test";
import { InMemoryRedis } from "../test/inMemoryRedis";
import { CaseTemplateService } from "./caseTemplateService";

describe("CaseTemplateService", () => {
  it("stores enabled templates and hides disabled templates by default", async () => {
    const service = new CaseTemplateService(new InMemoryRedis());
    await service.saveTemplate({
      id: "template_rule_review",
      subredditId: "sub1",
      title: "Rule review",
      category: "Rule review",
      urgency: "normal",
      notePrompt: "What rule and context matter?",
      enabled: true,
    });
    await service.saveTemplate({
      id: "template_disabled",
      subredditId: "sub1",
      title: "Disabled",
      category: "Other",
      urgency: "low",
      notePrompt: "Disabled",
      enabled: false,
    });

    await expect(service.listTemplates("sub1")).resolves.toHaveLength(1);
    await expect(service.listTemplates("sub1", true)).resolves.toHaveLength(2);
  });
});
