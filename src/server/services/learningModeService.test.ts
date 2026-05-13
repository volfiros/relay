import { describe, expect, it } from "bun:test";
import { LearningModeService } from "./learningModeService";
import { makeCase } from "../test/fixtures";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("LearningModeService", () => {
  it("groups resolved non-sensitive cases by category", async () => {
    const deps = makeRouteTestDeps();
    const service = new LearningModeService(deps.cases);
    await deps.cases.saveCase(makeCase({ id: "case_public", status: "resolved", category: "Rule review", isSensitive: false }));
    await deps.cases.saveCase(makeCase({ id: "case_sensitive", status: "resolved", category: "Rule review", isSensitive: true }));

    const grouped = await service.getResolvedCases({ subredditId: "sub1" });

    expect(grouped["Rule review"].map((item) => item.caseId)).toEqual(["case_public"]);
  });
});
