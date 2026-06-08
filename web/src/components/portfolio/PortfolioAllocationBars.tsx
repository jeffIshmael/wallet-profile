"use client";

import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockWallet } from "@/data/mockWallet";

export function PortfolioAllocationBars() {
  return (
    <Card>
      <h2 className="font-sora text-lg font-bold">Token Balances</h2>
      <div className="mt-4 space-y-3">
        {mockWallet.tokens.map((token) => {
          const pct = Math.min(100, Math.max(4, (token.usdValue / mockWallet.portfolio.totalValueUsd) * 100));
          return (
            <div key={token.symbol}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-bold">{token.symbol}</span>
                <span className="text-muted">${token.usdValue.toFixed(2)}</span>
              </div>
              <ProgressBar value={pct} tone={token.isStable ? "green" : "blue"} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
