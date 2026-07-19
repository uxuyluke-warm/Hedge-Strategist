import { createFileRoute } from "@tanstack/react-router";

interface AnalyzeBody {
  system: string;
  prompt: string;
  model?: string;
  raw?: boolean;
}

// Per-API-key sliding-window rate limiter matching Groq free tier:
// 25 req/min per key (leaving headroom below Groq's 30/min) so concurrent
// requests across different server instances don't overshoot.
const rateBuckets = new Map<string, { timestamps: number[] }>();
function checkRateLimit(apiKey: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const windowStart = now - 60_000;
  let bucket = rateBuckets.get(apiKey);
  if (!bucket) {
    bucket = { timestamps: [] };
    rateBuckets.set(apiKey, bucket);
  }
  // Purge old timestamps
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);
  if (bucket.timestamps.length >= 25) {
    const oldest = bucket.timestamps[0];
    const retryAfter = Math.ceil((oldest + 61_000 - now) / 1000);
    return { ok: false, retryAfter };
  }
  bucket.timestamps.push(now);
  return { ok: true, retryAfter: 0 };
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as AnalyzeBody;
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          return new Response("GROQ_API_KEY not configured", { status: 400 });
        }

        const rate = checkRateLimit(apiKey);
        if (!rate.ok) {
          return new Response(
            JSON.stringify({ error: `Rate limited. Retry after ${rate.retryAfter}s.` }),
            { status: 429, headers: { "Retry-After": String(rate.retryAfter), "Content-Type": "application/json" } },
          );
        }

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: body.model ?? "llama-3.1-8b-instant",
            temperature: 0.2,
            messages: [
              { role: "system", content: body.system },
              { role: "user", content: body.prompt },
            ],
            ...(body.raw ? {} : { response_format: { type: "json_object" } }),
          }),
        });

        if (!res.ok) {
          // Extract Groq's Retry-After if present and forward it
          const groqRetryAfter = res.headers.get("Retry-After");
          const bodyText = await res.text();
          const headers: Record<string, string> = {};
          if (groqRetryAfter) headers["Retry-After"] = groqRetryAfter;
          return new Response(bodyText, { status: res.status, headers });
        }
        const data = (await res.json()) as {
          choices: { message: { content: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? "";
        if (body.raw) return Response.json({ text: content });
        try {
          return Response.json(JSON.parse(content));
        } catch {
          return new Response("Groq returned invalid JSON", { status: 502 });
        }
      },
    },
  },
});
