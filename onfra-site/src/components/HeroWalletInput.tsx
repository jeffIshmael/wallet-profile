"use client";

import { useState } from "react";
import { ArrowRight, Check, Search } from "lucide-react";
import { LINKS } from "@/lib/links";
import { isEvmAddress } from "@/lib/walletAddress";

export function HeroWalletInput() {
  const [address, setAddress] = useState("");
  const isValid = isEvmAddress(address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    window.open(`${LINKS.app}?address=${address.trim()}`, "_blank");
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center rounded-2xl border border-white/70 bg-white p-2 shadow-2xl shadow-[#564870]/25 transition focus-within:ring-4 focus-within:ring-[#564870]/25"
      >
        <div className="flex pl-3 text-[#564870]">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter any public Celo address (0x...)"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full bg-transparent px-3 py-2 text-xs font-mono text-[#111017] placeholder:text-[#8f889e] focus:outline-none sm:text-sm"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111017] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#2a2733] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#111017] disabled:active:scale-100 sm:text-sm"
        >
          <span>Analyse wallet</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </form>
      {isValid && (
        <p role="status" className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
          <Check className="h-3.5 w-3.5 stroke-[3]" />
          Verified address
        </p>
      )}
      <p className="mt-3 text-center text-xs text-[#4a4655]">
        Start with any public address. No signups or wallet connection needed to explore.
      </p>
    </div>
  );
}