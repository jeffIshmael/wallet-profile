"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Copy,
  Info,
  PieChart,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useWalletData } from "@/hooks/useWalletData";
import { copyWithToast } from "@/lib/copyToClipboard";
import {
  TIMEFRAMES,
  TOKENS,
  buildInsights,
  buildSeries,
  compactUsd,
  moneyShort,
  summarize,
  type Insight,
  type Timeframe,
  type TokenSelection
} from "@/lib/flow";
import { truncateAddress } from "@/lib/format";
import { addRecentWallet } from "@/lib/recentWallets";

/* ---------- small pieces ---------- */

function TimeframeChips({
  value,
  onChange
}: {
  value: Timeframe;
  onChange: (next: Timeframe) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Timeframe">
      {TIMEFRAMES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={
            value === key
              ? "shrink-0 rounded-full bg-btc-orange px-3 py-1.5 text-[11px] font-bold text-void"
              : "shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-stardust transition hover:text-white"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon: Icon
}: {
  label: string;
  value: string;
  tone: string;
  icon: typeof ArrowDownRight;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-2.5 sm:p-3.5">
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[11px] font-medium text-stardust">{label}</span>
        <Icon size={13} className={`shrink-0 ${tone}`} />
      </div>
      <p className={`mt-1.5 truncate font-mono text-sm font-bold sm:text-xl ${tone}`}>{value}</p>
    </div>
  );
}

const INSIGHT_ICONS = {
  trend: TrendingUp,
  wallet: Wallet,
  spend: PieChart,
  info: Info
} as const;

function InsightRow({ insight }: { insight: Insight }) {
  const Icon = INSIGHT_ICONS[insight.kind];
  return (
    <li className="flex items-start gap-3 rounded-xl bg-black/20 p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-btc-orange/10 text-btc-orange">
        <Icon size={15} />
      </span>
      <p className="pt-1 text-xs leading-5 text-white">{insight.text}</p>
    </li>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-void-surface px-2.5 py-1.5 text-[11px] shadow-lg">
      <p className="font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="mt-0.5 flex items-center gap-1.5 text-stardust">
          <span
            className={`h-2 w-2 rounded-full ${p.dataKey === "received" ? "bg-btc-orange" : "bg-[#f5a623]"}`}
          />
          {p.name}: <span className="font-mono text-white">{moneyShort(Number(p.value))}</span>
        </p>
      ))}
    </div>
  );
}

const selectClass =
  "rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[11px] font-semibold text-white focus:border-btc-orange/40 focus:outline-none";

function GuestBanner() {
  const { authenticated, privyEnabled, loginWithGoogle, loginWithWallet } = useWalletAuth();
  if (authenticated) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-btc-orange/30 bg-btc-orange/10 p-3 sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Sparkles size={18} className="shrink-0 text-btc-orange" />
        <p className="text-xs leading-5 text-stardust">
          <span className="font-semibold text-white">Create an account</span> to save this analysis.
        </p>
      </div>
      <button
        type="button"
        onClick={privyEnabled ? loginWithGoogle : loginWithWallet}
        className="report-btn-primary shrink-0 rounded-full bg-btc-orange px-4 py-2 text-[11px] font-bold text-void transition hover:bg-btc-orange/90"
      >
        Create account
      </button>
    </div>
  );
}

/* ---------- the page ---------- */

