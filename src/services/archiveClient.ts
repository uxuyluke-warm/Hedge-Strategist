export async function archiveTrade(params: {
  wallet: string;
  asset: string;
  side: "BUY" | "SELL";
  quantity: string;
  notionalUsd: number;
  orderType: string;
  marginMode: string;
  orderID: string;
  takeProfit?: string;
  stopLoss?: string;
}) {
  try {
    await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        wallet: params.wallet,
        asset: params.asset,
        side: params.side,
        quantity: params.quantity,
        notionalUsd: params.notionalUsd,
        orderType: params.orderType,
        marginMode: params.marginMode,
        orderID: params.orderID,
        takeProfit: params.takeProfit,
        stopLoss: params.stopLoss,
      }),
    });
  } catch { /* best-effort archiving */ }
}

export async function archiveSignal(params: {
  asset: string;
  direction: string;
  hedgeRatio: number;
  hedgeAction: string;
  confidence: number;
  rationale: string;
}) {
  try {
    await fetch("/api/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        asset: params.asset,
        direction: params.direction,
        hedgeRatio: params.hedgeRatio,
        hedgeAction: params.hedgeAction,
        confidence: params.confidence,
        rationale: params.rationale,
      }),
    });
  } catch { /* best-effort archiving */ }
}