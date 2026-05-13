import { CaseDetail } from "./screens/CaseDetail";
import { AppealMemory } from "./screens/AppealMemory";
import { CaseTemplates } from "./screens/CaseTemplates";
import { DecisionBrief } from "./screens/DecisionBrief";
import { IncidentExport } from "./screens/IncidentExport";
import { LearningMode } from "./screens/LearningMode";
import { MyCatchUp } from "./screens/MyCatchUp";
import { PatternSummaries } from "./screens/PatternSummaries";
import { RelayBoard } from "./screens/RelayBoard";
import { Settings } from "./screens/Settings";
import { routes } from "./routes";

export function App() {
  const path = window.location.pathname;
  const caseMatch = path.match(/^\/cases\/([^/]+)$/);
  let screen = <MyCatchUp />;

  if (path === "/brief") {
    screen = <DecisionBrief />;
  } else if (path === "/board") {
    screen = <RelayBoard />;
  } else if (path === "/appeal-memory") {
    screen = <AppealMemory />;
  } else if (path === "/learning") {
    screen = <LearningMode />;
  } else if (path === "/patterns") {
    screen = <PatternSummaries />;
  } else if (path === "/templates") {
    screen = <CaseTemplates />;
  } else if (path === "/export") {
    screen = <IncidentExport />;
  } else if (path === "/settings") {
    screen = <Settings />;
  } else if (caseMatch) {
    screen = <CaseDetail caseId={decodeURIComponent(caseMatch[1])} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1>Relay</h1>
        <nav aria-label="Primary">
          <a href={routes.catchUp()}>My Catch-Up</a>
          <a href={routes.relayBoard()}>Relay Board</a>
          <a href={routes.settings()}>Settings</a>
        </nav>
      </header>
      {screen}
    </main>
  );
}
