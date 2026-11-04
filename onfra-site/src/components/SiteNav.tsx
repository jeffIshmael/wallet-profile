"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { LINKS } from "@/lib/links";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Networks", href: "/#networks" },
  { label: "For Agents", href: "/#for-agents" },
  { label: "Docs", href: LINKS.docs }
] as const;

export function SiteNav({ active }: { active?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-white/60 bg-[#dad4e8]/75 px-4 py-2.5 shadow-lg shadow-[#564870]/15 backdrop-blur-2xl sm:px-6">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-[#111017] transition hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-white to-[#b7aedb] p-0.5 text-white shadow-md">
            <img src="/logo_dark.png" alt="OnFRA" className="h-full w-full rounded-full object-cover" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#111017]">OnFRA</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-7 text-xs font-semibold text-[#5f5c67] md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition hover:text-[#111017]",
                active === item.href && "text-[#111017] font-bold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <a
            href={LINKS.app}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#111017] px-5 text-xs font-bold text-white shadow-md transition hover:bg-[#2a2733] active:scale-[0.98]"
          >
            <span>Launch OnFRA app</span>
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#564870]/25 text-[#111017] hover:bg-white/50 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-40 rounded-2xl border border-white/60 bg-[#e4e0ee]/95 p-5 shadow-xl shadow-[#564870]/15 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-semibold text-[#4a4655]">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 transition hover:text-[#111017]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 pt-3 border-t border-[#564870]/15">
              <a
                href={LINKS.app}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111017] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#2a2733]"
              >
                <span>Launch OnFRA app</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}