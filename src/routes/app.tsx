import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { SignalPanel } from "@/components/SignalPanel";
import { TradeModal } from "@/components/TradeModal";
import { TradingChart } from "@/components/TradingChart";
import { PriceFlowChart } from "@/components/PriceFlowChart";
import { AskAI } from "@/components/AskAI";
import { NewsFeed } from "@/components/NewsFeed";
import { PortfolioPanel } from "@/components/PortfolioPanel";
import { WalletGate } from "@/components/WalletGate";
import { WalletMenu } from "@/components/WalletMenu";
import { Toaster } from "sonner";
import { RefreshCw, Shield, Github } from "lucide-react";
import { PriceTicker } from "@/components/PriceTicker";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "On-Chain Hedge Strategist" },
      {
        name: "description",
        content:
          "AI-powered hedge recommendations from live ETF flows. Neutralize BTC/ETH spot risk with SoDEX perps.",
      },
      { property: "og:title", content: "On-Chain Hedge Strategist" },
      {
        property: "og:description",
        content: "AI hedge recommendations from live on-chain ETF flows.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DashboardProvider>
      <Dashboard />
      <Toaster position="top-right" />
    </DashboardProvider>
  );
}

function Dashboard() {
  const { asset, setAsset, refresh, loading, error } = useDashboard();
  const [tradeOpen, setTradeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">On-Chain Hedge Strategist</h1>
              <p className="text-[11px] text-muted-foreground">Groq · SoSoValue · SoDEX testnet</p>
            </div>
            <div className="hidden md:block">
              <PriceTicker />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border p-0.5">
              {(["BTC", "ETH"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAsset(a)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    asset === a ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
             <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <a
              href="https://github.com/uxuyluke-warm/Hedge-Strategist.git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted transition"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <WalletMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SignalPanel onOpenTrade={() => setTradeOpen(true)} />
            <TradingChart />
            <PriceFlowChart />
          </div>
          <div className="space-y-6">
            <WalletGate>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold mb-1">Wallet connected</h3>
                <p className="text-xs text-muted-foreground">
                  Ready to execute hedges on SoDEX testnet.
                </p>
              </div>
            </WalletGate>
            <PortfolioPanel />
            <NewsFeed />
            <AskAI />
          </div>
        </div>
      </main>

      <TradeModal open={tradeOpen} onClose={() => setTradeOpen(false)} />
    </div>
  );
}
