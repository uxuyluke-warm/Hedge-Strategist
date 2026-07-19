import { createFileRoute } from "@tanstack/react-router";
import {
  SODEX_CHAIN_ID,
  newOrderRequest,
  signingEnvelope,
  computePayloadHash,
  notionalToQuantity,
  estimateNotional,
  QUANTITY_PRECISION,
  STEP_SIZE,
  EIP712_TYPES,
} from "@/services/sodex-gateway";

const SYMBOL_MAP: Record<string, number> = { BTC: 1, ETH: 2 };

export const Route = createFileRoute("/api/sodex-prepare")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet") ?? "";
        const asset = (url.searchParams.get("asset") ?? "").toUpperCase();
        const side = url.searchParams.get("side") ?? "";
        const rawSize = url.searchParams.get("size") ?? "0";
        const orderType = (url.searchParams.get("orderType") ?? "MARKET") as "MARKET" | "LIMIT";
        const rawPrice = url.searchParams.get("price") ?? "";
        const rawTakeProfit = url.searchParams.get("takeProfit") ?? "";
        const rawStopLoss = url.searchParams.get("stopLoss") ?? "";
        const marginMode = (url.searchParams.get("marginMode") ?? "CROSS") as "CROSS" | "ISOLATED";
        const accountID = Number(url.searchParams.get("accountID") ?? "0");
        const markPrice = Number(url.searchParams.get("markPrice") ?? "0");

        if (!wallet || !asset || !side)
          return new Response("wallet, asset, side required", { status: 400 });
        if (!accountID)
          return new Response("accountID required", { status: 400 });
        if (!markPrice || markPrice <= 0)
          return new Response("markPrice required", { status: 400 });

        const symbolID = SYMBOL_MAP[asset];
        if (!symbolID)
          return new Response(`unsupported asset: ${asset}`, { status: 400 });

        const size = Number(rawSize);
        if (size <= 0) return new Response("size must be > 0", { status: 400 });

        if (!markPrice || markPrice <= 0) {
          return new Response("invalid mark price", { status: 502 });
        }

        const precision = QUANTITY_PRECISION[asset] ?? 5;
        const step = STEP_SIZE[asset] ?? "0.00001";
        const quantity = notionalToQuantity(size, markPrice, step, precision);

        const estimated = estimateNotional(quantity, markPrice);
        if (estimated < 10) {
          return new Response(
            JSON.stringify({ ok: false, error: `Order value $${estimated.toFixed(2)} below minimum $10. Increase your position size.` }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const clOrdID = `hs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const nonce = Date.now();
        const orderSide = side === "SELL" ? 2 : 1;

        const req = newOrderRequest({
          accountID,
          symbolID,
          side: orderSide,
          quantity,
          clOrdID,
          orderType,
          price: rawPrice || undefined,
          marginMode,
          takeProfit: rawTakeProfit ? Number(rawTakeProfit) : undefined,
          stopLoss: rawStopLoss ? Number(rawStopLoss) : undefined,
        });
        const envelope = signingEnvelope(req);
        const payloadHash = computePayloadHash(envelope);

        const typedData = {
          types: EIP712_TYPES,
          domain: {
            name: "futures",
            version: "1",
            chainId: SODEX_CHAIN_ID,
            verifyingContract: "0x0000000000000000000000000000000000000000",
          },
          primaryType: "ExchangeAction",
          message: { payloadHash, nonce },
        };

        const reqJson = JSON.stringify(req);

        return Response.json({ typedData, accountID, symbolID, clOrdID, quantity, markPrice, reqJson });
      },
    },
  },
});
