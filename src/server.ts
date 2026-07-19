import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// Process-level capture for errors that escape normal try-catch chains
// (e.g. secondary throws inside seroval serialization in TanStack Start's catch block)
let processCapturedError: unknown | undefined;
if (typeof process !== "undefined") {
  const _process = process;
  if (_process.listeners) {
    // Only register if not already registered
    if (_process.listeners("uncaughtExceptionMonitor").length === 0) {
      _process.on("uncaughtExceptionMonitor", (err) => {
        processCapturedError = err;
        console.error("[server.ts] uncaughtExceptionMonitor:", err);
      });
    }
    if (_process.listeners("unhandledRejection").length === 0) {
      _process.on("unhandledRejection", (reason) => {
        processCapturedError = reason;
        console.error("[server.ts] unhandledRejection:", reason);
      });
    }
  }
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const captured = consumeLastCapturedError();
  const debugError = captured ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(debugError);
  const msg = debugError instanceof Error ? debugError.message : String(debugError);
  const stack = debugError instanceof Error ? (debugError as Error).stack ?? "" : "";
  return new Response(`<!doctype html><html><head><title>SSR Debug (h3 swallowed)</title><meta charset="utf-8"/><style>body{font:14px/1.6 monospace;background:#111;color:#eee;padding:2rem}h1{color:#f87171}pre{background:#1e1e1e;padding:1rem;border-radius:8px;overflow-x:auto;white-space:pre-wrap;word-break:break-all}</style></head><body><h1>SSR Error (h3 swallowed)</h1><p><strong>Message:</strong> ${msg.replace(/</g, "&lt;")}</p><pre>${stack.replace(/</g, "&lt;")}</pre><p>h3 body: ${body.replace(/</g, "&lt;")}</p></body></html>`, {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function renderDebugErrorPage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack ?? "" : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SSR Debug Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 14px/1.6 monospace; background: #111; color: #eee; padding: 2rem; }
      h1 { color: #f87171; }
      pre { background: #1e1e1e; padding: 1rem; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
    </style>
  </head>
  <body>
    <h1>SSR Error (debug)</h1>
    <p><strong>Message:</strong> ${msg.replace(/</g, "&lt;")}</p>
    <pre>${stack.replace(/</g, "&lt;")}</pre>
    <p>Node: ${typeof process !== "undefined" ? process.version : "N/A"}</p>
  </body>
</html>`;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderDebugErrorPage(error), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
