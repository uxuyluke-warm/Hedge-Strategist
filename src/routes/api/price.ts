import { createFileRoute } from "@tanstack/react-router";

const CG_IDS: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum" };
const BINANCE_SYMBOLS: Record<string, string> = { BTC: "BTCUSDT", ETH: "ETHUSDT" };

export const Route = createFileRoute("/api/price")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const asset = (url.searchParams.get("asset") ?? "BTC").toUpperCase();

        // Primary: CoinGecko (no API key, works everywhere)
        const cgId = CG_IDS[asset];
        if (cgId) {
          try {
            const res = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true`,
              { signal: AbortSignal.timeout(5000) },
            );
            if (res.ok) {
              const d = (await res.json()) as Record<string, { usd: number; usd_24h_change?: number }>;
              const data = d[cgId];
              if (data?.usd) {
                return Response.json({ price: data.usd, change24h: data.usd_24h_change ?? 0 });
              }
            }
          } catch { /* fall through */ }
        }

        // Fallback: Binance REST
        const binSymbol = BINANCE_SYMBOLS[asset];
        if (binSymbol) {
          try {
            const res = await fetch(
              `https://api.binance.com/api/v3/ticker/24hr?symbol=${binSymbol}`,
              { signal: AbortSignal.timeout(5000) },
            );
            if (res.ok) {
              const d = (await res.json()) as { lastPrice: string; priceChangePercent: string };
              return Response.json({
                price: Number(d.lastPrice ?? 0),
                change24h: Number(d.priceChangePercent ?? 0),
              });
            }
          } catch { /* fall through */ }
        }

        return Response.json({ price: 0, change24h: 0 });
      },
    },
  },
});