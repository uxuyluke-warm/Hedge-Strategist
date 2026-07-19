import { createFileRoute } from "@tanstack/react-router";
import { SODEX_PERPS_API, SODEX_CHAIN_ID, signingEnvelope, computePayloadHash, EIP712_TYPES } from "@/services/sodex-gateway";
import { ethers } from "ethers";

export const Route = createFileRoute("/api/sodex-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          wallet: string;
          accountID: number;
          symbolID: number;
          side: "BUY" | "SELL";
          quantity: string;
          signature: string;
          nonce: number;
          clOrdID: string;
          reqJson: string;
        };

        if (!body.wallet || !body.signature) {
          return Response.json({ ok: false, error: "wallet and signature required" }, { status: 400 });
        }

        const req = JSON.parse(body.reqJson);
        const envelope = signingEnvelope(req);
        const payloadHash = computePayloadHash(envelope);
        const typedData = {
          types: EIP712_TYPES,
          domain: {
            name: "futures",
            version: "1",
            chainId: Number(SODEX_CHAIN_ID),
            verifyingContract: "0x0000000000000000000000000000000000000000",
          },
          primaryType: "ExchangeAction",
          message: { payloadHash, nonce: body.nonce },
        };

        let recoveredAddress: string | null = null;
        try {
          recoveredAddress = ethers.verifyTypedData(
            typedData.domain,
            { ExchangeAction: typedData.types.ExchangeAction },
            typedData.message,
            body.signature,
          );
        } catch (e) {
          return Response.json({ ok: false, error: `signature verification failed: ${(e as Error).message}` }, { status: 400 });
        }

        if (recoveredAddress.toLowerCase() !== body.wallet.toLowerCase()) {
          return Response.json({
            ok: false,
            error: `signer mismatch: expected ${body.wallet}, recovered ${recoveredAddress}`,
          }, { status: 400 });
        }

        const raw = body.signature.replace("0x", "");
        const r = raw.slice(0, 64);
        const s = raw.slice(64, 128);
        const vByte = raw.slice(128, 130);
        const v = parseInt(vByte, 16);
        const recid = v >= 27 ? v - 27 : v;
        const fullSig = "0x01" + r + s + recid.toString(16).padStart(2, "0");

        let upstream: Response;
        try {
          upstream = await fetch(`${SODEX_PERPS_API}/trade/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            Accept: "application/json",
            "X-API-Sign": fullSig,
            "X-API-Nonce": String(body.nonce),
            },
            body: body.reqJson,
            signal: AbortSignal.timeout(10000),
          });
        } catch (e) {
          return Response.json({ ok: false, error: `SoDEX request failed: ${(e as Error).message}` }, { status: 502 });
        }

        const text = await upstream.text();
        let parsed: { code?: number; data?: Array<{ code?: number; orderID?: number; error?: string }> };
        try {
          parsed = JSON.parse(text);
        } catch {
          return Response.json({ ok: false, error: text.slice(0, 500) }, { status: 502 });
        }

        const orderResults = parsed.data;
        if (parsed.code === 0 && orderResults && orderResults.length > 0) {
          const result = orderResults[0];
          if (result.code === 0) {
            return Response.json({ ok: true, txHash: `sodex:${result.orderID}`, filledSize: Number(body.quantity) });
          }
          return Response.json({ ok: false, error: result.error ?? "order rejected", orderID: result.orderID });
        }

        const rawSummary = JSON.stringify(parsed).slice(0, 500);
        const soDexMsg = (parsed as Record<string, unknown>).message ?? (parsed as Record<string, unknown>).msg ?? (parsed as Record<string, unknown>).error ?? "";
        return Response.json({
          ok: false,
          error: `SoDEX rejected — code=${parsed.code}${soDexMsg ? ` message="${soDexMsg}"` : ""} request=${body.reqJson.slice(0, 400)} response=${rawSummary}`,
        });
      },
    },
  },
});
