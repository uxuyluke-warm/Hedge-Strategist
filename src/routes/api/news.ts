import { createFileRoute } from "@tanstack/react-router";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
}

export const Route = createFileRoute("/api/news")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const asset = (url.searchParams.get("asset") ?? "BTC,ETH").toUpperCase();

        const apiKey = process.env.CRYPTOPANIC_API_KEY;
        if (!apiKey) {
          // Return empty when no API key — AI falls back to flow-only analysis
          return Response.json({ news: [] });
        }

        try {
          const res = await fetch(
            `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&currencies=${asset}&limit=8`,
            { headers: { Accept: "application/json" } },
          );
          if (!res.ok) return Response.json({ news: [] });

          const body = (await res.json()) as { results?: Array<Record<string, unknown>> };
          const results = body.results ?? [];
          const news: NewsItem[] = results.map((r) => ({
            title: String(r.title ?? ""),
            url: String(r.url ?? ""),
            source: String((r as Record<string, Record<string, string>>).source?.title ?? "cryptopanic"),
            publishedAt: String(r.published_at ?? ""),
            sentiment: classifySentiment(r.votes as Record<string, number> | undefined),
          }));

          return Response.json({ news });
        } catch {
          return Response.json({ news: [] });
        }
      },
    },
  },
});

function classifySentiment(votes?: Record<string, number>): "positive" | "negative" | "neutral" {
  if (!votes) return "neutral";
  const positive = votes.positive ?? 0;
  const negative = votes.negative ?? 0;
  if (positive > negative) return "positive";
  if (negative > positive) return "negative";
  return "neutral";
}