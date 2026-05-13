import { Hono } from "hono";

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

export default app;