export function HomeOverview() {
  const searchParams = useSearchParams();
  const { authenticated, address: ownAddress, miniPay } = useWalletAuth();
  const { walletData, refreshWallet, isAnalyzing, isRefreshing } = useWalletData();

  const [timeframe, setTimeframe] = useState<Timeframe>("6M");
  const [token, setToken] = useState<TokenSelection>("All");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  // Remember viewed wallets for the Analyze page's "Recent activity"
  const viewedAddress = walletData?.walletAddress;
  useEffect(() => {
    if (viewedAddress) addRecentWallet(viewedAddress);
  }, [viewedAddress]);

  const tf = TIMEFRAMES.find((item) => item.key === timeframe) ?? TIMEFRAMES[5];
  const txs = useMemo(() => walletData?.transactions ?? [], [walletData]);

  const current = useMemo(() => summarize(txs, tf.days, token), [txs, tf, token]);
  const previous = useMemo(() => summarize(txs, tf.days, token, 1), [txs, tf, token]);
  const series = useMemo(() => buildSeries(txs, tf, token), [txs, tf, token]);
  const insights = useMemo(() => buildInsights(current, previous, tf.long), [current, previous, tf]);
  const hasChartData = series.some((point) => point.received > 0 || point.sent > 0);

  if (!walletData) return null;

  const isOwn =
    authenticated && ownAddress?.toLowerCase() === walletData.walletAddress.toLowerCase();
  const busy = isAnalyzing || isRefreshing;
  const shortAddress = truncateAddress(walletData.walletAddress, 6, 4);
  const addressParam = searchParams.get("address");
  const statementsHref = addressParam
    ? `/dashboard/statements?address=${encodeURIComponent(addressParam)}`
    : "/dashboard/statements";
  const tokenOptions = TOKENS.filter((item) => !(miniPay && item === "CELO"));
  const netPositive = current.net >= 0;

  return (
    <div className="grid gap-3">
      {/* Heading */}
      <div>
        {isOwn ? (
          <>
            <h1 className="font-space text-2xl font-semibold text-white sm:text-3xl">{greeting} 👋</h1>
            <p className="mt-1 text-sm text-stardust">Here’s your financial overview</p>
          </>
        ) : (
          <>
            <h1 className="font-space text-2xl font-semibold text-white sm:text-3xl">Wallet overview</h1>
            <p className="mt-1 text-sm text-stardust">
              Your financial activity at a glance
              {authenticated && (
                <>
                  {" · "}
                  <Link href="/dashboard" className="font-semibold text-btc-orange hover:underline">
                    Back to my wallet
                  </Link>
                </>
              )}
            </p>
          </>
        )}
      </div>

      {/* Wallet + totals */}
      <section className="rounded-2xl border border-white/10 bg-void-surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-stardust">{isOwn ? "Your wallet" : "Wallet"}</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-sm font-semibold text-white">
              {shortAddress}
              <button
                type="button"
                onClick={() => void copyWithToast(walletData.walletAddress, "Wallet address copied")}
                className="text-stardust transition hover:text-btc-orange"
                aria-label="Copy wallet address"
              >
                <Copy size={12} />
              </button>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-stardust">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {isOwn ? "Connected" : "Celo Network"}
            </span>
            <button
              type="button"
              onClick={() => void refreshWallet()}
              disabled={busy}
              className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-stardust transition hover:text-white disabled:cursor-wait disabled:opacity-50"
              aria-label="Refresh analysis"
              title="Refresh analysis"
            >
              <RefreshCw size={13} className={busy ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <TimeframeChips value={timeframe} onChange={setTimeframe} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Received" value={moneyShort(current.received)} tone="text-teal" icon={ArrowDownRight} />
          <Stat label="Sent" value={moneyShort(current.sent)} tone="text-btc-orange" icon={ArrowUpRight} />
          <Stat
            label="Net flow"
            value={`${netPositive ? "+" : "−"}${moneyShort(current.net)}`}
            tone={netPositive ? "text-teal" : "text-danger"}
            icon={TrendingUp}
          />
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Cash flow */}
        <section className="rounded-2xl border border-white/10 bg-void-surface p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-space text-sm font-semibold text-white">Cash flow overview</h2>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="flow-token">
                Token
              </label>
              <select
                id="flow-token"
                value={token}
                onChange={(e) => setToken(e.target.value as TokenSelection)}
                className={selectClass}
              >
                {tokenOptions.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All tokens" : item}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="flow-timeframe">
                Timeframe
              </label>
              <select
                id="flow-timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className={selectClass}
              >
                {TIMEFRAMES.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 text-[11px] text-stardust">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-btc-orange" /> Received
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f5a623]" /> Sent
            </span>
          </div>

          <div className="relative mt-3 h-56 text-btc-orange">
            {/* @ts-expect-error ResponsiveContainer type incompatibility between React 18 and Next.js */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cashflowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,141,170,0.2)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                  tick={{ fill: "#8f889e", fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: "#8f889e", fontSize: 10 }}
                  tickFormatter={(v) => compactUsd(Number(v))}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="received"
                  name="Received"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="url(#cashflowFill)"
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  name="Sent"
                  stroke="#f5a623"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>

            {!hasChartData && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <p className="rounded-lg bg-void-surface/90 px-3 py-1.5 text-xs text-stardust">
                  No activity in this period
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Key insights */}
        <section className="flex flex-col rounded-2xl border border-white/10 bg-void-surface p-4 sm:p-5">
          <h2 className="flex items-center gap-2 font-space text-sm font-semibold text-white">
            <Sparkles size={15} className="text-btc-orange" />
            Key insights
          </h2>
          <ul className="mt-3 space-y-2">
            {insights.map((insight) => (
              <InsightRow key={insight.text} insight={insight} />
            ))}
          </ul>
          <Link
            href={statementsHref}
            className="report-btn-primary mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-btc-orange px-4 py-3 text-sm font-bold text-void transition hover:bg-btc-orange/90 lg:mt-auto"
          >
            View transactions
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>

      <GuestBanner />
    </div>
  );
}