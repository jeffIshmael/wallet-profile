"use client";

import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { LINKS } from "@/lib/links";

export function HeroWalletInput() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = address.trim();
    if (!clean) {
      window.open(LINKS.app, "_blank");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      setError("Please enter a valid Celo wallet address (0x...)");
      return;
    }
    setError("");
    window.open(`${LINKS.app}?address=${clean}`, "_blank");
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
          onChange={(e) => {
            setAddress(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter any public Celo address (0x...)"
          className="w-full bg-transparent px-3 py-2 text-xs font-mono text-[#111017] placeholder:text-[#8f889e] focus:outline-none sm:text-sm"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111017] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#2a2733] active:scale-[0.98] sm:text-sm"
        >
          <span>Analyse wallet</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </form>
      {error && <p className="mt-2 text-center text-xs font-semibold text-rose-700">{error}</p>}
      <p className="mt-3 text-center text-xs text-[#4a4655]">
        Start with any public address. No signups or wallet connection needed to explore.
      </p>
    </div>
  );
}