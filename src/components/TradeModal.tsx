import { useEffect, useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { computeHedge, maxSafeLeverage, halfKellySize } from "@/services/riskManager";
import { formatPerpSymbol, prepareOrder, signTypedData, submitSignedOrder } from "@/services/sodex";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { archiveTrade } from "@/services/archiveClient";
import type { OrderType, MarginMode } from "@/types";

export function TradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signal, wallet, spotExposureUsd, setSpotExposureUsd } = useDashboard();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"sign" | "submit" | "done" | null>(null);
  const [result, setResult] = useState<{ txHash?: string } | null>(null);

  // Order configuration
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [limitPrice, setLimitPrice] = useState("");
  const [takeProfit, setTakeProfit] = useState(signal?.takeProfit ? String(signal.takeProfit) : "");
  const [stopLoss, setStopLoss] = useState(signal?.stopLoss ? String(signal.stopLoss) : "");
  const [marginMode, setMarginMode] = useState<MarginMode>("CROSS");

  // Reset on close
  useEffect(() => {
    if (!open) {
      setResult(null);
      setStep(null);
    }
  }, [open]);

  // Sync AI-suggested TP/SL when signal changes
  useEffect(() => {
    if (signal?.takeProfit) setTakeProfit(String(signal.takeProfit));
    if (signal?.stopLoss) setStopLoss(String(signal.stopLoss));
  }, [signal?.takeProfit, signal?.stopLoss]);

  if (!open || !signal) return null;

  const rec = computeHedge(signal, spotExposureUsd);
  const leverage = Math.round(maxSafeLeverage(spotExposureUsd, rec.perpNotionalUsd));

  // Half-Kelly sizing
  const kelly = halfKellySize({
    confidence: signal.confidence,
    accountBalance: spotExposureUsd,
    riskPerTrade: 0.02,
    maxLeverage: 5,
  });

  const side = signal.hedgeAction === "SHORT_PERPS" ? "SELL" : "BUY";

  const onSubmit = async () => {
    if (!wallet) {
      toast.error("Connect a wallet first");
      return;
    }
    setSubmitting(true);
    setStep("sign");
    try {
      const prep = await prepareOrder(
        wallet,
        signal.hedgeAsset,
        side,
        rec.perpNotionalUsd,
        {
          orderType,
          price: limitPrice ? Number(limitPrice) : undefined,
          takeProfit: takeProfit ? Number(takeProfit) : undefined,
          stopLoss: stopLoss ? Number(stopLoss) : undefined,
          marginMode,
        },
      );

      setStep("submit");
      const signature = await signTypedData(wallet, prep.typedData);

      const res = await submitSignedOrder({
        wallet,
        accountID: prep.accountID,
        symbolID: prep.symbolID,
        side,
        quantity: prep.quantity,
        signature,
        nonce: (prep.typedData.message as { nonce: number }).nonce,
        clOrdID: prep.clOrdID,
        reqJson: prep.reqJson,
      });

      setStep("done");
      if (res.ok) {
        setResult({ txHash: res.txHash });
        toast.success(`Hedge submitted (${orderType}) on SoDEX`);
        archiveTrade({
          wallet,
          asset: signal.hedgeAsset,
          side,
          quantity: prep.quantity,
          notionalUsd: rec.perpNotionalUsd,
          orderType,
          marginMode,
          orderID: res.txHash ?? "unknown",
          takeProfit: takeProfit || undefined,
          stopLoss: stopLoss || undefined,
        });
      } else {
        toast.error(res.error ?? "Order failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Execute Hedge</h3>
            <p className="text-xs text-muted-foreground">SoDEX testnet · {formatPerpSymbol(signal.hedgeAsset)}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <div>
                <div className="font-medium">Hedge submitted</div>
                <div className="font-mono text-xs text-muted-foreground truncate">{result.txHash}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Exposure input */}
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Spot exposure (USD)</span>
              <input
                type="number"
                min={0}
                value={spotExposureUsd}
                onChange={(e) => setSpotExposureUsd(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none"
              />
            </label>

            {/* Order type & Margin mode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Order type</span>
                <div className="mt-1 flex rounded-md border border-input overflow-hidden">
                  {(["MARKET", "LIMIT"] as OrderType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOrderType(t)}
                      className={`flex-1 py-1.5 text-xs font-medium transition ${
                        orderType === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Margin mode</span>
                <div className="mt-1 flex rounded-md border border-input overflow-hidden">
                  {(["CROSS", "ISOLATED"] as MarginMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMarginMode(m)}
                      className={`flex-1 py-1.5 text-xs font-medium transition ${
                        marginMode === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Limit price */}
            {orderType === "LIMIT" && (
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Limit price (USD)</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="e.g. 65000"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none"
                />
              </label>
            )}

            {/* TP/SL bracket */}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Take profit (USD)</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Stop loss (USD)</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none"
                />
              </label>
            </div>

            {/* Order summary */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
              <Row label="Hedge ratio" value={`${signal.hedgeRatio.toFixed(2)}x`} />
              <Row label="Perp notional" value={`$${rec.perpNotionalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight />
              <Row label="Side" value={side} />
              <Row label="Leverage" value={`${leverage}x`} />
              <Row label="Order type" value={orderType} />
              <Row label="Margin mode" value={marginMode} />
              {orderType === "LIMIT" && limitPrice && (
                <Row label="Limit price" value={`$${Number(limitPrice).toFixed(2)}`} />
              )}
              {takeProfit && <Row label="Take profit" value={`$${Number(takeProfit).toFixed(2)}`} />}
              {stopLoss && <Row label="Stop loss" value={`$${Number(stopLoss).toFixed(2)}`} />}
            </div>

            {/* Half-Kelly sizing hint */}
            <div className="rounded-md bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              Half-Kelly: recommended notional ~${kelly.recommendedNotional.toLocaleString()} @ {kelly.leverage}x
            </div>



            <button
              onClick={onSubmit}
              disabled={submitting || rec.perpNotionalUsd <= 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting
                ? (step === "sign" ? "Preparing…" : "Submitting…")
                : `Submit ${orderType} ${signal.hedgeAction === "SHORT_PERPS" ? "short" : "long"} hedge`}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              Testnet only. No real funds at risk.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${highlight ? "text-primary font-semibold" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
