"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { API_URL } from "@/lib/links";

type PlatformStats = {
  totals?: { wallets?: number; reports?: number };
  last7d?: { analyses?: number; reports?: number };
};

export default function StatsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setError("Could not load live stats."));
  }, []);

  const cards = [
    { label: "Wallets analyzed", value: stats?.totals?.wallets ?? "—" },
    { label: "Reports published", value: stats?.totals?.reports ?? "—" },
    { label: "Analyses (7d)", value: stats?.last7d?.analyses ?? "—" },
    { label: "Reports (7d)", value: stats?.last7d?.reports ?? "—" }
  ];

  return (
    <PageShell active="/stats">
      <p className="label-accent font-semibold">Agent stats</p>
      <h1 className="mt-2 text-2xl font-semibold">OnFRA usage</h1>
      <p className="mt-4 text-xs leading-6 text-ink-muted">
        Live platform metrics. External lender and agent calls appear here as integrations grow.
      </p>

      {error && (
        <p className="mt-6 rounded-xl border border-white/10 bg-canvas-card px-4 py-3 text-[11px] text-ink-muted">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.label} className="card-lift rounded-2xl p-5">
            <p className="label-accent font-semibold">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-nude">{card.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[10px] text-ink-faint">
        GET {API_URL}/api/stats · ERC-8004 #9219
      </p>
    </PageShell>
  );
}
