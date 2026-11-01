"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Search } from "lucide-react";
import { isEvmAddress } from "@/lib/walletAddress";

export function AnalyzeAnotherWallet() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const isValid = isEvmAddress(wallet);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    router.push(`/dashboard?address=${encodeURIComponent(wallet.trim())}`);
  }

  return (
    <section id="analyze-wallet" className="rounded-2xl border border-white/10 bg-void-surface p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Search size={16} className="text-btc-orange" />
        <h3 className="font-space text-sm font-semibold text-white">Analyze another wallet</h3>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="analyze-another" className="sr-only">
          Celo wallet address
        </label>
        <input
          id="analyze-another"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Paste wallet address…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-xs text-white outline-none transition placeholder:text-stardust/70 focus:border-btc-orange/40"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="report-btn-primary inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-btc-orange px-4 py-2.5 text-xs font-bold text-void transition hover:bg-btc-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze
          <ArrowRight size={14} />
        </button>
      </form>

      {isValid && (
        <p role="status" className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-success">
          <Check size={13} strokeWidth={3} />
          Verified address
        </p>
      )}
    </section>
  );
}