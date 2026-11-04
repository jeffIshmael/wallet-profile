import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { LINKS } from "@/lib/links";

import { DocsAssistantDropdown } from "./DocsAssistantDropdown";

export function DocsHeader() {
  return (
    <header className="docs-header sticky top-0 z-50 border-b border-[var(--lav-border)] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/docs" className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
            <img src="/logo_dark.png" alt="OnFRA" className="h-5 w-5 rounded-full" />
            <span>OnFRA Docs</span>
          </Link>
          <nav className="hidden items-center gap-5 text-xs text-[var(--ink-body)] md:flex">
            <Link href="/" className="transition hover:text-[var(--brand)]">
              Home
            </Link>
            <Link href={LINKS.skills} className="transition hover:text-[var(--brand)]">
              Skills
            </Link>
            <Link href={LINKS.pricing} className="transition hover:text-[var(--brand)]">
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={LINKS.agent8004}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-[var(--lav-border)] px-3 py-1.5 text-[11px] text-[var(--ink-body)] transition hover:border-[var(--brand)] hover:text-[var(--ink)] sm:inline-flex"
          >
            ERC-8004
          </a>
          <a
            href={LINKS.app}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-purple flex h-8 items-center gap-1 px-3.5 text-[11px]"
          >
            Open Web App
            <ArrowUpRight size={12} strokeWidth={2} />
          </a>
        </div>
      </div>
    </header>
  );
}

export function DocsBreadcrumb({ section, title }: { section: string; title: string }) {
  return (
    <div className="docs-breadcrumb">
      <span className="docs-breadcrumb-pill">{section}</span>
      <span className="docs-breadcrumb-sep">/</span>
      <span className="docs-breadcrumb-current">{title}</span>
    </div>
  );
}

export function DocsH2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="docs-h2">
      {children}
    </h2>
  );
}

export function DocsH3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="docs-h3">
      {children}
    </h3>
  );
}

export { DocsCode } from "./DocsCode";
export { DocsAssistantDropdown } from "./DocsAssistantDropdown";

export function DocsTable({ children }: { children: ReactNode }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">{children}</table>
    </div>
  );
}