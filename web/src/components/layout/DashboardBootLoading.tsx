"use client";

import { Loader2 } from "lucide-react";
import { OnfraLogoLockup } from "@/components/layout/OnfraLogoLockup";

export function DashboardBootLoading() {
  return (
    <div className="entry-bg fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden font-inter text-[#111017]">
      <div className="entry-pattern" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />

      <div
        role="status"
        aria-live="polite"
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <OnfraLogoLockup size="lg" />
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg shadow-[#564870]/20">
          <Loader2 size={22} className="animate-spin text-[#564870]" />
        </div>
        <p className="mt-5 text-lg font-extrabold tracking-[-0.02em]">Loading your dashboard</p>
        <p className="mt-2 max-w-xs text-sm text-[#4a4655]">Checking for saved wallet analysis…</p>
      </div>
    </div>
  );
}