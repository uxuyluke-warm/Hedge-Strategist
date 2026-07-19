// Shared SoDEX gateway helper (server-side)

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const keccak256: (buf: Buffer) => Buffer = require("keccak256");

export const SODEX_PERPS_API = "https://testnet-gw.sodex.dev/api/v1/perps";
export const SODEX_CHAIN_ID = 138565; // testnet

export type OrderItemParams = {
  clOrdID: string;
  side: 1 | 2;
  quantity: string;
  orderType?: "MARKET" | "LIMIT";
  price?: string;
  reduceOnly?: boolean;
  triggerType?: 3 | 4 | 5 | 6; // stop-market(3), stop-limit(4), tp-market(5), tp-limit(6)
  triggerPrice?: string; // trigger/activation price for stop/tp orders
  positionSide?: 1 | 2 | 3; // 1=BOTH(cross), 2=LONG, 3=SHORT
};

// Build the order item matching Go struct RawOrder field order.
// Go: clOrdID, modifier, side, type, timeInForce, price, quantity, funds, reduceOnly, positionSide
// triggerType and triggerPrice are separate from type and price.
// Fields tagged omitzero are omitted when nil.
export function orderItem(params: OrderItemParams) {
  const isMarket = !params.orderType || params.orderType === "MARKET";
  const item: Record<string, unknown> = {
    clOrdID: params.clOrdID,
    modifier: 1,
    side: params.side,
    type: isMarket ? 2 : 1,
    timeInForce: isMarket ? 3 : 1,
    quantity: params.quantity.replace(/(\.\d*[1-9])0+$/, "$1"),
    reduceOnly: params.reduceOnly ?? false,
    positionSide: params.positionSide ?? 1,
  };
  if (params.price) item.price = params.price;
  if (params.triggerType != null) item.triggerType = params.triggerType;
  if (params.triggerPrice) item.triggerPrice = params.triggerPrice;
  return item;
}

// Build the full bracket: [entry, takeProfit?, stopLoss?]
export type BracketParams = {
  accountID: number;
  symbolID: number;
  clOrdID: string;
  side: 1 | 2;
  quantity: string;
  orderType?: "MARKET" | "LIMIT";
  price?: string;
  marginMode?: "CROSS" | "ISOLATED";
  takeProfit?: number; // trigger price
  stopLoss?: number; // trigger price
};

export function newOrderRequest(params: BracketParams) {
  const orders = [orderItem({
    clOrdID: params.clOrdID,
    side: params.side,
    quantity: params.quantity,
    orderType: params.orderType,
    price: params.price,
    positionSide: 1,
  })];

  // TP/SL bracket orders disabled for now — SoDEX triggerType values need confirmation.
  // TODO: re-enable with correct triggerType constants once documented.

  return {
    accountID: params.accountID,
    symbolID: params.symbolID,
    orders,
  };
}

// Signing envelope — wraps the request for EIP-712 payloadHash.
// Go: type, params
export function signingEnvelope(req: ReturnType<typeof newOrderRequest>) {
  return {
    type: "newOrder",
    params: req,
  };
}

export const EIP712_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  ExchangeAction: [
    { name: "payloadHash", type: "bytes32" },
    { name: "nonce", type: "uint64" },
  ],
};

export function computePayloadHash(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  return "0x" + keccak256(Buffer.from(json)).toString("hex");
}

// Convert USD notional to base asset quantity, rounded to step size.
export function notionalToQuantity(notionalUsd: number, markPrice: number, stepSize: string, precision: number): string {
  const step = Number(stepSize);
  if (!step) return (notionalUsd / markPrice).toFixed(precision);
  const raw = notionalUsd / markPrice;
  const aligned = Math.round(raw / step) * step;
  return aligned.toFixed(precision);
}

export function estimateNotional(quantity: string, markPrice: number): number {
  return Number(quantity) * markPrice;
}

export const QUANTITY_PRECISION: Record<string, number> = { BTC: 5, ETH: 4 };
export const STEP_SIZE: Record<string, string> = { BTC: "0.00001", ETH: "0.0001" };

// Sign an order server-side using a registered SoDEX API key.
// The API key's private key (ECDSA) signs the EIP-712 ExchangeAction struct.
export async function signOrderWithApiKey(
  req: ReturnType<typeof newOrderRequest>,
  apiKeySecret: string,
): Promise<{ signature: string; nonce: number }> {
  const { ethers } = await import("ethers");

  const nonce = Date.now();
  const envelope = signingEnvelope(req);
  const payloadHash = computePayloadHash(envelope);

  const wallet = new ethers.Wallet(apiKeySecret);
  const domain = {
    name: "futures",
    version: "1",
    chainId: SODEX_CHAIN_ID,
    verifyingContract: "0x0000000000000000000000000000000000000000",
  };
  const types = { ExchangeAction: EIP712_TYPES.ExchangeAction };
  const message = { payloadHash, nonce };

  const rawSig = await wallet.signTypedData(domain, types, message);
  // Parse 65-byte sig: r(32) + s(32) + v(1), reformat to r + s + recid, prepend 0x01
  const raw = rawSig.replace("0x", "");
  const r = raw.slice(0, 64);
  const s = raw.slice(64, 128);
  const v = parseInt(raw.slice(128, 130), 16);
  const recid = v >= 27 ? v - 27 : v;
  const vByte = recid.toString(16).padStart(2, "0");
  const signature = "0x01" + r + s + vByte;

  return { signature, nonce };
}
