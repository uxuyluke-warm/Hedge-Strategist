import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  TrendingDown,
  Zap,
  ArrowRight,
  Bot,
  Radio,
  Waves,
  Layers,
  Lock,
  LineChart,
  Sparkles,
  Github,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "On-Chain Hedge Strategist — Neutralize crypto risk with AI" },
      {
        name: "description",
        content:
          "AI hedge recommendations from live ETF flows. Turn spot exposure into delta-neutral positions on SoDEX perps in seconds.",
      },
      { property: "og:title", content: "On-Chain Hedge Strategist" },
      {
        property: "og:description",
        content:
          "AI hedge recommendations from live ETF flows. Neutralize BTC/ETH spot risk with SoDEX perps.",
      },
    ],
  }),
  component: Landing,
});

const FLOATING_KEYWORDS = [
  { text: "Hedge Ratio", x: "8%", y: "12%", d: 0, size: "text-2xl" },
  { text: "ETF Outflows", x: "78%", y: "8%", d: 1.2, size: "text-xl" },
  { text: "Δ-Neutral", x: "18%", y: "72%", d: 2.4, size: "text-3xl" },
  { text: "SHORT PERPS", x: "70%", y: "68%", d: 0.6, size: "text-lg" },
  { text: "Groq", x: "50%", y: "6%", d: 3.1, size: "text-xl" },
  { text: "SoSoValue", x: "5%", y: "42%", d: 1.8, size: "text-lg" },
  { text: "SoDEX", x: "84%", y: "38%", d: 2.7, size: "text-2xl" },
  { text: "1.5×", x: "38%", y: "82%", d: 3.6, size: "text-4xl" },
  { text: "risk-off", x: "60%", y: "88%", d: 0.3, size: "text-base" },
  { text: "BTC", x: "88%", y: "82%", d: 4.2, size: "text-lg" },
  { text: "ETH", x: "12%", y: "88%", d: 5.0, size: "text-lg" },
  { text: "flows → signal", x: "42%", y: "40%", d: 2.0, size: "text-sm" },
  { text: "no directional bets", x: "62%", y: "50%", d: 4.5, size: "text-sm" },
  { text: "testnet", x: "30%", y: "22%", d: 1.5, size: "text-sm" },
  { text: "on-chain", x: "72%", y: "22%", d: 3.3, size: "text-base" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-[oklch(0.15_0.02_260)] text-foreground overflow-x-hidden relative">
      <Aurora />
      <Nav />
      <Hero />
      <TickerBar />
      <Features />
      <HowItWorks />
      <SignalPreview />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.55_0.2_170)] opacity-25 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.55_0.24_260)] opacity-25 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[oklch(0.6_0.2_190)] opacity-20 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}

function Nav() {
  return (
    <header className="relative z-20">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[oklch(0.7_0.19_170)] to-[oklch(0.55_0.22_240)]">
            <Shield className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <div className="font-semibold tracking-tight text-white">
            Hedge<span className="text-[oklch(0.75_0.18_170)]">.strat</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how" className="hover:text-white transition">How it works</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
          <a href="https://github.com/uxuyluke-warm/Hedge-Strategist.git" className="hover:text-white transition inline-flex items-center gap-1.5">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </nav>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 transition"
        >
          Launch app <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-32 md:pt-24 md:pb-40">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {FLOATING_KEYWORDS.map((kw, i) => (
          <span
            key={i}
            className={`floating-kw absolute font-mono uppercase tracking-widest text-white/[0.09] ${kw.size} whitespace-nowrap`}
            style={{ left: kw.x, top: kw.y, animationDelay: `${kw.d}s` }}
          >
            {kw.text}
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-1 text-xs text-white/70 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.75_0.18_170)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.75_0.18_170)]" />
          </span>
          Live · ETF flows updated every 60s
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-[-0.03em] leading-[0.95] text-white max-w-5xl">
          Neutralize crypto risk<br />
          <span className="bg-gradient-to-r from-[oklch(0.85_0.18_170)] via-[oklch(0.8_0.2_200)] to-[oklch(0.7_0.22_260)] bg-clip-text text-transparent">
            before the market notices.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg md:text-xl text-white/60 leading-relaxed">
          An AI hedge strategist that reads live ETF flows from SoSoValue,
          measures your spot exposure, and opens delta-neutral perps on SoDEX
          testnet in one click. No directional bets — just risk, cancelled.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.85_0.18_170)] to-[oklch(0.75_0.22_240)] px-6 py-3 text-sm font-semibold text-black hover:opacity-90 transition shadow-[0_0_40px_oklch(0.85_0.18_170_/_0.35)]"
          >
            Open the dashboard
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition"
          >
            See how it works
          </a>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 max-w-2xl">
          <Stat label="Avg hedge ratio" value="1.42×" />
          <Stat label="Signal latency" value="< 3s" />
          <Stat label="Testnet trades" value="128k+" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-white/10 pl-4">
      <div className="text-2xl md:text-3xl font-semibold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-white/40 mt-1">{label}</div>
    </div>
  );
}

