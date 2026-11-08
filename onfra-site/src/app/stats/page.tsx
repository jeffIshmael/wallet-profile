"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { API_URL } from "@/lib/links";

type PlatformStats = {
  totals?: {
    wallets?: number;
    analyses?: number;
    reports?: number;
    apiEvents?: number;
    externalApiEvents?: number;
  };
  today?: { apiEvents?: number };
  averages?: {
    financialHealthScore?: number;
    reputationScore?: number;
  };
  last7Days?: {
    analyses?: number;
    reports?: number;
    apiEvents?: number;
  };
};

function fmt(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
}

export default function StatsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load live stats.");
        setLoading(false);
      });
  }, []);

  const topCards = [
    { label: "Wallets scanned", value: fmt(stats?.totals?.wallets) },
    { label: "Total analyses run", value: fmt(stats?.totals?.analyses) },
    { label: "Reports published", value: fmt(stats?.totals?.reports) },
    { label: "Total API calls", value: fmt(stats?.totals?.apiEvents) },
  ];

  const secondCards = [
    { label: "Analyses this week", value: fmt(stats?.last7Days?.analyses) },
    { label: "API calls this week", value: fmt(stats?.last7Days?.apiEvents) },
    { label: "API calls today", value: fmt(stats?.today?.apiEvents) },
    { label: "External (x402) calls", value: fmt(stats?.totals?.externalApiEvents) },
  ];

  const avgHealth = stats?.averages?.financialHealthScore;
  const avgRep = stats?.averages?.reputationScore;

  return (
    <PageShell active="/stats">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="label-accent font-semibold">Platform stats</p>
          <h1 className="mt-2 text-2xl font-semibold">OnFRA usage</h1>
          <p className="mt-3 max-w-xl text-xs leading-6 text-ink-muted">
            Live platform metrics pulled from the OnFRA API. All numbers update in
            real-time as wallets are analyzed and reports are generated on Celo.
          </p>
        </div>

        {/* Live indicator */}
        <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-white/10 bg-canvas-card px-4 py-3 text-[11px] text-ink-muted">
          {error}
        </p>
      )}

      {/* Loading state skeleton */}
      {loading && !error && (
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-lift animate-pulse rounded-2xl p-5">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-4 h-8 w-16 rounded-lg bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Totals row */}
      {!loading && (
        <>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topCards.map((card) => (
              <div key={card.label} className="card-lift rounded-2xl p-5">
                <p className="label-accent font-semibold">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-nude">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Activity row */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {secondCards.map((card) => (
              <div key={card.label} className="card-lift rounded-2xl p-5">
                <p className="label-accent font-semibold">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-nude">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Averages — only show when data is populated */}
          {(avgHealth != null || avgRep != null) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {avgHealth != null && (
                <div className="card-lift rounded-2xl p-5">
                  <p className="label-accent font-semibold">Avg. financial health score</p>
                  <p className="mt-3 text-3xl font-semibold text-nude">
                    {avgHealth.toFixed(1)}<span className="text-base font-normal text-ink-muted">/100</span>
                  </p>
                </div>
              )}
              {avgRep != null && (
                <div className="card-lift rounded-2xl p-5">
                  <p className="label-accent font-semibold">Avg. reputation score</p>
                  <p className="mt-3 text-3xl font-semibold text-nude">
                    {avgRep.toFixed(1)}<span className="text-base font-normal text-ink-muted">/100</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <p className="mt-10 text-[10px] text-ink-faint">
        Source: GET {API_URL}/api/stats · ERC-8004 agent #9219 on Celo mainnet
      </p>
    </PageShell>
  );
}
