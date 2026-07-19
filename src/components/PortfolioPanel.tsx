import { useEffect, useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { getPositions, getBalance } from "@/services/sodex";
import { TrendingUp, TrendingDown, Wallet, BarChart3, Loader2, Clock } from "lucide-react";
import type { WalletBalance } from "@/types";

interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  pnlPercent: number;
  margin: number;
  liquidationPrice: number;
  leverage: number;
  side: "LONG" | "SHORT";
}

interface TradeRecord {
  id: string;
  asset: string;
  side: string;
  quantity: string;
  notionalUsd: number;
  orderType: string;
  orderID: string;
  timestamp: number;
}

export function PortfolioPanel() {
  const { wallet } = useDashboard();
  const [positions, setPositions] = useState<Position[]>([]);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [showTrades, setShowTrades] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getPositions(wallet), getBalance(wallet)]).then(([p, b]) => {
      if (cancelled) return;
      setPositions(p);
      setBalances(b);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [wallet]);

  useEffect(() => {
    if (!wallet || !showTrades) return;
    fetch(`/api/trades?wallet=${encodeURIComponent(wallet)}`)
      .then((r) => r.json())
      .then((d) => setTrades(d.trades ?? []))
      .catch(() => {});
  }, [wallet, showTrades]);

  if (!wallet) return null;

  const totalPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);
  const totalEquity = balances.reduce((s, b) => s + b.usdValue, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Portfolio</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
      </div>

      {/* Account summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-muted/50 p-2">
          <div className="text-muted-foreground">Equity</div>
          <div className="font-mono font-medium text-foreground">
            ${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <div className="text-muted-foreground">Unrealized P&L</div>
          <div className={`font-mono font-medium ${totalPnl >= 0 ? "text-emerald-500" : "text-destructive"}`}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Open positions */}
      {positions.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Open Positions</span>
          {positions.map((p, i) => (
            <div key={i} className="rounded-md border border-border p-2 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {p.side === "LONG" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className="text-xs font-medium">{p.symbol}</span>
                  <span className={`text-[10px] font-mono ${p.side === "LONG" ? "text-emerald-500" : "text-destructive"}`}>
                    {p.side}
                  </span>
                </div>
                <span className="text-xs font-mono tabular-nums">{p.size}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                <span>Entry ${p.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span>Mark ${p.markPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className={p.unrealizedPnl >= 0 ? "text-emerald-500" : "text-destructive"}>
                  P&L {p.unrealizedPnl >= 0 ? "+" : ""}${p.unrealizedPnl.toFixed(2)} ({p.pnlPercent >= 0 ? "+" : ""}{p.pnlPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Liq ${p.liquidationPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} · {p.leverage}x
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && positions.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No open positions</p>
      )}

      {/* Trade history */}
      <button
        onClick={() => setShowTrades(!showTrades)}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
      >
        <Clock className="h-3 w-3" />
        {showTrades ? "Hide" : "View"} trade history {trades.length > 0 && `(${trades.length})`}
      </button>

      {showTrades && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {trades.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No trades yet</p>
          ) : (
            trades.slice(0, 20).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{t.asset}</span>
                  <span className={t.side === "BUY" ? "text-emerald-500" : "text-destructive"}>{t.side}</span>
                </div>
                <div className="text-muted-foreground font-mono">
                  {t.quantity} · ${t.notionalUsd.toLocaleString()}
                </div>
                <div className="text-muted-foreground">{new Date(t.timestamp).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}