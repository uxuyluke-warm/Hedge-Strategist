import { createFileRoute } from "@tanstack/react-router";
import type { EtfFlowPoint } from "@/types";

export const Route = createFileRoute("/api/sosovalue")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const asset = (url.searchParams.get("asset") ?? "BTC").toUpperCase() as
          | "BTC"
          | "ETH";

        const apiKey = process.env.SOSOVALUE_API_KEY;
        if (!apiKey) {
          return new Response("SOSOVALUE_API_KEY not configured", { status: 400 });
        }

        const upstream = await fetch(
          `https://openapi.sosovalue.com/openapi/v1/etfs/summary-history?symbol=${asset}&country_code=US&limit=300`,
          { headers: { "x-soso-api-key": apiKey } },
        );
        if (!upstream.ok) {
          return new Response(await upstream.text(), { status: upstream.status });
        }

        const body = (await upstream.json()) as {
          code: number;
          message: string;
          data: unknown;
        };

        if (body.code !== 0 || !Array.isArray(body.data)) {
          return new Response(JSON.stringify(body), { status: 502 });
        }

        // API returns latest first; reverse to chronological for the frontend
        const raw = body.data.slice().reverse() as { date: string; total_net_inflow: number; cum_net_inflow?: number }[];
        let cumulative = 0;
        const flows: EtfFlowPoint[] = raw.map((p) => {
          const net = Math.round(Number(p.total_net_inflow));
          // Use API's cum_net_inflow if available, otherwise compute from net flows
          const cum = p.cum_net_inflow != null ? Math.round(Number(p.cum_net_inflow)) : (cumulative += net);
          return { date: p.date.slice(0, 10), netFlowUsd: net, cumulativeUsd: cum, asset };
        });

        return Response.json({ flows, source: "sosovalue" });
      },
    },
  },
});
