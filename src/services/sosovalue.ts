import type { EtfFlowPoint } from "@/types";

export async function fetchEtfFlows(asset: "BTC" | "ETH" = "BTC"): Promise<EtfFlowPoint[]> {
  const res = await fetch(`/api/sosovalue?asset=${asset}`);
  if (!res.ok) throw new Error(`sosovalue failed: ${res.status}`);
  const data = (await res.json()) as { flows: EtfFlowPoint[] };
  return data.flows;
}
