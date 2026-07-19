import { createFileRoute } from "@tanstack/react-router";
import { saveTrade, getTrades } from "@/services/archive";

export const Route = createFileRoute("/api/trades")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet") ?? undefined;
        const trades = await getTrades(wallet);
        return Response.json({ trades });
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const trade = {
          id: body.id as string,
          wallet: body.wallet as string,
          asset: body.asset as string,
          side: body.side as "BUY" | "SELL",
          quantity: body.quantity as string,
          notionalUsd: Number(body.notionalUsd ?? 0),
          orderType: (body.orderType as string) ?? "MARKET",
          marginMode: (body.marginMode as string) ?? "CROSS",
          orderID: body.orderID as string,
          takeProfit: body.takeProfit as string | undefined,
          stopLoss: body.stopLoss as string | undefined,
          timestamp: Date.now(),
        };
        const ok = await saveTrade(trade);
        return Response.json({ ok });
      },
    },
  },
});