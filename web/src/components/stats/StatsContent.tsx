"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { truncateAddress } from "@/lib/format";

export type PlatformStats = {
  totals: {
    wallets: number;
    analyses: number;
    reports: number;
    chatMessages: number;
  };
  averages: {
    financialHealthScore: number;
    reputationScore: number;
  };
  last7Days: {
    analyses: number;
    reports: number;
    chatMessages: number;
    apiEvents: number;
  };
  endpointUsage: Array<{ endpoint: string; count: number }>;
  dailyAnalyses: Array<{ day: string; count: number }>;
  dailyApiUsage: Array<{
    day: string;
    analyze: number;
    chat: number;
    report: number;
    total: number;
  }>;
};

export type WalletStats = {
  walletAddress: string;
  analysisCount: number;
  reportCount: number;
  chatMessageCount: number;
  lastAnalyzedAt: string | null;
};

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-stardust">{subtitle}</p>}
    </div>
  );
}

function StatTile({
  label,
  value,
  compactValue = false
}: {
  label: string;
  value: string | number;
  compactValue?: boolean;
}) {
  return (
    <Card compact className="flex flex-col gap-1">
      <p className="text-[11px] uppercase tracking-wide text-stardust">{label}</p>
      <p
        className={`font-sora font-bold text-white ${compactValue ? "text-sm leading-snug" : "text-2xl"}`}
      >
        {value}
      </p>
    </Card>
  );
}

function formatDayLabel(day: string) {
  const date = new Date(`${day}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const chartTooltipStyle = {
  background: "#0b1220",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8
};

export function StatsContent() {
  const { address, authenticated, ready } = useWalletAuth();
  const isSignedIn = ready && authenticated && Boolean(address);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const platformRes = await fetch("/api/stats");
        if (!platformRes.ok) throw new Error("Failed to load platform stats.");
        const platformPayload = (await platformRes.json()) as PlatformStats;
        if (!cancelled) setPlatformStats(platformPayload);

        if (isSignedIn && address) {
          const walletRes = await fetch(`/api/stats?walletAddress=${encodeURIComponent(address)}`);
          if (walletRes.ok) {
            const walletPayload = (await walletRes.json()) as WalletStats;
            if (!cancelled) setWalletStats(walletPayload);
          }
        } else if (!cancelled) {
          setWalletStats(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stats.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [address, isSignedIn]);

  const analysesChartData =
    platformStats?.dailyAnalyses.map((row) => ({
      ...row,
      label: formatDayLabel(row.day)
    })) ?? [];

  const apiChartData =
    platformStats?.dailyApiUsage.map((row) => ({
      ...row,
      label: formatDayLabel(row.day)
    })) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 sm:px-6">
      <PageHeader
        title="Platform Stats"
        subtitle="Live usage metrics from the Chainalyse database — analyses, reports, chat activity, and API calls."
      />

      {loading && <p className="text-sm text-stardust">Loading stats…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

      {platformStats && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Wallets analyzed" value={platformStats.totals.wallets} />
            <StatTile label="Total analyses" value={platformStats.totals.analyses} />
            <StatTile label="Reports published" value={platformStats.totals.reports} />
            <StatTile label="Chat messages" value={platformStats.totals.chatMessages} />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Card compact>
              <p className="mb-2 text-xs uppercase tracking-wide text-stardust">Last 7 days</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-stardust">
                  Analyses: <span className="text-white">{platformStats.last7Days.analyses}</span>
                </p>
                <p className="text-stardust">
                  Reports: <span className="text-white">{platformStats.last7Days.reports}</span>
                </p>
                <p className="text-stardust">
                  Chat: <span className="text-white">{platformStats.last7Days.chatMessages}</span>
                </p>
                <p className="text-stardust">
                  API calls: <span className="text-white">{platformStats.last7Days.apiEvents}</span>
                </p>
              </div>
            </Card>

            <Card compact>
              <p className="mb-2 text-xs uppercase tracking-wide text-stardust">Average scores</p>
              <p className="text-sm text-stardust">
                Financial health:{" "}
                <span className="font-medium text-white">
                  {platformStats.totals.analyses > 0
                    ? platformStats.averages.financialHealthScore.toFixed(1)
                    : "—"}
                </span>
              </p>
              <p className="mt-1 text-sm text-stardust">
                Reputation:{" "}
                <span className="font-medium text-white">
                  {platformStats.totals.analyses > 0
                    ? platformStats.averages.reputationScore.toFixed(1)
                    : "—"}
                </span>
              </p>
            </Card>

            <Card compact>
              <p className="mb-2 text-xs uppercase tracking-wide text-stardust">API usage (30d)</p>
              <div className="flex flex-col gap-1">
                {platformStats.endpointUsage.length === 0 && (
                  <p className="text-xs text-stardust">No API activity recorded yet.</p>
                )}
                {platformStats.endpointUsage.map((row) => (
                  <p key={row.endpoint} className="text-sm text-stardust">
                    {row.endpoint}: <span className="text-white">{row.count}</span>
                  </p>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card>
              <p className="mb-3 text-xs uppercase tracking-wide text-stardust">Analyses per day (7d)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar
                      dataKey="count"
                      name="Analyses"
                      fill="#B8B0C8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <p className="mb-3 text-xs uppercase tracking-wide text-stardust">API calls per day (7d)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={apiChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                    <Bar
                      dataKey="analyze"
                      name="Analyze"
                      stackId="api"
                      fill="#B8B0C8"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar dataKey="chat" name="Chat" stackId="api" fill="#60a5fa" />
                    <Bar dataKey="report" name="Report" stackId="api" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      {isSignedIn && walletStats && (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
          <PageHeader
            title="Your wallet activity"
            subtitle={`Signed-in activity for ${truncateAddress(walletStats.walletAddress)}`}
          />

          {walletStats.analysisCount === 0 ? (
            <Card compact className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stardust">
                You haven&apos;t analysed your wallet yet. Run an analysis to unlock your dashboard and personal
                stats here.
              </p>
              <Link
                href="/dashboard?analyze=1"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-btc-orange/80 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-white transition hover:bg-btc-orange/90"
              >
                Analyse my wallet
                <ArrowRight size={14} />
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile label="Your analyses" value={walletStats.analysisCount} />
              <StatTile label="Your reports" value={walletStats.reportCount} />
              <StatTile label="Your chat messages" value={walletStats.chatMessageCount} />
              <StatTile
                label="Last analysed"
                compactValue
                value={
                  walletStats.lastAnalyzedAt ? formatDateTime(walletStats.lastAnalyzedAt) : "—"
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
