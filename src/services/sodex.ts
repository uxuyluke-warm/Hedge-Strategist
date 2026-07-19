import type { WalletBalance, SodexOrderResult } from "@/types";

const SODEX_CHAIN_ID = 138565;
const SODEX_CHAIN_HEX = "0x21D45";

export async function ensureNetwork(): Promise<void> {
  const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<unknown> } })
    .ethereum;
  if (!eth) throw new Error("No wallet found");
  const current = await eth.request({ method: "eth_chainId" });
  if (String(current) === SODEX_CHAIN_HEX || Number(current) === SODEX_CHAIN_ID) return;
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SODEX_CHAIN_HEX }],
    });
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: SODEX_CHAIN_HEX,
          chainName: "SoDEX Testnet",
          nativeCurrency: { name: "SEI", symbol: "SEI", decimals: 18 },
          rpcUrls: ["https://testnet-v2.valuechain.xyz"],
          blockExplorerUrls: ["https://test-scan.valuechain.xyz"],
        }],
      });
    } else {
      throw e;
    }
  }
}

export async function getBalance(wallet: string): Promise<WalletBalance[]> {
  const res = await fetch(`/api/sodex-balance?wallet=${encodeURIComponent(wallet)}`);
  if (!res.ok) throw new Error(`balance failed: ${res.status}`);
  const data = (await res.json()) as { balances: WalletBalance[] };
  return data.balances;
}

export async function prepareOrder(
  wallet: string,
  asset: string,
  side: string,
  size: number,
  opts?: {
    orderType?: "MARKET" | "LIMIT";
    price?: number;
    takeProfit?: number;
    stopLoss?: number;
    marginMode?: "CROSS" | "ISOLATED";
  },
) {
  // Fetch account state and mark price directly from SoDEX (client-side)
  const stateRes = await fetch(`https://testnet-gw.sodex.dev/api/v1/perps/accounts/${wallet}/state`);
  const stateBody = await stateRes.json();
  if (stateBody.code !== 0) throw new Error("failed to fetch SoDEX account state");
  const accountID = Number((stateBody.data as Record<string, unknown>).aid);
  if (!accountID) throw new Error("Wallet not registered on SoDEX testnet. Go to https://testnet.sodex.com and accept the Terms of Use.");

  const tickerRes = await fetch(`https://testnet-gw.sodex.dev/api/v1/perps/markets/tickers?symbol=${asset}-USD`);
  const tickerBody = await tickerRes.json();
  if (tickerBody.code !== 0) throw new Error("failed to fetch mark price");
  const markPrice = Number((tickerBody.data as Array<Record<string, string>>)[0].markPrice);
  if (!markPrice || markPrice <= 0) throw new Error("invalid mark price");

  const params = new URLSearchParams({
    wallet,
    asset,
    side,
    size: String(size),
    orderType: opts?.orderType ?? "MARKET",
    marginMode: opts?.marginMode ?? "CROSS",
    accountID: String(accountID),
    markPrice: String(markPrice),
  });
  if (opts?.price) params.set("price", String(opts.price));
  if (opts?.takeProfit) params.set("takeProfit", String(opts.takeProfit));
  if (opts?.stopLoss) params.set("stopLoss", String(opts.stopLoss));

  const res = await fetch(`/api/sodex-prepare?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "prepare failed" }));
    throw new Error(err.error ?? `prepare failed: ${res.status}`);
  }
  return (await res.json()) as {
    typedData: Record<string, unknown>;
    accountID: number;
    symbolID: number;
    clOrdID: string;
    quantity: string;
    markPrice: number;
    reqJson: string;
  };
}

export async function signTypedData(
  wallet: string,
  typedData: Record<string, unknown>,
): Promise<string> {
  await ensureNetwork();
  const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<unknown> } })
    .ethereum;
  if (!eth) throw new Error("MetaMask not found");
  return (await eth.request({
    method: "eth_signTypedData_v4",
    params: [wallet, JSON.stringify(typedData)],
  })) as string;
}

export async function submitSignedOrder(params: {
  wallet: string;
  accountID: number;
  symbolID: number;
  side: "BUY" | "SELL";
  quantity: string;
  signature: string;
  nonce: number;
  clOrdID: string;
  reqJson: string;
}): Promise<SodexOrderResult> {
  const res = await fetch("/api/sodex-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return (await res.json()) as SodexOrderResult;
}

export async function getPositions(wallet: string): Promise<Array<{
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
}>> {
  const res = await fetch(`/api/sodex-positions?wallet=${encodeURIComponent(wallet)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { positions: Array<Record<string, unknown>> };
  return data.positions as Array<{
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
  }>;
}

export function formatPerpSymbol(asset: string) {
  return `${asset.toUpperCase()}-PERP`;
}