function TickerBar() {
  const items = [
    "GROQ AI",
    "SOSOVALUE DATA",
    "SODEX PERPS",
    "DELTA NEUTRAL",
    "ETF NET FLOWS",
    "ON-CHAIN EXECUTION",
    "TESTNET SAFE",
  ];
  return (
    <div className="relative z-10 border-y border-white/10 bg-white/[0.02] py-4 overflow-hidden">
      <div className="flex animate-marquee gap-12 whitespace-nowrap text-sm font-mono uppercase tracking-[0.3em] text-white/40">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t}
            <span className="text-[oklch(0.75_0.18_170)]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const items = [
    {
      icon: Bot,
      title: "Groq-powered strategist",
      body: "Llama3-70B parses ETF flow anomalies in under a second. It never predicts direction — it prescribes a hedge ratio, an asset, and a side.",
    },
    {
      icon: Waves,
      title: "SoSoValue flow radar",
      body: "Live spot BTC/ETH ETF net flows and multi-day outflow streaks streamed through our proxy — no CORS, no leaked keys.",
    },
    {
      icon: Zap,
      title: "One-click SoDEX perps",
      body: "The recommended ratio pre-fills your order. Enter spot exposure, hit submit, and the perp size, side, and leverage are set for you.",
    },

    {
      icon: Lock,
      title: "Non-custodial, testnet-safe",
      body: "Signatures stay in your wallet. Testnet-only execution — no real funds are ever at risk while you learn the system.",
    },
    {
      icon: LineChart,
      title: "Hedge overlay charting",
      body: "See the AI hedge ratio traced live over ETF flow bars. If pressure builds, the ratio climbs. Visual, not vibes.",
    },
  ];

  return (
    <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <SectionHead
        eyebrow="Capabilities"
        title="Every layer, engineered for risk-off."
        sub="Six primitives that turn ETF chaos into a clean hedge order — nothing more, nothing less."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 border border-white/10">
              <it.icon className="h-4 w-4 text-[oklch(0.8_0.16_170)]" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">{it.title}</h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Flows in",
      body: "SoSoValue streams BTC & ETH ETF net flows, cumulative inflow/outflow, and multi-day streaks into the strategist proxy.",
      icon: Radio,
    },
    {
      n: "02",
      title: "Groq recommends",
      body: "The model returns strict JSON: direction (HEDGE / NEUTRAL), hedgeAsset, hedgeAction, and a hedgeRatio calibrated to pressure.",
      icon: Sparkles,
    },
    {
      n: "03",
      title: "You size it",
      body: "Enter your spot exposure. We multiply by the ratio to get the exact perp notional. No math, no guessing, no overshoot.",
      icon: Layers,
    },
    {
      n: "04",
      title: "SoDEX executes",
      body: "One tap opens a short (or long) perp on SoDEX testnet. Your wallet signs — we never hold funds.",
      icon: TrendingDown,
    },
  ];
  return (
    <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <SectionHead
        eyebrow="How it works"
        title="Four steps from flow to hedge."
        sub="No dashboards to configure. No indicators to tune. The strategist has one job: keep your delta at zero."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div
            key={i}
            className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[oklch(0.75_0.18_170)]">{s.n}</span>
              <s.icon className="h-4 w-4 text-white/40" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SignalPreview() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <SectionHead
            eyebrow="Preview"
            title="A signal that tells you what to do."
            sub="No 'BTC might dump.' No 'sentiment is bearish.' A single JSON object with a number you can act on."
            align="left"
          />
          <ul className="mt-8 space-y-3 text-sm text-white/60">
            {[
              "hedgeRatio → the multiplier you apply to your spot notional.",
              "hedgeAction → SHORT_PERPS or LONG_PERPS, never a maybe.",
              "confidence → a 0–1 score you can gate alerts on.",
              "rationale → one sentence citing the actual flows.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[oklch(0.75_0.18_170)] flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[oklch(0.55_0.2_170)]/20 to-[oklch(0.55_0.22_260)]/20 blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-[oklch(0.18_0.02_260)]/80 backdrop-blur p-6 font-mono text-sm shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-2 text-xs text-white/40">POST /api/analyze</span>
            </div>
            <pre className="text-[13px] leading-relaxed text-white/80 whitespace-pre-wrap">
{`// response · 214ms · groq/llama3-70b
{
  "direction": "HEDGE",
  "hedgeAsset": "ETH",
  "hedgeAction": "SHORT_PERPS",
  "hedgeRatio": 1.48,
  "confidence": 0.71,
  "rationale": "5-day ETF outflow streak;
    net −$1.2B this week — hedge spot with
    1.48× short ETH perps."
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    {
      q: "Is this a directional trading bot?",
      a: "No. The strategist explicitly refuses to make directional predictions. It only recommends hedges that neutralize existing spot exposure.",
    },
    {
      q: "What do I need to try it?",
      a: "Nothing. Live SoSoValue data and Groq inference come from placeholder endpoints out of the box. Add your keys later to go from mock to live.",
    },
    {
      q: "Is real money at risk?",
      a: "No. SoDEX integration targets testnet only. You sign perp orders with a testnet wallet — no mainnet routes are wired up.",
    },
    {
      q: "How is this different from a stop-loss?",
      a: "A stop-loss closes your position. A hedge keeps you in the market with your delta neutralized — you preserve upside optionality while shedding downside risk.",
    },
  ];
  return (
    <section id="faq" className="relative z-10 mx-auto max-w-4xl px-6 py-28">
      <SectionHead eyebrow="FAQ" title="Reasonable questions." />
      <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
        {qs.map((it, i) => (
          <details key={i} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between text-white font-medium">
              {it.q}
              <span className="ml-4 grid h-6 w-6 place-items-center rounded-full border border-white/15 text-white/50 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-white/55 leading-relaxed">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[oklch(0.22_0.06_170)] via-[oklch(0.18_0.05_240)] to-[oklch(0.15_0.02_260)] p-12 md:p-20 text-center">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.7 0.2 170 / 0.4), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.6 0.25 260 / 0.4), transparent 50%)",
          }}
        />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white">
            Your spot is exposed.
            <br />
            <span className="bg-gradient-to-r from-[oklch(0.85_0.18_170)] to-[oklch(0.75_0.22_260)] bg-clip-text text-transparent">
              Cancel the delta.
            </span>
          </h2>
          <p className="mt-6 text-white/60 max-w-xl mx-auto">
            Open the dashboard, plug in your spot exposure, and watch a hedge appear.
            Takes about eight seconds.
          </p>
          <Link
            to="/app"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-white/90 transition"
          >
            Launch app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-white/40">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[oklch(0.7_0.19_170)] to-[oklch(0.55_0.22_240)]">
            <Shield className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-white/70 font-medium">Hedge.strat</span>
          <span>· Testnet demo. Not financial advice.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how" className="hover:text-white transition">How it works</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>
      </div>
    </footer>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      <div className="text-[11px] uppercase tracking-[0.3em] text-[oklch(0.75_0.18_170)]">{eyebrow}</div>
      <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.02em] text-white">{title}</h2>
      {sub && <p className="mt-4 text-white/55 leading-relaxed">{sub}</p>}
    </div>
  );
}
