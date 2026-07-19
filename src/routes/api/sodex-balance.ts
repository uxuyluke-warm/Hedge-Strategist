import { createFileRoute } from "@tanstack/react-router";
import type { WalletBalance } from "@/types";

const SODEX_PERPS_API = "https://testnet-gw.sodex.dev/api/v1/perps";

export const Route = createFileRoute("/api/sodex-balance")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet") ?? "";
        if (!wallet) return new Response("wallet required", { status: 400 });

        const upstream = await fetch(
          `${SODEX_PERPS_API}/accounts/${wallet}/balances`,
          { headers: { Accept: "application/json" } },
        );
        if (!upstream.ok) {
          return new Response(await upstream.text(), { status: upstream.status });
        }

        const body = (await upstream.json()) as {
          code: number;
          data: { balances: { coin: string; total: string; collateral: string; price: string }[] };
        };

        if (body.code !== 0) {
          return new Response("SoDEX API error", { status: 502 });
        }

        const balances: WalletBalance[] = (body.data.balances ?? []).map((b) => {
          const total = Number(b.total) || 0;
          const collat = Number(b.collateral) || 0;
          const price = Number(b.price) || 1;
          return {
            asset: b.coin,
            free: total - collat,
            locked: collat,
            usdValue: total * price,
          };
        });

        return Response.json({ balances, source: "sodex" });
      },
    },
  },
});
