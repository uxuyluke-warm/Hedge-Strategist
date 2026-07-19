import { useDashboard } from "@/contexts/DashboardContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TradingChart() {
  const { flows, signal } = useDashboard();
  const hedgeRatio = signal?.hedgeRatio ?? 0;

  const data = flows.map((f) => ({
    date: f.date.slice(5),
    net: f.netFlowUsd / 1e6,
    ratio: hedgeRatio,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">ETF Net Flow (USD, millions)</h3>
        <span className="text-[11px] text-muted-foreground">Hedge ratio overlay: <span className="font-mono text-primary">{hedgeRatio.toFixed(2)}x</span></span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 3]}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="net" name="Net flow ($M)">
              {data.map((d, i) => (
                <Cell key={i} fill={d.net >= 0 ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.2 25)"} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ratio"
              name="Hedge ratio"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
