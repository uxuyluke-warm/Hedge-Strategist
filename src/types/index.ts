// Shared types for the On-Chain Hedge Strategist app.

export type HedgeAction = "SHORT_PERPS" | "LONG_PERPS" | "NONE";
export type Direction = "HEDGE" | "NEUTRAL" | "BULLISH" | "BEARISH";
export type OrderType = "MARKET" | "LIMIT";
export type MarginMode = "CROSS" | "ISOLATED";

export interface FactorWeight {
  name: string;
  weight: number; // 0..1
  impact: "bullish" | "bearish" | "neutral";
}

export interface MarketSignal {
  direction: Direction;
  hedgeRatio: number;
  hedgeAsset: string;
  hedgeAction: HedgeAction;
  confidence: number;
  rationale: string;
  timestamp: number;
  // Enhanced fields
  momentum14d?: number; // -1..1
  factorWeights?: FactorWeight[];
  takeProfit?: number; // optional TP price
  stopLoss?: number; // optional SL price
  riskWarning?: string;
  // Compatibility fields
  bias?: "long" | "short" | "neutral";
  timeframe?: string;
}

export interface EtfFlowPoint {
  date: string; // YYYY-MM-DD
  netFlowUsd: number; // positive = inflow
  cumulativeUsd: number;
  asset: "BTC" | "ETH";
}

export interface PriceTick {
  ts: number;
  price: number;
  symbol: string;
}

export interface WalletBalance {
  asset: string;
  free: number;
  locked: number;
  usdValue: number;
}

export interface SodexOrderRequest {
  wallet: string;
  asset: string; // e.g. "ETH-PERP"
  side: "BUY" | "SELL";
  size: number; // notional USD
  leverage: number;
  marginMode: "CROSS" | "ISOLATED";
  reduceOnly?: boolean;
}

export interface SodexOrderResult {
  ok: boolean;
  txHash?: string;
  error?: string;
  filledSize?: number;
  avgPrice?: number;
}

export interface SodexPrepareResult {
  typedData: Record<string, unknown>;
  accountID: number;
  symbolID: number;
}

export interface SodexSignedOrderRequest {
  wallet: string;
  accountID: number;
  symbolID: number;
  side: "BUY" | "SELL";
  size: number;
  signature: string;
  nonce: number;
  clOrdID: string;
}

export interface HedgeRecommendation {
  spotExposureUsd: number;
  perpNotionalUsd: number;
  signal: MarketSignal;
}
