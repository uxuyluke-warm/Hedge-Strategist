import { useLivePrice } from "@/hooks/useLivePrice";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

export function PriceTicker() {
  const { asset } = useDashboard();
  const { price, change24h, loading, error } = useLivePrice(asset);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {asset}/USD loading…
      </div>
    );
  }

  if (error && !price) {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive">
        <span className="text-muted-foreground">{asset}/USD</span>
        <span>offline</span>
      </div>
    );
  }

  if (!price) return null;

  const isUp = change24h >= 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-medium text-foreground">{asset}/USD</span>
      <span className="font-mono tabular-nums">
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className={`inline-flex items-center gap-0.5 font-mono text-xs ${isUp ? "text-emerald-500" : "text-destructive"}`}>
        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isUp ? "+" : ""}{change24h.toFixed(2)}%
      </span>
    </div>
  );
}