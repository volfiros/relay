import { describe, expect, it } from "bun:test";
import { CaseRepository } from "./caseRepository";
import { keys } from "./keys";
import { InMemoryRedis } from "../test/inMemoryRedis";
import { makeCase } from "../test/fixtures";

describe("CaseRepository", () => {
  it("saves a case and indexes it by status, owner, target, author, and updated time", async () => {
    const redis = new InMemoryRedis();
    const repository = new CaseRepository(redis);
    const caseCard = makeCase();

    await repository.saveCase(caseCard);

    await expect(repository.getCase("sub1", "case1")).resolves.toEqual(caseCard);
    await expect(redis.zRange(keys.caseByStatus("sub1", "open"), 0, -1)).resolves.toEqual(["case1"]);
    await expect(redis.zRange(keys.caseByOwner("sub1", "mod_a"), 0, -1)).resolves.toEqual(["case1"]);
    await expect(redis.zRange(keys.caseByTarget("sub1", "t1_comment"), 0, -1)).resolves.toEqual(["case1"]);
    await expect(redis.zRange(keys.caseByAuthor("sub1", "author_a"), 0, -1)).resolves.toEqual(["case1"]);
    await expect(repository.listRecentlyUpdatedCaseIds("sub1", 5)).resolves.toEqual(["case1"]);
  });

  it("cleans up changed status and owner indexes", async () => {
    const redis = new InMemoryRedis();
    const repository = new CaseRepository(redis);

    await repository.saveCase(makeCase());
    await repository.saveCase(makeCase({ status: "needs_review", ownerModId: "mod_b" }));

    await expect(redis.zRange(keys.caseByStatus("sub1", "open"), 0, -1)).resolves.toEqual([]);
    await expect(redis.zRange(keys.caseByStatus("sub1", "needs_review"), 0, -1)).resolves.toEqual(["case1"]);
    await expect(redis.zRange(keys.caseByOwner("sub1", "mod_a"), 0, -1)).resolves.toEqual([]);
    await expect(redis.zRange(keys.caseByOwner("sub1", "mod_b"), 0, -1)).resolves.toEqual(["case1"]);
  });
});
