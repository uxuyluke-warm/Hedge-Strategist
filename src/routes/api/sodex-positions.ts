import { createFileRoute } from "@tanstack/react-router";

interface SoDEXPosition {
  symbolID: number;
  size: string;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
  margin: string;
  liquidationPrice: string;
  leverage: string;
  side: number; // 1=long, 2=short
}

export interface PositionView {
  symbol: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  pnlPercent: number;
  margin: number;
  liquidationPrice: number;
  leverage: number;
  side: "LONG" | "SHORT";
}

const SYMBOL_MAP: Record<number, string> = { 1: "BTC-PERP", 2: "ETH-PERP" };
const SODEX_PERPS_API = "https://testnet-gw.sodex.dev/api/v1/perps";

export const Route = createFileRoute("/api/sodex-positions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet") ?? "";
        if (!wallet) return new Response("wallet required", { status: 400 });

        try {
          const upstream = await fetch(
            `${SODEX_PERPS_API}/accounts/${wallet}/positions`,
            { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
          );
          if (!upstream.ok) {
            return Response.json({ positions: [] });
          }

          const body = await upstream.json() as {
            code: number;
            data?: SoDEXPosition[];
          };

          if (body.code !== 0 || !Array.isArray(body.data)) {
            return Response.json({ positions: [] });
          }

          const positions: PositionView[] = body.data
            .filter((p) => Number(p.size) !== 0)
            .map((p) => {
              const size = Number(p.size);
              const margin = Number(p.margin);
              return {
                symbol: SYMBOL_MAP[p.symbolID] ?? `ID-${p.symbolID}`,
                size: Math.abs(size),
                entryPrice: Number(p.entryPrice),
                markPrice: Number(p.markPrice),
                unrealizedPnl: Number(p.unrealizedPnl),
                pnlPercent: margin > 0 ? (Number(p.unrealizedPnl) / margin) * 100 : 0,
                margin,
                liquidationPrice: Number(p.liquidationPrice),
                leverage: Number(p.leverage),
                side: p.side === 2 ? "SHORT" : "LONG",
              };
            });

          return Response.json({ positions });
        } catch {
          return Response.json({ positions: [] });
        }
      },
    },
  },
});