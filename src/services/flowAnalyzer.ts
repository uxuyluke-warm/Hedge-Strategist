import type { EtfFlowPoint } from "@/types";

export interface FlowStats {
  totalNet7d: number;
  totalNet30d: number;
  outflowStreak: number;
  pressure: "HIGH_OUTFLOW" | "OUTFLOW" | "BALANCED" | "INFLOW" | "HIGH_INFLOW";
  momentum14d: number; // -1..1
}

export function analyzeFlows(flows: EtfFlowPoint[]): FlowStats {
  const sorted = [...flows].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = sorted.slice(-7);
  const last30 = sorted.slice(-30);
  const totalNet7d = last7.reduce((s, f) => s + f.netFlowUsd, 0);
  const totalNet30d = last30.reduce((s, f) => s + f.netFlowUsd, 0);

  let outflowStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].netFlowUsd < 0) outflowStreak++;
    else break;
  }

  let pressure: FlowStats["pressure"] = "BALANCED";
  if (totalNet7d < -1e9) pressure = "HIGH_OUTFLOW";
  else if (totalNet7d < 0) pressure = "OUTFLOW";
  else if (totalNet7d > 1e9) pressure = "HIGH_INFLOW";
  else if (totalNet7d > 0) pressure = "INFLOW";

  // 14-day momentum: compare recent 7d vs prior 7d
  const prior14 = sorted.slice(-28, -14);
  const recent14 = sorted.slice(-14);
  const priorFlow = prior14.reduce((s, f) => s + f.netFlowUsd, 0);
  const recentFlow = recent14.reduce((s, f) => s + f.netFlowUsd, 0);
  const maxAbs = Math.max(Math.abs(priorFlow), Math.abs(recentFlow), 1);
  const momentum14d = Math.max(-1, Math.min(1, (recentFlow - priorFlow) / maxAbs));

  return { totalNet7d, totalNet30d, outflowStreak, pressure, momentum14d };
}
