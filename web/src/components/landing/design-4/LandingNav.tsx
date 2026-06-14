"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChainalyseBrand } from "@/components/layout/ChainalyseBrand";
import { useWalletDisplay } from "@/hooks/useWalletDisplay";

type LandingNavProps = {
  onSignIn: () => void;
  onDisconnect: () => void;
  onTryChat: () => void;
  authenticated: boolean;
  address: string | null;
  connecting?: boolean;
  active?: "home" | "verify" | "stats" | "dashboard";
};

function navLinkClass(isActive: boolean) {
  return isActive
    ? "text-btc-orange underline underline-offset-4"
    : "text-stardust transition hover:text-white";
}

export function LandingNav({
  onSignIn,
  onDisconnect,
  onTryChat,
  authenticated,
  address,
  connecting = false,
  active = "home"
}: LandingNavProps) {
  const { miniPay, primaryLabel, secondaryHint } = useWalletDisplay();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function handleDisconnect() {
    setMenuOpen(false);
    onDisconnect();
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="flex w-full max-w-4xl items-center justify-between gap-3 rounded-full border border-white/10 bg-black/90 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl md:gap-6 md:px-6">
        <ChainalyseBrand size="lg" href="/" theme="dark" />

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
          {active !== "home" && (
            <Link href="/dashboard" className={navLinkClass(active === "dashboard")}>
              Dashboard
            </Link>
          )}
          <Link href="/verify" className={navLinkClass(active === "verify")}>
            Verify
          </Link>
          <Link href="/stats" className={navLinkClass(active === "stats")}>
            Stats
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {authenticated && address ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-void transition hover:bg-white/90"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span>{primaryLabel}</span>
                {secondaryHint && (
                  <span className="font-mono text-[10px] font-normal text-void/60">{secondaryHint}</span>
                )}
                <ChevronDown size={14} className={`transition ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] min-w-[10rem] overflow-hidden rounded-xl border border-white/10 bg-black/95 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDisconnect}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-stardust transition hover:bg-white/5 hover:text-white"
                  >
                    <LogOut size={14} />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : miniPay ? (
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-stardust">
              {connecting ? "Connecting…" : "Opening MiniPay…"}
            </span>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              disabled={connecting}
              className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-void transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-70"
            >
              {connecting ? "Connecting..." : "Sign in"}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
