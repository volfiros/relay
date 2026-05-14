import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { App } from "./App";
import { AppealMemory } from "./screens/AppealMemory";
import { CaseDetail } from "./screens/CaseDetail";
import { CaseTemplates } from "./screens/CaseTemplates";
import { DecisionBrief } from "./screens/DecisionBrief";
import { IncidentExport } from "./screens/IncidentExport";
import { LearningMode } from "./screens/LearningMode";
import { MyCatchUp } from "./screens/MyCatchUp";
import { PatternSummaries } from "./screens/PatternSummaries";
import { RelayBoard } from "./screens/RelayBoard";
import { Settings } from "./screens/Settings";
import type { BoardFilterValues } from "./components/BoardFilters";

type BriefSearch = {
  targetType: "post" | "comment" | null;
  targetId: string | null;
};

type BoardSearch = BoardFilterValues;

const rootRoute = createRootRoute({
  component: App,
});

const catchUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MyCatchUp,
});

const briefRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/brief",
  validateSearch: (search: Record<string, unknown>): BriefSearch => ({
    targetType: search.targetType === "post" || search.targetType === "comment" ? search.targetType : null,
    targetId: typeof search.targetId === "string" ? search.targetId : null,
  }),
  component: BriefRoute,
});

function BriefRoute() {
  const search = briefRoute.useSearch();
  return <DecisionBrief targetType={search.targetType} targetId={search.targetId} />;
}

const caseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$caseId",
  component: CaseDetailRoute,
});

function CaseDetailRoute() {
  const { caseId } = caseDetailRoute.useParams();
  return <CaseDetail caseId={caseId} />;
}

const relayBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/board",
  validateSearch: (search: Record<string, unknown>): BoardSearch => ({
    status:
      search.status === "open" || search.status === "watching" || search.status === "needs_review" || search.status === "handed_off"
        ? search.status
        : "",
    urgency:
      search.urgency === "urgent" || search.urgency === "high" || search.urgency === "normal" || search.urgency === "low"
        ? search.urgency
        : "",
  }),
  component: RelayBoardRoute,
});

function RelayBoardRoute() {
  const filters = relayBoardRoute.useSearch();
  return <RelayBoard filters={filters} />;
}

const appealMemoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/appeal-memory",
  component: AppealMemory,
});

const learningModeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learning",
  component: LearningMode,
});

const patternSummariesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patterns",
  component: PatternSummaries,
});

const caseTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/templates",
  component: CaseTemplates,
});

const incidentExportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/export",
  component: IncidentExport,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  catchUpRoute,
  briefRoute,
  caseDetailRoute,
  relayBoardRoute,
  appealMemoryRoute,
  learningModeRoute,
  patternSummariesRoute,
  caseTemplatesRoute,
  incidentExportRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
