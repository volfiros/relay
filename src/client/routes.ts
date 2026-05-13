export const routes = {
  catchUp: () => "/",
  decisionBrief: (targetType: "post" | "comment", targetId: string) =>
    `/brief?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
  caseDetail: (caseId: string) => `/cases/${encodeURIComponent(caseId)}`,
  settings: () => "/settings",
  relayBoard: () => "/board",
  appealMemory: () => "/appeal-memory",
  learningMode: () => "/learning",
  patternSummaries: () => "/patterns",
  caseTemplates: () => "/templates",
  incidentExport: () => "/export",
};
