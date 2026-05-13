import { describe, expect, it } from "bun:test";
import { makeCase, makeFollowUp } from "../test/fixtures";
import { makeRouteTestDeps, routeContext } from "../test/routeTestDeps";
import { getDecisionBriefRoute } from "./decisionBriefRoutes";

describe("getDecisionBriefRoute", () => {
  it("returns prior cases, duplicate warnings, follow-up state, and missing context", async () => {
    const deps = makeRouteTestDeps({
      async getTarget() {
        return {
          targetPermalink: "https://reddit.com/r/test/comments/a",
          targetSummary: "Questionable comment",
          targetAuthor: "author_a",
          parentContext: "Parent comment",
        };
      },
    });
    await deps.cases.saveCase(makeCase({ id: "case_open", targetId: "t1_alpha", status: "open" }));
    await deps.followUps.save(makeFollowUp({ id: "followup1", targetId: "t1_alpha", status: "active" }));

    const dto = await getDecisionBriefRoute(deps, routeContext, { targetType: "comment", targetId: "t1_alpha" });

    expect(dto.targetSummary).toBe("Questionable comment");
    expect(dto.priorCases).toEqual([{ id: "case_open", title: "Borderline comment", status: "open", updatedAt: "2026-05-13T00:10:00.000Z" }]);
    expect(dto.duplicateWarning).toEqual({ caseId: "case_open", title: "Borderline comment", status: "open" });
    expect(dto.existingFollowUp).toEqual({ id: "followup1", status: "active", dueAt: null });
    expect(dto.missingContextFlags).toContain("report_context_unavailable");
  });
});
