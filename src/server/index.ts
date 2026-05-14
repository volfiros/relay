import { Hono } from "hono";
import type { Context } from "hono";
import { getRuntimeRouteContext, runtimeDeps } from "./runtimeDeps";
import { getBoardRoute } from "./routes/boardRoutes";
import { createCaseRoute, getCaseRoute, updateCaseStatusRoute, type CreateCaseRequest } from "./routes/caseRoutes";
import { getCatchUpRoute } from "./routes/catchUpRoutes";
import { getDecisionBriefRoute } from "./routes/decisionBriefRoutes";
import { resetDemoRoute, seedDemoRoute } from "./routes/devRoutes";
import { getSettingsRoute, updateSettingsRoute } from "./routes/settingsRoutes";
import type { CaseStatus, TargetType, Urgency } from "./domain/types";
import type { BoardFilters } from "./services/boardService";

const app = new Hono();

app.get("/api/health", (context) => {
  return context.json({ ok: true, app: "relay" });
});

app.post("/internal/menu/open-relay", (context) => {
  return context.json({
    showToast: {
      text: "Open Relay from the app surface to continue this case workflow.",
      appearance: "neutral",
    },
  });
});

app.post("/internal/menu/open-catch-up", (context) => {
  return context.json({
    showToast: {
      text: "Open Relay My Catch-Up from the app surface.",
      appearance: "neutral",
    },
  });
});

app.get("/api/catch-up", (context) => {
  return routeJson(context, () => getCatchUpRoute(runtimeDeps, getRuntimeRouteContext()));
});

app.get("/api/decision-brief", (context) => {
  return routeJson(context, () =>
    getDecisionBriefRoute(runtimeDeps, getRuntimeRouteContext(), {
      targetType: context.req.query("targetType") as TargetType,
      targetId: requireQueryParam(context, "targetId"),
    }),
  );
});

app.post("/api/cases", async (context) => {
  const body = (await context.req.json()) as CreateCaseRequest;
  return routeJson(context, () => createCaseRoute(runtimeDeps, getRuntimeRouteContext(), body));
});

app.get("/api/cases/:caseId", (context) => {
  return routeJson(context, () => getCaseRoute(runtimeDeps, getRuntimeRouteContext(), context.req.param("caseId")));
});

app.patch("/api/cases/:caseId", async (context) => {
  const body = (await context.req.json()) as { status: CaseStatus };
  return routeJson(context, () => updateCaseStatusRoute(runtimeDeps, getRuntimeRouteContext(), context.req.param("caseId"), body.status));
});

app.get("/api/board", (context) => {
  return routeJson(context, () => getBoardRoute(runtimeDeps, getRuntimeRouteContext(), getBoardFilters(context)));
});

app.get("/api/settings", (context) => {
  return routeJson(context, () => getSettingsRoute(runtimeDeps, getRuntimeRouteContext()));
});

app.patch("/api/settings", async (context) => {
  const body = (await context.req.json()) as Parameters<typeof updateSettingsRoute>[2];
  return routeJson(context, () => updateSettingsRoute(runtimeDeps, getRuntimeRouteContext(), body));
});

app.post("/api/dev/seed-demo", (context) => {
  return routeJson(context, () => seedDemoRoute(runtimeDeps));
});

app.post("/api/dev/reset-demo", (context) => {
  return routeJson(context, () => resetDemoRoute(runtimeDeps));
});

async function routeJson<T>(context: Context, handler: () => Promise<T>) {
  try {
    return context.json(await handler());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === "Permission denied") return context.text("Permission denied", 403);
    if (message === "Demo routes disabled") return context.text("Demo routes disabled", 403);
    if (message.endsWith("not found")) return context.text(message, 404);
    return context.text(message, 400);
  }
}

function requireQueryParam(context: Context, name: string): string {
  const value = context.req.query(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getBoardFilters(context: Context): BoardFilters {
  const status = context.req.query("status");
  const urgency = context.req.query("urgency");
  return {
    ...(status ? { status } : {}),
    ...(isUrgency(urgency) ? { urgency } : {}),
  };
}

function isUrgency(value: string | undefined): value is Urgency {
  return value === "low" || value === "normal" || value === "high" || value === "urgent";
}

export default app;
