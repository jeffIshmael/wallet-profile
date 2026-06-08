"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText } from "lucide-react";

export function ReportCodeGuide() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">On your report</p>
      <h3 className="mt-2 font-space text-xl font-bold text-white md:text-2xl">Where to find your verification code</h3>
      <p className="mt-3 text-sm leading-6 text-stardust">
        Open your Wallet Profile financial passport and look for the verification code near the bottom of the report.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-btc-orange/30 bg-black/50 shadow-[0_0_40px_-12px_rgba(247,147,26,0.25)]">
        <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-btc-orange" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-btc-orange" />

        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-btc-orange" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Report preview</p>
          </div>
        </div>

        <div className="relative p-4 md:p-5">
          {!imageError ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-void-surface">
              <Image
                src="/report-verification-guide.png"
                alt="Screenshot showing where the verification code appears on a Wallet Profile report"
                width={640}
                height={480}
                className="h-auto w-full object-cover"
                onError={() => setImageError(true)}
                priority
              />
              <div className="pointer-events-none absolute bottom-6 right-6 rounded-lg border border-btc-orange bg-btc-orange/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white shadow-[0_0_20px_rgba(247,147,26,0.5)]">
                Code here
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-void-surface p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="font-dancing text-lg text-btc-orange">Wallet Profile</p>
                <span className="rounded-full border border-btc-gold/40 bg-btc-gold/10 px-2 py-0.5 font-mono text-[9px] text-btc-gold">
                  Verified
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Health 89", "Reputation 92", "Stability 86"].map((score) => (
                  <div key={score} className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">
                    <p className="font-mono text-[9px] text-stardust">{score.split(" ")[0]}</p>
                    <p className="font-mono text-sm text-white">{score.split(" ")[1]}</p>
                  </div>
                ))}
              </div>
              <div className="relative mt-6 rounded-xl border-2 border-btc-orange bg-btc-orange/10 px-4 py-3 ring-4 ring-btc-orange/20">
                <p className="font-mono text-[9px] uppercase tracking-widest text-btc-orange">Verification code</p>
                <p className="mt-1 font-mono text-sm text-white">WP-7A30EF182A4729CB</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
