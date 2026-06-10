"use client";

import { ArrowRight, Wallet } from "lucide-react";
import { truncateAddress } from "@/lib/format";

type AnalyzeWalletPromptProps = {
  address: string | null;
  onAnalyze: () => void;
};

export function AnalyzeWalletPrompt({ address, onAnalyze }: AnalyzeWalletPromptProps) {
  return (
    <div className="relative flex min-h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] items-center justify-center bg-void px-6 pb-6 font-inter text-white md:min-h-screen">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)"
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-btc-orange/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-btc-orange/40 bg-btc-orange/10 shadow-[0_0_30px_-8px_rgba(247,147,26,0.5)]">
          <Wallet size={28} className="text-btc-orange" />
        </div>

        <h1 className="font-space text-2xl font-bold">Analyse your wallet</h1>
        <p className="mt-3 text-sm leading-6 text-stardust">
          Run a full onchain analysis to unlock your dashboard, financial scores, and transaction statements.
        </p>

        {address && (
          <p className="mt-4 font-mono text-xs text-stardust">
            Connected: <span className="text-white">{truncateAddress(address)}</span>
          </p>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          className="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-btc-orange/80 px-8 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white shadow-[0_0_20px_-5px_rgba(247,147,26,0.4)] transition hover:bg-btc-orange/90 hover:scale-105"
        >
          Analyse My Wallet
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
