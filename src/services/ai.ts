import type { EtfFlowPoint, MarketSignal } from "@/types";

const SYSTEM_PROMPT = `You are an On-Chain Hedge Strategist.
You receive live spot BTC/ETH ETF net-flow data (SoSoValue) and price data.
Your job is NOT to predict direction. Your job is to recommend a HEDGE that
neutralizes risk for a user who holds spot exposure. Respond ONLY with JSON:

{
  "direction": "HEDGE" | "NEUTRAL",
  "hedgeRatio": number,
  "hedgeAsset": "BTC" | "ETH",
  "hedgeAction": "SHORT_PERPS" | "LONG_PERPS" | "NONE",
  "confidence": number,
  "rationale": string,
  "momentum14d": number,
  "factorWeights": [{ "name": string, "weight": number, "impact": "bullish"|"bearish"|"neutral" }],
  "takeProfit": number | null,
  "stopLoss": number | null,
  "riskWarning": string | null
}
No prose. No markdown. JSON only.`;

export function buildPrompt(input: {
  flows: EtfFlowPoint[];
  spotExposureUsd?: number;
  extra?: string;
  news?: string;
}) {
  const asset = input.flows[0]?.asset ?? "BTC";
  const recent = input.flows.slice(-14);
  return [
    `Asset analyzed: ${asset}`,
    `Recent ${asset} ETF net flows (USD, negative = outflow):`,
    ...recent.map(
      (f) => `- ${f.date}: ${f.netFlowUsd.toLocaleString()}`,
    ),
    input.news ?? "",
    input.spotExposureUsd
      ? `User spot exposure: $${input.spotExposureUsd.toLocaleString()} (${asset})`
      : "",
    input.extra ?? "",
    `Analyze the ${asset} ETF flow data and return a structured hedge recommendation.
- hedgeAsset MUST be "${asset}". Do not change it.
- Compute a -1..1 momentum14d from the 14-day flow trend.
- Set factorWeights (max 4) explaining what drove the signal (e.g. flow momentum, streak, cumulative pressure, news sentiment).
- If confidence > 0.5, suggest takeProfit and stopLoss prices relative to the hedge entry.
- If there is a known risk (e.g. low liquidity, conflicting signals, adverse news), set riskWarning.
- hedgeRatio should be between 0 and 3.`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function postAnalyze(body: Record<string, unknown>, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : null;

      // Daily-limit exhaustion or long cooldown — throw immediately
      if (retryAfterMs && retryAfterMs > 30_000) {
        const text = await res.clone().text().catch(() => "");
        throw new Error(`Groq daily/minutely rate limit hit — retry after ${Math.ceil(retryAfterMs / 1000)}s${text ? `: ${text}` : ""}`);
      }

      if (attempt === retries) {
        const text = await res.clone().text().catch(() => "");
        throw new Error(`analyze failed after ${retries} retries — 429${text ? `: ${text}` : ""}`);
      }

      // Wait: use Retry-After if present, otherwise exponential backoff capped at 15s
      await new Promise((r) => setTimeout(r, retryAfterMs ?? Math.min(1000 * 2 ** attempt, 15_000)));
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`analyze failed: ${res.status}${text ? ` — ${text}` : ""}`);
    }

    return res.json();
  }
  throw new Error("analyze failed: exhausted retries");
}

export async function analyzeMarket(flows: EtfFlowPoint[], spotExposureUsd?: number, newsText?: string): Promise<MarketSignal> {
  const data = (await postAnalyze({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt({ flows, spotExposureUsd, news: newsText }),
    model: "llama-3.1-8b-instant",
  })) as MarketSignal;
  return { ...data, timestamp: Date.now() };
}

export async function analyzeMarketWithNews(flows: EtfFlowPoint[], spotExposureUsd?: number, newsItems?: Array<{ title: string; source: string; sentiment: string }>): Promise<MarketSignal> {
  const newsText = newsItems?.length
    ? "Recent crypto news:\n" + newsItems.map((n) => `- [${n.sentiment}] ${n.title} (${n.source})`).join("\n")
    : "";
  return analyzeMarket(flows, spotExposureUsd, newsText);
}

export async function askAI(question: string, flows: EtfFlowPoint[]): Promise<string> {
  const data = (await postAnalyze({
    system:
      "You are a hedge and risk-neutralization coach. Answer succinctly (<=120 words). Do NOT give directional predictions.",
    prompt: `${buildPrompt({ flows })}\n\nUser question: ${question}`,
    model: "llama-3.1-8b-instant",
    raw: true,
  })) as { text: string };
  return data.text;
}
