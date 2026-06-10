"use client";

import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useWalletData } from "@/hooks/useWalletData";
import { getRiskCategory } from "@/lib/format";

const segments = [
  { label: "Stablecoins", key: "stablecoin" as const, color: "#22d3a4", help: "Low-volatility assets preferred by lenders." },
  { label: "Volatile Assets", key: "volatile" as const, color: "#f5a623", help: "Price-sensitive holdings increase portfolio risk." },
  { label: "DeFi Exposure", key: "defi" as const, color: "#f59e0b", help: "Smart contract risk from DeFi positions." },
  { label: "NFT Exposure", key: "nft" as const, color: "#ef4444", help: "Illiquid assets with high valuation variance." }
];

function RiskDonut({ allocation }: { allocation: Record<string, number> }) {
  const stops: string[] = [];
  let cursor = 0;
  segments.forEach(({ key, color }) => {
    const value = allocation[key];
    stops.push(`${color} ${cursor}% ${cursor + value}%`);
    cursor += value;
  });

  return (
    <div
      className="h-10 w-10 shrink-0 rounded-full"
      style={{ background: `conic-gradient(${stops.join(", ")})` }}
      aria-hidden
    />
  );
}

export function RiskExposureCard() {
  const { walletData } = useWalletData();
  if (!walletData) return null;
  const allocation = walletData.metrics.risk.allocation;
  const nftCount = walletData.portfolio.nftCount;
  const category = getRiskCategory(allocation, nftCount);
  const tone = category === "Low Risk" ? "green" : category === "Medium Risk" ? "amber" : "red";
  const riskPosition = category === "Low Risk" ? 25 : category === "Medium Risk" ? 55 : 80;

  return (
    <Card compact className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <SectionHeader
            compact
            title="Portfolio Risk"
            help={{
              meaning: "How your liquid onchain holdings are split across risk categories.",
              calculation:
                "Stablecoins, volatile assets, and DeFi positions are shown as shares of your fungible portfolio (summing to 100%). NFTs are listed separately by count because onchain USD value is unreliable.",
              lenderRelevance: "Lenders prefer stable, liquid collateral over volatile or illiquid exposure."
            }}
          />
        </div>
        <RiskDonut allocation={allocation} />
      </div>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-[9px] text-stardust">
          <span>Low</span>
          <StatusBadge tone={tone}>{category}</StatusBadge>
          <span>High</span>
        </div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-btc-orange ring-2 ring-btc-orange/30"
            style={{ left: `${riskPosition}%` }}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-1 flex-col justify-center gap-1.5">
        {segments.map(({ label, key, color, help }) => {
          const value = allocation[key];
          const isNftRow = key === "nft";
          const showNftCount = isNftRow && nftCount > 0 && value === 0;
          const displayLabel = showNftCount
            ? `${nftCount} NFT${nftCount === 1 ? "" : "s"}`
            : `${value}%`;
          const barWidth = showNftCount ? "100%" : `${value}%`;
          const barOpacity = showNftCount ? 0.35 : 1;

          return (
            <div key={key} className="grid grid-cols-[72px_1fr] items-center gap-2" title={help}>
              <span className="truncate text-right text-[10px] text-stardust">{label}</span>
              <div className="relative h-5 overflow-hidden rounded-md bg-white/5">
                <div
                  className="flex h-full items-center justify-end rounded-md px-1.5"
                  style={{
                    width: value > 0 || showNftCount ? barWidth : 0,
                    minWidth: value > 0 || showNftCount ? "2rem" : 0,
                    background: color,
                    opacity: barOpacity
                  }}
                >
                  <span className="text-[10px] font-bold text-white">{displayLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
