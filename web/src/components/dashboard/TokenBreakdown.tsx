"use client";

import { TOKEN_COLORS, describeTokens } from "@/lib/flow";

/** "Across 3 tokens  [CELO] [USDC] [USDm]" */
export function TokenBreakdown({ tokens, className = "" }: { tokens: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-stardust ${className}`}>
      <span className="font-semibold">{describeTokens(tokens)}</span>
      {tokens.map((symbol) => (
        <span
          key={symbol}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 font-semibold text-white"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: TOKEN_COLORS[symbol] ?? "#8f889e" }}
          />
          {symbol}
        </span>
      ))}
    </div>
  );
}