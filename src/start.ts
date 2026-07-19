import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Log ALL errors before deciding how to handle them
    console.error("[SSR Middleware] caught error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error) console.error("[SSR Middleware] stack:", error.stack);
    if (error != null && typeof error === "object") {
      try { console.error("[SSR Middleware] full object:", JSON.stringify(Object.getOwnPropertyNames(error).concat(Object.keys(error)), null, 2)); } catch {}
      try { console.error("[SSR Middleware] own keys:", Object.keys(error)); } catch {}
      try { console.error("[SSR Middleware] status:", error.status); } catch {}
      try { console.error("[SSR Middleware] statusCode:", error.statusCode); } catch {}
      try { console.error("[SSR Middleware] unhandled:", error.unhandled); } catch {}
      try { console.error("[SSR Middleware] cause:", error.cause); } catch {}
    }
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
