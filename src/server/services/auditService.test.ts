import { describe, expect, it } from "bun:test";
import { CaseEventRepository } from "../repositories/caseEventRepository";
import { InMemoryRedis } from "../test/inMemoryRedis";
import { AuditService } from "./auditService";

describe("AuditService", () => {
  it("records and indexes case events", async () => {
    const repository = new CaseEventRepository(new InMemoryRedis());
    const service = new AuditService(repository);

    const event = await service.recordCaseEvent({
      subredditId: "sub1",
      caseId: "case1",
      actorModId: "mod_a",
      eventType: "case_created",
      payload: { title: "Borderline comment" },
      createdAt: "2026-05-13T00:00:00.000Z",
    });

    await expect(repository.get("sub1", "case1", event.id)).resolves.toEqual(event);
    await expect(repository.listEventIdsForCase("sub1", "case1")).resolves.toEqual([event.id]);
  });
});
