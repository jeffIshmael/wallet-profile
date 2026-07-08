"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

export function DashboardBootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-void font-inter text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)"
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-btc-orange/40 bg-btc-orange/10 shadow-[0_0_30px_-8px_rgba(184,176,200,0.5)]">
          <Image src="/logo_dark.png" alt="" width={36} height={36} className="rounded-md" aria-hidden />
          <Loader2
            size={18}
            className="absolute -bottom-1 -right-1 animate-spin rounded-full bg-void p-0.5 text-btc-orange"
          />
        </div>
        <p className="font-space text-lg font-semibold">Loading your dashboard</p>
        <p className="mt-2 max-w-xs text-sm text-stardust">Checking for saved wallet analysis…</p>
      </div>
    </div>
  );
}
