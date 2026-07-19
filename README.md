<div align="center">

<pre align="center">
  _   _ _____ ____   ____ _____ 
 | | | | ____|  _ \ / ___| ____|
 | |_| |  _| | | | | |  _|  _|  
 |  _  | |___| |_| | |_| | |___ 
 |_| |_|_____|____/ \____|_____|
                                
          ⚡ AI Hedge Strategist
</pre>

**Product Category:** DeFi · AI Trading Assistant · Perpetual Hedging

**SoSoValue ETF Flows → Groq AI Analysis → EIP-712 Sign → SoDEX Perp Order**

*From institutional data to on-chain hedge. In one click.*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-uxuyluke--warm%2FHedge--Strategist-181717?style=for-the-badge)](https://github.com/uxuyluke-warm/Hedge-Strategist.git)
[![Testnet](https://img.shields.io/badge/⛓%20SoDEX-Testnet-00C2FF?style=for-the-badge)](https://sodex.com)
[![Buildathon](https://img.shields.io/badge/🏆%20SoSoValue-Buildathon%202026-purple?style=for-the-badge)](https://sosovalue.com)
[![Groq](https://img.shields.io/badge/⚡%20Groq-Llama%203.3%2070B-FCE570?style=for-the-badge)](https://groq.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> **⚠️ Testnet Only** · Not financial advice · Built for SoSoValue Buildathon 2026

</div>

---

## ⚡ What is Hedge Strategist?

BTC/ETH spot ETF flows publish daily — but no tool tells you **what to do** with that data.

**Hedge Strategist** closes the gap.

It pulls institutional ETF flow data from SoSoValue, feeds it to Groq AI (Llama 3.3 70B) for directional analysis with a hedge ratio, then lets you execute a perpetual swap on SoDEX testnet — all from your browser with a single MetaMask signature.

No API keys to manage on the client side. No manual position math. No copy-pasting between dashboards.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   SoSoValue API          Groq AI             SoDEX Testnet      │
│   ─────────────    →    ───────────    →    ──────────────────  │
│   ETF Flows             Llama 3.3 70B        EIP-712 Sign       │
│   Net Inflows           Hedge Ratio          Perp Order          │
│   Fund Data             Direction + TP/SL    Confirm Trade       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Pipeline

| Step | What Happens |
|------|-------------|
| **1. Ingest** | Fetches BTC & ETH spot ETF metrics — daily net flows, cumulative flows, fund-level data from SoSoValue |
| **2. Analyze** | Groq AI (Llama 3.3 70B) synthesises flows, computes a hedge ratio, and produces a structured signal with direction, confidence, rationale, and key factors |
| **3. Size** | Computes perp notional from your spot exposure + hedge ratio; half-Kelly risk panel sizes the position |
| **4. Execute** | User connects MetaMask, reviews order parameters, signs EIP-712 `ExchangeAction`, submits to SoDEX testnet |
| **5. Track** | Portfolio panel shows SoDEX open positions, P&L, and trade history |

---

## 📈 Build Waves

The project was built in three progressive waves — from a read-only dashboard to a fully executable on-chain hedge terminal.

### 🔷 Wave 3 — Wallet + SoDEX Execution + Persistence (Current)

| Area | What was added |
|------|---------------|
| **SoDEX Integration** | Client-side SDK (`ensureNetwork`, `prepareOrder`, `signTypedData`, `submitSignedOrder`), server-side order builder + EIP-712 signing helpers, signature verification via `ethers.verifyTypedData` |
| **Wallet Connectivity** | `WalletGate` component (blocks page until connected), `WalletMenu` (disconnect, address display), MetaMask chain switching to ValueChain testnet |
| **Portfolio Tracking** | Portfolio panel showing SoDEX open positions, P&L, liquidation prices, leverage, account equity, and trade history |
| **Execution Flow** | Full 3-step `TradeModal`: prepare → sign (MetaMask EIP-712) → submit to SoDEX gateway, with market/limit orders, TP/SL brackets, cross/isolated margin, and half-Kelly sizing hints |
| **Persistence** | Upstash Redis trade + signal archiving with in-memory fallback; client-side archive helpers |
| **SSR Error Handling** | Process-level error capture (`uncaughtExceptionMonitor`, `unhandledRejection`), h3-swallowed error debug pages, global error stashing with 5-second TTL |
| **Vercel Deployment** | Nitro preset to `vercel`, framework pinned to `tanstack-start`, native `keccak256` addon replaced with pure-JS `@noble/hashes` for Lambda compatibility |

### 🟨 Wave 2 — AI Intelligence + Risk Management

| Area | What was added |
|------|---------------|
| **Groq AI Analysis** | System prompt engineering for hedge JSON output, `analyzeMarket` with structured `MarketSignal` (direction, hedgeRatio, confidence, rationale, factorWeights, TP/SL), rate-limited Groq proxy (25 req/min) with exponential backoff on 429s |
| **Risk Controls** | `computeHedge` (multiplies spot exposure by hedge ratio), `halfKellySize` (Kelly Criterion: `f* = 0.5 × (p×b − q)/b`), `maxSafeLeverage` (capped at 5x), minimum notional check ($10), risk-reward + liquidation warnings |
| **AI Chat** | `AskAI` widget with message history, bot/user bubbles, freeform LLM answers (< 120 words) powered by same Groq proxy |
| **Live Pricing** | `PriceTicker` in dashboard header with 30s polling from CoinGecko + Binance fallback |
| **Signal Enhancements** | Factor breakdown bars (name + weight + impact), momentum overlay (14d), risk warning alerts, AI rationale text |

### 🟩 Wave 1 — Foundation (Read-Only Dashboard)

| Area | What was added |
|------|---------------|
| **Data Ingestion** | SoSoValue ETF flow API proxy (`/api/sosovalue`) — daily net flows, cumulative flows for BTC and ETH |
| **Flow Statistics** | `flowAnalyzer` computes 7d/30d net totals, outflow streaks, pressure classification (5 levels from HIGH_OUTFLOW to HIGH_INFLOW), normalized momentum |
| **Visualization** | Recharts `TradingChart` (daily flow bar chart with hedge ratio overlay), `PriceFlowChart` (cumulative area chart with gradient fill), `NewsFeed` (CryptoPanic news with sentiment dots) |
| **Signal Display** | `SignalPanel` showing hedge ratio, asset, confidence, momentum, factor breakdown, risk warnings |
| **Landing Page** | Full marketing site with Hero (animated floating keywords, live badge, stats), Features cards, How It Works steps, FAQ accordion, CTA |
| **Dashboard Shell** | Two-column layout (signal/charts left, portfolio/news/AI right), asset toggle (BTC/ETH), auto-refresh every 10 minutes, sessionStorage caching (15-min TTL) |
| **UI Framework** | shadcn/ui New York style with Tailwind v4, Radix primitives (52 components), oklch dark theme, fluid typography |

---

## 🗺️ Milestones

### 🔷 Wave 4 — Multi-Exchange + Real Funds

| Area | Target |
|------|--------|
| **Exchanges** | dYdX, Hyperliquid, Vertex integrations |
| **Real Funds** | Production wallet with risk limits, position sizing guards, circuit breakers |
| **Backtesting** | Historical ETF flow replay against price data to validate hedge signals |
| **Portfolio Rebalancing** | Periodic AI re-evaluation of open positions with automated adjustment |
| **Advanced Orders** | Trailing stops, OCO (one-cancels-other), TWAP execution |

### 🔷 Wave 5 — Autonomous + Social

| Area | Target |
|------|--------|
| **Autonomous Mode** | Trustless automated execution — user sets parameters, system runs the hedge loop |
| **Social Trading** | Share signals publicly, copy-trade top strategists, leaderboard |
| **Mobile** | React Native or PWA with wallet connect |
| **Multi-Asset** | Equity, commodity, and forex ETFs beyond BTC/ETH |
| **On-Chain Audit Trail** | All signals and trades published to IPFS or Arweave for transparency |

---

## 👥 Team

This project was built for the SoSoValue Buildathon 2026. Contributions and new members are welcome.

**Stack coverage expected:**

| Area | Skills |
|------|--------|
| **Frontend** | React 19, TanStack Router, Tailwind v4, shadcn/ui, Recharts |
| **SSR / Backend** | TanStack Start, Nitro, Vercel serverless functions |
| **AI / LLM** | Groq API, prompt engineering for structured JSON output, rate-limit design |
| **Blockchain / DeFi** | EIP-712 typed data signing, ethers.js, MetaMask integration, perpetual swap mechanics |
| **Data** | REST API integration (SoSoValue ETF flows, Binance price feeds, CryptoPanic news) |
| **Persistence** | Upstash Redis, in-memory fallback patterns |
| **DevOps** | Vercel deployment, Nitro SSR error debugging, native module compatibility |

**Mindset:** Comfortable moving between UI polish, server-side logic, smart contract data flows, and LLM prompt tuning — the stack touches all of them.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MetaMask browser extension
- SoDEX testnet account ([funding guide below](#sodex-testnet-onboarding))

### 1. Clone & Install

```bash
git clone <repo-url>
cd hedge-strategist
npm install
cp .env.example .env
```

### 2. Configure Environment

```env
SOSOVALUE_API_KEY=SOSO-...
GROQ_API_KEY=gsk_...

```

### 3. Run

```bash
npm run dev
```

Open `http://localhost:3000` (or whatever the terminal shows).

---

## 🔑 Environment Variables

| Key | Required | Purpose |
|-----|----------|---------|
| `SOSOVALUE_API_KEY` | ✅ | Live ETF flow data |
| `GROQ_API_KEY` | ✅ | AI analysis (Llama 3.3 70B) |

> **Security:** All keys are server-side only (Nitro SSR) — never bundled to the browser.

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── TradeModal.tsx              # Hedge execution: prepare → sign → submit
│   └── PortfolioPanel.tsx          # Open positions, P&L, trade history
│
├── contexts/
│   └── DashboardContext.tsx         # Shared state: signal, wallet, exposure
│
├── routes/api/
│   ├── sosovalue.ts                 # SoSoValue ETF data proxy
│   ├── analyze.ts                   # Groq AI analysis proxy
│   ├── sodex-prepare.ts             # Build EIP-712 typed data for signing
│   ├── sodex-order.ts               # Submit signed order to SoDEX gateway
│   ├── sodex-balance.ts             # SoDEX perps balance proxy
│   ├── sodex-positions.ts           # Open positions proxy
│   └── trades.ts                    # Trade history CRUD (Redis + memory)
│
├── services/
│   ├── sodex.ts                     # Client-side SDK (balance, prepare, sign, submit)
│   ├── sodex-gateway.ts             # Server-side helpers (order builder, EIP-712, hashing)
│   ├── ai.ts                        # Groq AI client (ETF analysis prompt)
│   ├── riskManager.ts               # Hedge math: notional, leverage, half-Kelly sizing
│   ├── archive.ts                   # Trade persistence (Redis with memory fallback)
│   └── archiveClient.ts             # Client-side archive calls
│
└── types/
    └── index.ts                     # Shared TypeScript types
```

### Key Design Points

- **TanStack Start** (Vite + Nitro SSR) — API routes run server-side, keeping API keys safe
- **EIP-712 signing** — `ExchangeAction(bytes32 payloadHash, uint64 nonce)` on domain `{name: "futures", version: "1", chainId: 138565, verifyingContract: 0x00…00}`
- **Signature wire format** — 66 bytes: `0x01 ‖ r ‖ s ‖ v'` where `v' = v - 27` (v normalized 27/28 → 0/1)
- **payloadHash** — `keccak256(JSON.stringify({"type":"newOrder","params":<request>}))`
- **Auth** — master-wallet direct signing via `default` API key (no `X-API-Key` header); wallet `0x9035…59e3` registered on SoDEX testnet
- **Trade history** — Upstash Redis with in-memory fallback; no external service required for dev

---

## 📡 API Integration

| Source | Endpoint | Purpose |
|--------|----------|---------|
| **SoSoValue** | `POST /openapi/v2/etf/currentEtfDataMetrics` | Live BTC/ETH ETF flows |
| **Groq** | `POST /openai/v1/chat/completions` | AI signal synthesis |
| **SoDEX Testnet** | `POST /api/v1/perps/trade/orders` | EIP-712 signed perp order placement |
| **SoDEX Testnet** | `GET /api/v1/perps/accounts/{addr}/state` | Open positions, balances, account state |
| **SoDEX Testnet** | `GET /api/v1/perps/accounts/{addr}/positions/history` | Closed position + liquidation records |
| **Binance** | `wss://stream.binance.com:9443/stream` | Live BTC/ETH price feed (miniTicker) |
| **Upstash Redis** | REST API | Trade history persistence |

---

## 🧪 SoDEX Testnet Onboarding

### 1. Get Whitelisted

Join [SoDEX testnet Telegram](https://t.me/+p6FZLlV71xhjZDY0), fill out the pinned whitelist form, wait ~24h.

### 2. Register on the Web UI

1. Go to **https://testnet.sodex.com**
2. Connect MetaMask
3. Accept Terms of Use (creates your perps account)
4. Add ValueChain testnet network when prompted:
   - **RPC**: `https://testnet-v2.valuechain.xyz`
   - **Chain ID**: `138565`
   - **Currency**: `SOSO`

### 3. Claim Test Tokens

```
https://testnet.sodex.com/faucet  →  100 USDC (daily)
```

### 4. Fund Perps

```
EVM-Funding → Spot → Futures
```

Transfer in the SoDEX web UI wallet/balances page.

### 5. Verify

```bash
curl -s "https://testnet-gw.sodex.dev/api/v1/perps/accounts/YOUR_WALLET/balances" \
  -H "Accept: application/json"
```

---

## 🛡️ Safety Controls

- **Half-Kelly position sizing** — recommended notional from balance, confidence, and max leverage
- **Risk-reward + liquidation warnings** — flagged before execution
- **Cross-margin** — default margin mode; leverage capped at 5x
- **Minimum notional check** — SoDEX $10 perps floor enforced before submission
- **Testnet-only** — all trades on `chainId: 138565`, no real funds
- **"Not financial advice"** — displayed on every signal card and trade modal
- **EIP-712 signature verification** — server-side `ethers.verifyTypedData` before relaying to gateway

---

## 🔧 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `AccountID required` | Wallet not registered on SoDEX | Register at `https://testnet.sodex.com` |
| `insufficient margin` | No funds in perps account | Transfer Spot → Futures on web UI |
| `InvalidOrderValue` | Order below $10 minimum | Increase exposure or position size |
| `API key not found` | Wallet not registered as default key | Create account on SoDEX testnet UI first |
| `bad recovery id` | v-byte normalization | Fixed in code — v 27/28 → 0/1 |
| Chain switch fails | ValueChain not added | App calls `wallet_addEthereumChain` automatically |
| `.env` not loading | Dev script missing `-r dotenv/config` | Already configured in `package.json` |

---

## 📋 SoDEX Testnet Reference

| Item | Value |
|------|-------|
| Gateway | `https://testnet-gw.sodex.dev/api/v1/perps` |
| Chain ID | `138565` (hex `0x21D45`) |
| RPC | `https://testnet-v2.valuechain.xyz` |
| Explorer | `https://test-scan.valuechain.xyz` |
| Web UI | `https://testnet.sodex.com` |
| Faucet | `https://testnet.sodex.com/faucet` |
| Go SDK | `github.com/sodex-tech/sodex-go-sdk-public` |
| Docs | `https://sodex.com/documentation/llms.txt` |

---

<div align="center">

**Hedge Strategist** · SoSoValue Buildathon 2026

*Data by [SoSoValue](https://sosovalue.com) · AI by [Groq](https://groq.com) · Trading on [SoDEX Testnet](https://sodex.com) · Wallet by [MetaMask](https://metamask.io)*

</div>
