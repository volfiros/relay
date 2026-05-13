import { describe, expect, it } from "bun:test";
import { CaseRepository } from "../repositories/caseRepository";
import { InMemoryRedis } from "../test/inMemoryRedis";
import { makeCase } from "../test/fixtures";
import { DuplicateCaseService } from "./duplicateCaseService";

describe("DuplicateCaseService", () => {
  it("returns only active duplicate cases for the same target", async () => {
    const cases = new CaseRepository(new InMemoryRedis());
    const service = new DuplicateCaseService(cases);

    await cases.saveCase(makeCase({ id: "case_open", targetId: "t3_alpha", status: "open" }));
    await cases.saveCase(makeCase({ id: "case_resolved", targetId: "t3_alpha", status: "resolved" }));

    await expect(service.findOpenDuplicates("sub1", "t3_alpha")).resolves.toMatchObject([{ id: "case_open" }]);
  });
});
