"use client";

import { ArrowRight, Link2 } from "lucide-react";
import { useState } from "react";

type CtaSectionProps = {
  onAnalyze: () => void;
  authenticated: boolean;
};

export function CtaSection({ onAnalyze, authenticated }: CtaSectionProps) {
  const [address, setAddress] = useState("");

  return (
    <section className="relative border-t border-btc-orange/30 bg-void-surface px-6 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-btc-orange/60 to-transparent" />
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-space text-3xl font-bold text-white md:text-4xl">
          Your onchain financial reputation starts here
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-stardust">
          Connect once. Get scores, insights, and a lender-ready report in minutes.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <div className="flex items-center gap-2 border-b-2 border-white/20 bg-black/50 px-4 py-3 focus-within:border-btc-orange focus-within:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)]">
            <Link2 size={14} className="shrink-0 text-stardust" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x wallet address..."
              className="w-full bg-transparent font-mono text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
          <button
            type="button"
            onClick={onAnalyze}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-btc-burnt to-btc-orange px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] transition hover:scale-105"
          >
            {authenticated ? "Analyze Wallet" : "Get Started"}
            <ArrowRight size={14} />
          </button>
        </div>
        <p className="mt-5 font-mono text-xs text-btc-gold">0.1 USDT · Full Verified Report</p>
      </div>
    </section>
  );
}
