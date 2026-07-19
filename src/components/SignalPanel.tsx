import { useDashboard } from "@/contexts/DashboardContext";
import { Shield, TrendingDown, TrendingUp, Loader2, AlertTriangle } from "lucide-react";

export function SignalPanel({ onOpenTrade }: { onOpenTrade: () => void }) {
  const { signal, stats, loading, asset } = useDashboard();

  if (loading && !signal) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm text-muted-foreground">Analyzing on-chain flows…</span>
      </div>
    );
  }
  if (!signal) return null;

  const isShort = signal.hedgeAction === "SHORT_PERPS";
  const isHedge = signal.direction === "HEDGE";

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isHedge ? "Hedge Recommended" : "No Hedge Needed"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Powered by Groq · {asset} ETF flow analysis
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            isShort
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {isShort ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          {signal.hedgeAction.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Metric label="Hedge Ratio" value={`${signal.hedgeRatio.toFixed(2)}x`} highlight />
        <Metric label="Asset" value={signal.hedgeAsset} />
        <Metric label="Confidence" value={`${Math.round(signal.confidence * 100)}%`} />
        <Metric label="Momentum" value={signal.momentum14d != null ? `${(signal.momentum14d * 100).toFixed(0)}` : "—"} />
      </div>

      {signal.factorWeights && signal.factorWeights.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Factor Breakdown</p>
          {signal.factorWeights.map((f, i) => (
            <FactorBar key={i} name={f.name} weight={f.weight} impact={f.impact} />
          ))}
        </div>
      )}

      {signal.riskWarning && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{signal.riskWarning}</span>
        </div>
      )}

      <p className="text-sm leading-relaxed text-muted-foreground">{signal.rationale}</p>

      {stats && (
        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          7d net flow: <span className="font-mono text-foreground">${(stats.totalNet7d / 1e6).toFixed(0)}M</span>
          {" · "}Outflow streak: <span className="font-mono text-foreground">{stats.outflowStreak}d</span>
          {" · "}Pressure: <span className="font-mono text-foreground">{stats.pressure}</span>
          {" · "}Momentum: <span className="font-mono text-foreground">{(stats.momentum14d * 100).toFixed(0)}%</span>
        </div>
      )}

      <button
        onClick={onOpenTrade}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Open hedge on SoDEX
      </button>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border border-border p-3 ${highlight ? "bg-primary/5" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-lg ${highlight ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function FactorBar({ name, weight, impact }: { name: string; weight: number; impact: string }) {
  const pct = Math.min(100, Math.max(0, Math.round(weight * 100)));
  const barColor =
    impact === "bullish" ? "bg-emerald-500" : impact === "bearish" ? "bg-destructive" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-[11px] text-muted-foreground truncate flex-shrink-0">{name}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-[11px] font-mono text-muted-foreground">{pct}%</span>
    </div>
  );
}
