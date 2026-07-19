import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { analyzeMarket } from "@/services/ai";
import { fetchEtfFlows } from "@/services/sosovalue";
import { fetchNews } from "@/services/news";
import { archiveSignal } from "@/services/archiveClient";
import { analyzeFlows, type FlowStats } from "@/services/flowAnalyzer";
import type { EtfFlowPoint, MarketSignal } from "@/types";

interface DashboardState {
  asset: "BTC" | "ETH";
  setAsset: (a: "BTC" | "ETH") => void;
  flows: EtfFlowPoint[];
  stats: FlowStats | null;
  signal: MarketSignal | null;
  loading: boolean;
  error: string | null;
  wallet: string | null;
  setWallet: (w: string | null) => void;
  refresh: () => Promise<void>;
  spotExposureUsd: number;
  setSpotExposureUsd: (n: number) => void;
}

const DashboardCtx = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [asset, setAsset] = useState<"BTC" | "ETH">("BTC");
  const [flows, setFlows] = useState<EtfFlowPoint[]>([]);
  const [signal, setSignal] = useState<MarketSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [spotExposureUsd, setSpotExposureUsd] = useState(10000);
  const spotExposureRef = useRef(spotExposureUsd);
  spotExposureRef.current = spotExposureUsd;

  const inFlightRef = useRef<Promise<void> | null>(null);
  const CACHE_KEY = "dashboard:lastSignal";
  const CACHE_TTL_MS = 15 * 60_000;

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    const run = (async () => {
      setLoading(true);
      setError(null);
      try {
        const f = await fetchEtfFlows(asset);
        setFlows(f);
        const [news] = await Promise.all([fetchNews(asset)]);
        const newsText = news.length
          ? "Recent crypto news:\n" + news.map((n) => `- [${n.sentiment}] ${n.title} (${n.source})`).join("\n")
          : "";
        const s = await analyzeMarket(f, spotExposureRef.current, newsText);
        setSignal(s);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ asset, flows: f, signal: s, ts: Date.now() }));
        } catch { /* non-fatal */ }
        archiveSignal({
          asset: s.hedgeAsset,
          direction: s.direction,
          hedgeRatio: s.hedgeRatio,
          hedgeAction: s.hedgeAction,
          confidence: s.confidence,
          rationale: s.rationale,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "unknown error");
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = run;
    return run;
  }, [asset]);

  const refreshTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    let initialDelay = 0;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { asset: string; flows: EtfFlowPoint[]; signal: MarketSignal; ts: number };
        const age = Date.now() - parsed.ts;
        if (parsed.asset === asset && parsed.signal?.hedgeAsset === asset && age < CACHE_TTL_MS) {
          setFlows(parsed.flows);
          setSignal(parsed.signal);
          initialDelay = CACHE_TTL_MS - age;
        } else {
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    } catch { /* corrupt cache — fetch fresh */ }

    refreshTimeout.current = setTimeout(refresh, initialDelay);
    const id = setInterval(refresh, 600_000);
    return () => {
      clearTimeout(refreshTimeout.current);
      clearInterval(id);
    };
  }, [asset, refresh]);

  const stats = useMemo(() => (flows.length ? analyzeFlows(flows) : null), [flows]);

  const value: DashboardState = {
    asset,
    setAsset,
    flows,
    stats,
    signal,
    loading,
    error,
    wallet,
    setWallet,
    refresh,
    spotExposureUsd,
    setSpotExposureUsd,
  };

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
