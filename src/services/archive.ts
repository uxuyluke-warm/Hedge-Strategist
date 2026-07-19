import { Redis } from "@upstash/redis";

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  if (URL && TOKEN) {
    _redis = new Redis({ url: URL, token: TOKEN });
    return _redis;
  }
  return null;
}

const _memoryTrades: ArchivedTrade[] = [];
const _memorySignals: ArchivedSignal[] = [];

export interface ArchivedTrade {
  id: string;
  wallet: string;
  asset: string;
  side: "BUY" | "SELL";
  quantity: string;
  notionalUsd: number;
  orderType: string;
  marginMode: string;
  orderID: string;
  takeProfit?: string;
  stopLoss?: string;
  timestamp: number;
}

export interface ArchivedSignal {
  id: string;
  asset: string;
  direction: string;
  hedgeRatio: number;
  hedgeAction: string;
  confidence: number;
  rationale: string;
  timestamp: number;
}

const TRADES_KEY = "hedge:trades";
const SIGNALS_KEY = "hedge:signals";

export async function saveTrade(trade: ArchivedTrade): Promise<boolean> {
  const r = getRedis();
  if (r) {
    try {
      await r.lpush(TRADES_KEY, trade);
      await r.ltrim(TRADES_KEY, 0, 199);
      return true;
    } catch { /* fall through to memory */ }
  }
  _memoryTrades.unshift(trade);
  if (_memoryTrades.length > 200) _memoryTrades.length = 200;
  return true;
}

export async function getTrades(wallet?: string, limit = 50): Promise<ArchivedTrade[]> {
  const r = getRedis();
  if (r) {
    try {
      const all = await r.lrange<ArchivedTrade>(TRADES_KEY, 0, limit - 1);
      if (wallet) return all.filter((t) => t.wallet.toLowerCase() === wallet.toLowerCase());
      return all;
    } catch { /* fall through to memory */ }
  }
  const all = _memoryTrades.slice(0, limit);
  if (wallet) return all.filter((t) => t.wallet.toLowerCase() === wallet.toLowerCase());
  return all;
}

export async function saveSignal(signal: ArchivedSignal): Promise<boolean> {
  const r = getRedis();
  if (r) {
    try {
      await r.lpush(SIGNALS_KEY, signal);
      await r.ltrim(SIGNALS_KEY, 0, 199);
      return true;
    } catch { /* fall through to memory */ }
  }
  _memorySignals.unshift(signal);
  if (_memorySignals.length > 200) _memorySignals.length = 200;
  return true;
}

export async function getSignals(limit = 50): Promise<ArchivedSignal[]> {
  const r = getRedis();
  if (r) {
    try {
      return await r.lrange<ArchivedSignal>(SIGNALS_KEY, 0, limit - 1);
    } catch { /* fall through to memory */ }
  }
  return _memorySignals.slice(0, limit);
}