import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";
import { defineConfig, type Plugin } from "vite";
import serverApp from "./src/server";

export default defineConfig({
  plugins: [react(), relayApiDevServer()],
  build: {
    outDir: "dist",
  },
});

function relayApiDevServer(): Plugin {
  return {
    name: "relay-api-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !shouldHandleWithRelayServer(req.url)) {
          next();
          return;
        }

        try {
          const request = await toFetchRequest(req);
          const response = await serverApp.fetch(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

function shouldHandleWithRelayServer(url: string): boolean {
  const pathname = new URL(url, "http://relay.local").pathname;
  return pathname.startsWith("/api/") || pathname.startsWith("/internal/");
}

async function toFetchRequest(req: IncomingMessage): Promise<Request> {
  const method = req.method ?? "GET";
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value) {
      headers.set(key, value);
    }
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const body = method === "GET" || method === "HEAD" ? undefined : await readRequestBody(req);
  return new Request(url, { body, headers, method });
}

async function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
