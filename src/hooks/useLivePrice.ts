import { useEffect, useRef, useState } from "react";

interface LivePrice {
  price: number;
  change24h: number;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL = 30000;

export function useLivePrice(asset: "BTC" | "ETH"): LivePrice {
  const [state, setState] = useState<LivePrice>({
    price: 0,
    change24h: 0,
    loading: true,
    error: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/price?asset=${asset}`);
        const d = await res.json();
        if (cancelled) return;
        if (d.price > 0) {
          setState({ price: d.price, change24h: d.change24h ?? 0, loading: false, error: null });
        } else if (!state.price) {
          setState((s) => ({ ...s, loading: false, error: "offline" }));
        }
      } catch {
        if (!cancelled && !state.price) {
          setState((s) => ({ ...s, loading: false, error: "offline" }));
        }
      }
    }

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
  }, [asset]);

  return state;
}