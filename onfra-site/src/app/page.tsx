"use client";

import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroWalletInput } from "@/components/HeroWalletInput";
import { FaqAccordion } from "@/components/FaqAccordion";
import { AgentSection } from "@/components/AgentSection";
import { LINKS } from "@/lib/links";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Bot,
  PieChart,
  Layers,
  Sparkles,
  Download,
  User,
  Building2,
  Wallet,
  Terminal,
  Braces,
  Network,
  Activity,
  Code2,
} from "lucide-react";

type Audience = "humans" | "agents";

const HERO_BENEFITS = [
  "Understand inflows and outflows",
  "Get clear cash flow summaries",
  "Analyze spending and token activity",
  "Generate downloadable statements",
];

const USE_CASES = [
  {
    title: "See what you earn and spend",
    audience: "For individuals",
    description:
      "Get a clearer picture of wallet activity, income patterns, spending, and transaction history.",
    icon: User,
    className: "from-[#e6e0f5] to-[#cfc6ea]",
    iconClass: "text-[#43385a]",
  },
  {
    title: "Keep treasury activity visible",
    audience: "For teams and treasuries",
    description:
      "Understand how funds move through operational wallets and review transactions across a selected period.",
    icon: Building2,
    className: "from-[#fdeccd] to-[#f8d5a3]",
    iconClass: "text-[#8a5a12]",
  },
  {
    title: "Give agents financial context",
    audience: "For AI agents",
    description:
      "Let an agent query supported wallet activity and use Onfra's financial data in its own workflows.",
    icon: Bot,
    className: "from-[#d6f3e8] to-[#aee3cf]",
    iconClass: "text-[#17624a]",
  },
  {
    title: "Make activity easier to review",
    audience: "For analysts and reviewers",
    description:
      "Turn raw on-chain activity into organized information and downloadable transaction records.",
    icon: ShieldCheck,
    className: "from-[#dbe9fb] to-[#b9d3f5]",
    iconClass: "text-[#1d4a8f]",
  },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Understand your inflows",
    body: "Review incoming transactions and explore activity patterns across your supported wallet history.",
  },
  {
    icon: PieChart,
    title: "See where funds go",
    body: "Explore outgoing transactions, token activity, and how funds move from a wallet over time.",
  },
  {
    icon: Download,
    title: "Export transaction statements",
    body: "Turn wallet activity into a readable record with transaction dates, details, and amounts.",
  },
  {
    icon: Activity,
    title: "Explore financial patterns",
    body: "Review cash flow summaries and other insights derived from the wallet activity Onfra analyzes.",
  },
  {
    icon: Layers,
    title: "Analyze across periods",
    body: "Move between time periods to understand how wallet activity changes over time.",
  },
  {
    icon: Bot,
    title: "Make data available to agents",
    body: "Connect an external agent to Onfra's tools so it can retrieve financial intelligence programmatically.",
  },
];

function HumanPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-2 font-mono text-xs font-medium text-[#6f6b7a]">
            app.onfra.xyz/dashboard
          </span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#ebe8f3] px-3 py-1 text-[11px] font-semibold text-[#564870]">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Wallet overview
        </span>
      </div>

      <div className="bg-white p-2 sm:p-4">
        <img
          src="/dashboa.png"
          alt="Onfra wallet financial analytics dashboard"
          className="h-auto w-full rounded-xl object-cover"
        />
      </div>
    </div>
  );
}

function AgentPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#29243a] bg-[#171421] text-left shadow-inner">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7561a8]/25 text-[#c6b5ff]">
            <Bot className="h-4 w-4" />
          </span>
          Treasury Assistant
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
          External agent demo
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-[#6f5a9f] px-4 py-3 text-sm leading-6 text-white">
          Summarize this wallet&apos;s activity for October. How much came in?
        </div>

        <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.06] px-4 py-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#c6b5ff]">
            <Network className="h-3.5 w-3.5" />
            Calling Onfra MCP tools
          </div>
          <div className="space-y-2 font-mono text-[11px] leading-5 sm:text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Connected to Onfra MCP server</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Discovered available financial tools</span>
            </div>
            <div className="rounded-lg bg-black/25 p-3 text-white/65">
              <div className="text-[#c6b5ff]">tool_call</div>
              get_wallet_activity(&quot;0x...&quot;, &quot;October&quot;)
              <div className="mt-2 text-emerald-300">
                {"{"} inflows, outflows, counterparties, transactions {"}"}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/80">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#c6b5ff]">
            <Sparkles className="h-3.5 w-3.5" />
            Agent response
          </div>
          Onfra returns the wallet data. The external agent interprets the
          results and presents a financial summary to the user.
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] text-white/65">
              Cash flow summary
            </span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] text-white/65">
              Top counterparties
            </span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] text-white/65">
              Transaction history
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-[10px] text-white/45">
        <Terminal className="h-3.5 w-3.5" />
        Illustrative workflow — connect your agent using Onfra&apos;s tools.
      </div>
    </div>
  );
}

