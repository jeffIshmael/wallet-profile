"use client";

import Link from "next/link";
import { truncateAddress } from "@/lib/format";

type LandingNavProps = {
  onSignIn: () => void;
  onTryChat: () => void;
  authenticated: boolean;
  address: string | null;
  active?: "home" | "verify";
};

function navLinkClass(isActive: boolean) {
  return isActive
    ? "text-btc-orange underline underline-offset-4"
    : "text-stardust transition hover:text-white";
}

export function LandingNav({ onSignIn, onTryChat, authenticated, address, active = "home" }: LandingNavProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="flex w-full max-w-4xl items-center justify-between gap-3 rounded-full border border-white/10 bg-black/90 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl md:gap-6 md:px-6">
        <Link href="/" className="shrink-0 font-dancing text-2xl font-semibold text-white md:text-3xl">
          Wallet<span className="text-btc-orange">Profile</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm md:flex">
          {active === "home" ? (
            <a href="#how-it-works" className={navLinkClass(false)}>
              How it works
            </a>
          ) : (
            <Link href="/#how-it-works" className={navLinkClass(false)}>
              How it works
            </Link>
          )}
          <button type="button" onClick={onTryChat} className={`relative mr-2 ${navLinkClass(false)}`}>
            Agent chat
            <span className="absolute -right-3 -top-2 rounded-md bg-btc-orange px-1 py-0.5 text-[8px] font-bold uppercase leading-none tracking-wide text-white">
              New
            </span>
          </button>
          <Link href="/verify" className={navLinkClass(active === "verify")}>
            Verify
          </Link>
        </div>

        <button
          type="button"
          onClick={onSignIn}
          className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-void transition hover:bg-white/90"
        >
          {authenticated && address ? truncateAddress(address) : "Sign in"}
        </button>
      </nav>
    </header>
  );
}
