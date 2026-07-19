import type { HedgeRecommendation, MarketSignal } from "@/types";

export function computeHedge(
  signal: MarketSignal,
  spotExposureUsd: number,
): HedgeRecommendation {
  const ratio = Number.isFinite(signal.hedgeRatio) ? signal.hedgeRatio : 0;
  const perpNotionalUsd = Math.max(0, spotExposureUsd * ratio);
  return { spotExposureUsd, perpNotionalUsd, signal };
}

export function maxSafeLeverage(accountEquityUsd: number, notionalUsd: number): number {
  if (accountEquityUsd <= 0) return 1;
  return Math.max(1, Math.min(5, notionalUsd / accountEquityUsd || 1));
}

// Half-Kelly position sizing
// f* = (p * b - q) / b  where p = win prob, q = 1-p, b = win/loss ratio
// Kelly fraction halved for safety
export function halfKellySize(params: {
  confidence: number; // 0..1, used as win probability
  accountBalance: number;
  riskPerTrade: number; // e.g. 0.02 for 2%
  maxLeverage: number;
}): {
  recommendedNotional: number;
  leverage: number;
  marginRequired: number;
} {
  const p = Math.max(0.1, Math.min(0.9, params.confidence));
  const b = 2; // assume 2:1 reward-to-risk
  const kelly = (p * b - (1 - p)) / b;
  const fraction = Math.max(0, kelly * 0.5); // half-kelly
  const marginAtRisk = params.accountBalance * params.riskPerTrade * fraction;
  const notional = marginAtRisk * params.maxLeverage;
  return {
    recommendedNotional: Math.round(notional),
    leverage: Math.min(params.maxLeverage, Math.max(1, Math.round(notional / (marginAtRisk || 1)))),
    marginRequired: Math.round(marginAtRisk),
  };
}
