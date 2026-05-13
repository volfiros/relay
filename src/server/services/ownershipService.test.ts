import { describe, expect, it } from "bun:test";
import { OwnershipService } from "./ownershipService";
import { makeCase } from "../test/fixtures";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("OwnershipService", () => {
  it("updates owner index and records event history", async () => {
    const deps = makeRouteTestDeps();
    const service = new OwnershipService(deps.permissions, deps.cases, deps.audit);
    await deps.cases.saveCase(makeCase({ id: "case1", ownerModId: "mod_a" }));

    const updated = await service.updateOwner({
      subredditId: "sub1",
      subredditName: "RelayTest",
      actorModId: "mod_a",
      caseId: "case1",
      ownerModId: "mod_b",
    });
    const eventIds = await deps.events.listEventIdsForCase("sub1", "case1");

    expect(updated.ownerModId).toBe("mod_b");
    await expect(deps.cases.listCaseIdsByOwner("sub1", "mod_b")).resolves.toEqual(["case1"]);
    await expect(deps.cases.listCaseIdsByOwner("sub1", "mod_a")).resolves.toEqual([]);
    expect(eventIds).toHaveLength(1);
  });
});
