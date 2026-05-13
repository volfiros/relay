import { describe, expect, it } from "bun:test";
import { IncidentExportService } from "./incidentExportService";
import { makeCase } from "../test/fixtures";
import { makeRouteTestDeps } from "../test/routeTestDeps";

describe("IncidentExportService", () => {
  it("exports case timeline markdown without full content snapshots", async () => {
    const deps = makeRouteTestDeps();
    const service = new IncidentExportService(deps.cases, deps.events);
    await deps.cases.saveCase(makeCase({ id: "case1", title: "Incident case", isSensitive: true }));
    await deps.audit.recordCaseEvent({
      subredditId: "sub1",
      caseId: "case1",
      actorModId: "mod_a",
      eventType: "case_created",
      payload: { title: "Incident case" },
      createdAt: "2026-05-13T00:00:00.000Z",
    });

    const markdown = await service.exportMarkdown("sub1", "case1");

    expect(markdown).toContain("# Incident case");
    expect(markdown).toContain("Sensitive: yes");
    expect(markdown).toContain("case_created");
  });
});
