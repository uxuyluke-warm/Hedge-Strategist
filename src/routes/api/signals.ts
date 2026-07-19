import { createFileRoute } from "@tanstack/react-router";
import { saveSignal, getSignals } from "@/services/archive";

export const Route = createFileRoute("/api/signals")({
  server: {
    handlers: {
      GET: async () => {
        const signals = await getSignals(20);
        return Response.json({ signals });
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const signal = {
          id: body.id as string,
          asset: body.asset as string,
          direction: body.direction as string,
          hedgeRatio: Number(body.hedgeRatio ?? 0),
          hedgeAction: body.hedgeAction as string,
          confidence: Number(body.confidence ?? 0),
          rationale: body.rationale as string,
          timestamp: Date.now(),
        };
        const ok = await saveSignal(signal);
        return Response.json({ ok });
      },
    },
  },
});