export default function HomePage() {
  const [audience, setAudience] = useState<Audience>("humans");

  return (
    <div className="page-shell bg-white text-[#111017]">
      <SiteNav />

      <main>
        {/* HERO */}
        <section className="hero-pitch-purple relative overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-28 md:pt-36">
          <div className="nordic-pattern" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-48 h-96 w-96 rounded-full bg-[#b7aedb]/25 blur-3xl" />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 text-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 p-1 pr-4 text-xs font-semibold text-[#4a4655] shadow-lg backdrop-blur-md">
              <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 font-bold text-[#111017]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#564870]" />
                On-chain intelligence
              </span>
              <span className="pl-2 font-bold">For people and AI agents</span>
            </div>

            <h1 className="headline mt-8 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111017] sm:text-5xl md:text-6xl lg:text-7xl">
              Turn your on-chain activity into
              <span className="headline-accent mt-1 block">
                financial intelligence.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-[#4a4655] sm:text-lg md:text-xl">
              From <span className="underline decoration-[#f5b862] decoration-[3px] underline-offset-[7px]">raw transactions</span>{" "} to financial clarity. 
            </p>

            <ul className="mx-auto mt-7 mb-3 grid max-w-2xl gap-x-8 gap-y-3 text-left text-sm font-medium text-[#4a4655] sm:grid-cols-2">
              {HERO_BENEFITS.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#564870]/10 text-[#564870]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 w-full max-w-2xl">
              <HeroWalletInput />
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={LINKS.app}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#111017] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#564870]/20 transition hover:bg-[#2a2733] active:scale-[0.98]"
              >
                <span>Launch Onfra app</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </a>
              <a
                href="#how-it-works"
                className="btn-ghost flex items-center gap-2 px-7 py-3.5 text-sm font-semibold transition"
              >
                <span>See how it works</span>
              </a>
            </div>

            <p className="mt-4 text-xs font-medium text-[#4a4655]">
              Start with a public wallet address. No signup or wallet
              connection needed to explore.
            </p>

            {/* Audience switcher and product preview */}
            <div
              id="audience"
              className="relative mx-auto mt-16 w-full max-w-5xl scroll-mt-24"
            >
              <div className="mx-auto mb-5 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#625779]">
                  One intelligence layer. Two ways to use it.
                </p>
                <div className="mt-4 inline-flex items-center rounded-full border border-[#403653] bg-[#302641] p-1.5 shadow-xl shadow-[#302641]/20">
                  <button
                    type="button"
                    onClick={() => setAudience("humans")}
                    aria-pressed={audience === "humans"}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                      audience === "humans"
                        ? "bg-white text-[#302641] shadow-md"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    For humans
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudience("agents")}
                    aria-pressed={audience === "agents"}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                      audience === "agents"
                        ? "bg-white text-[#302641] shadow-md"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Bot className="h-4 w-4" />
                    For agents
                  </button>
                </div>
              </div>

              <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/80 bg-white/65 p-2 shadow-2xl shadow-[#564870]/20 backdrop-blur-md sm:p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-2 px-2 py-2 text-center sm:flex-row sm:text-left">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#171421]">
                      {audience === "humans"
                        ? "Your wallet, made understandable."
                        : "Your agent, connected to Onfra."}
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-[#625d6d] sm:text-sm">
                      {audience === "humans"
                        ? "Explore wallet activity through a clear financial dashboard."
                        : "An external agent calls Onfra's tools and uses the returned data in its own workflow."}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d9d2e8] bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#564870]">
                    {audience === "humans" ? (
                      <Wallet className="h-3.5 w-3.5" />
                    ) : (
                      <Braces className="h-3.5 w-3.5" />
                    )}
                    {audience === "humans"
                      ? "Onfra dashboard"
                      : "MCP + agent tools"}
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl">
                  {audience === "humans" ? <HumanPreview /> : <AgentPreview />}
                </div>

                <div className="flex flex-col items-center justify-between gap-3 px-2 py-4 sm:flex-row">
                  <p className="max-w-xl text-xs leading-5 text-[#625d6d]">
                    {audience === "humans"
                      ? "Paste a public wallet address to explore its on-chain financial activity."
                      : "Build your own agent experience while Onfra provides the underlying wallet intelligence."}
                  </p>
                  {audience === "humans" ? (
                    <a
                      href={LINKS.app}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#171421] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#302a40]"
                    >
                      Explore your wallet <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <a
                      href="#for-agents"
                      className="inline-flex items-center gap-2 rounded-full bg-[#171421] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#302a40]"
                    >
                      Explore agent tools <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section id="use-cases" className="section-subtle scroll-mt-24 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center">
              <p className="label-accent">Who It&apos;s For</p>
              <h2 className="headline mx-auto mt-3 max-w-2xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
                Financial clarity for every kind of wallet.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#5f5c67]">
                Whether you&apos;re reviewing your own activity, managing a
                treasury, or building an AI agent, Onfra helps make on-chain
                financial activity easier to understand and use.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {USE_CASES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`usecase-card flex flex-col bg-gradient-to-br ${item.className} p-6`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60">
                      <Icon className={`h-5 w-5 ${item.iconClass}`} />
                    </div>
                    <p className={`mt-6 text-xs font-bold ${item.iconClass}`}>
                      {item.audience}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold text-[#111017]">
                      {item.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-6 text-[#4a4655]">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* THE PROBLEM */}
        <section className="section-light border-t border-[#d4cee1]/70 py-24">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">The Problem</p>
            <h2 className="headline mx-auto mt-3 max-w-2xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
              Blockchains record every transaction. Understanding them is
              another matter.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#5f5c67] sm:text-base">
              Wallets can hold a detailed history of financial activity, but
              raw transactions are difficult to interpret. Onfra organizes
              that activity into information people and applications can
              actually use.
            </p>

            <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
              <div className="card-lift p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <PieChart className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111017]">
                  Where did the funds go?
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  Transfers, token movements, and swaps make it difficult to
                  understand spending at a glance.
                </p>
              </div>

              <div className="card-lift p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111017]">
                  What does the activity mean?
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  A block explorer shows transactions, but it does not
                  automatically provide a clear financial summary.
                </p>
              </div>

              <div className="card-lift p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebe8f3] text-[#564870]">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111017]">
                  Agents need reliable context.
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  AI agents need structured financial information they can
                  retrieve and use in their own workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-24 section-subtle border-t border-[#d4cee1]/70 py-24"
        >
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">How It Works</p>
            <h2 className="headline mx-auto mt-3 max-w-2xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
              From on-chain activity to useful financial intelligence.
            </h2>

            <div className="mt-14 grid gap-6 text-left sm:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Provide a wallet",
                  body: "Enter a public wallet address or connect through the supported Onfra experience.",
                },
                {
                  number: "02",
                  title: "Onfra analyzes activity",
                  body: "Onfra processes supported on-chain transactions and organizes the available financial data.",
                },
                {
                  number: "03",
                  title: "Explore or integrate",
                  body: "Review the results in the dashboard, export records, or retrieve data through agent-accessible tools.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-3xl border border-[#d4cee1] bg-white/75 p-7 transition hover:shadow-md"
                >
                  <span className="font-mono text-3xl font-extrabold text-[#564870]">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-[#111017]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="scroll-mt-24 section-light border-t border-[#d4cee1]/70 py-24"
        >
          <div className="mx-auto max-w-5xl px-5 text-center">
            <p className="label-accent">What You Can Do</p>
            <h2 className="headline mx-auto mt-3 max-w-xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
              More than a transaction list.
            </h2>

            <div className="mt-12 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="card-lift p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebe8f3] text-[#564870]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-base font-bold text-[#111017]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                      {feature.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* NETWORKS */}
        <section
          id="networks"
          className="section-subtle scroll-mt-24 border-t border-[#d4cee1]/70 py-20"
        >
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Supported Networks</p>
            <h2 className="headline mx-auto mt-3 max-w-lg text-2xl font-extrabold text-[#111017] sm:text-3xl">
              On-chain intelligence, starting with supported networks.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-xs text-[#5f5c67] sm:text-sm">
              Explore wallet activity on the networks currently supported by
              Onfra.
            </p>

            <div className="mx-auto mt-8 flex flex-wrap items-stretch justify-center gap-4">
              <div className="relative flex min-w-[220px] flex-col items-center gap-3 rounded-3xl border border-[#d4cee1] bg-white px-10 py-6 shadow-sm">
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
                <img
                  src="/celo_logo.jpg"
                  alt="Celo Network"
                  className="h-12 w-auto object-contain sm:h-14"
                />
                <span className="text-sm font-bold text-[#111017]">
                  Celo Mainnet
                </span>
                <p className="font-mono text-center text-[11px] text-[#6f6b7a]">
                  Supports CELO, USDT, USDC, and USDm transactions
                </p>
              </div>

              <div className="relative flex min-w-[180px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#c9c2dc] bg-white/70 px-10 py-6">
                <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  Coming soon
                </span>
                <img
                  src="/base_logo.webp"
                  alt="Base Network"
                  className="h-12 w-auto object-contain sm:h-14"
                />
                <span className="text-sm font-bold text-[#111017]">Base</span>
              </div>

              <div className="relative flex min-w-[180px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#c9c2dc] bg-white/70 px-10 py-6">
                <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  Coming soon
                </span>
                <img
                  src="/Arc_logo.jpg"
                  alt="Arc Network"
                  className="h-12 w-auto object-contain sm:h-14"
                />
                <span className="text-sm font-bold text-[#111017]">Arc</span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST AND VERIFICATION */}
        <section className="section-light border-t border-[#d4cee1]/70 py-20">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Transparent By Design</p>
            <h2 className="headline mx-auto mt-3 max-w-xl text-2xl font-extrabold text-[#111017] sm:text-3xl">
              Financial insights grounded in on-chain activity.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#5f5c67]">
              Onfra analyzes public blockchain data to organize wallet
              activity. Where report verification is available, the relevant
              on-chain proof can be independently inspected.
            </p>

            <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
              {[
                {
                  title: "Public transaction data",
                  body: "Underlying transfers can be inspected through the relevant network's public block explorer.",
                },
                {
                  title: "On-chain report proofs",
                  body: "Where supported, reports can include an on-chain attestation that can be independently checked.",
                },
                {
                  title: "Clear reporting periods",
                  body: "Reports identify the period and wallet activity included in the analysis.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#d4cee1] bg-white p-6 shadow-sm"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#564870]" />
                  <h3 className="mt-4 text-sm font-bold text-[#111017]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#5f5c67]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOR AGENTS */}
        <div id="for-agents" className="scroll-mt-24">
          <AgentSection />
        </div>

        {/* FAQ */}
        <section
          id="faq"
          className="section-subtle scroll-mt-24 border-t border-[#d4cee1]/70 py-24"
        >
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Questions, Answered</p>
            <h2 className="headline mx-auto mt-3 max-w-lg text-3xl font-extrabold text-[#111017] sm:text-4xl">
              A few things you should know.
            </h2>
            <FaqAccordion />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bottom-pitch-purple relative overflow-hidden py-24 text-[#111017] sm:py-32">
          <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-[#b7aedb]/25 blur-3xl" />
          <div className="nordic-pattern" />

          <div className="relative mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Start with Onfra</p>
            <h2 className="headline mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight text-[#111017] sm:text-5xl md:text-6xl">
              Make your on-chain activity
              <span className="headline-accent block">make more sense.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#4a4655] sm:text-lg">
              Explore a wallet, understand its financial activity, or build
              with Onfra&apos;s agent-accessible tools.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href={LINKS.app}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#111017] px-9 py-4 text-sm font-bold text-white shadow-2xl shadow-[#564870]/20 transition hover:bg-[#2a2733] active:scale-[0.98]"
              >
                <span>Analyze a wallet</span>
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </a>
              <a
                href="#for-agents"
                className="btn-ghost flex items-center gap-2 px-8 py-4 text-sm font-semibold transition"
              >
                <span>Build with Onfra</span>
                <Code2 className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
