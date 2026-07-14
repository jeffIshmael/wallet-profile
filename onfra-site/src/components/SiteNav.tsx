import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { LINKS } from "@/lib/links";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Docs", href: LINKS.docs },
  { label: "Pricing", href: LINKS.pricing },
  { label: "Stats", href: LINKS.stats }
] as const;

export function SiteNav({ active, tone = "dark" }: { active?: string; tone?: "dark" | "light" }) {
  const light = tone === "light";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <div
        className={cn(
          "mt-[var(--nav-top)] flex w-full max-w-4xl items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5",
          light ? "nav-pill-light" : "nav-pill"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            light ? "text-on-nude" : "text-ink"
          )}
        >
          <img src="/logo_dark.png" alt="OnFRA" className="h-10 w-10 rounded-full " />
          <span className="ml-1">OnFRA</span>
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-6 text-xs md:flex",
            light ? "text-on-nude/60" : "text-ink-muted"
          )}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.href === LINKS.docs ? "_blank" : undefined}
              rel={item.href === LINKS.docs ? "noopener noreferrer" : undefined}
              className={cn(
                "transition",
                light ? "hover:text-on-nude" : "hover:text-nude-soft",
                active === item.href && (light ? "text-on-nude" : "text-nude-soft")
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={LINKS.app}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-medium transition",
              light
                ? "bg-on-nude text-white hover:bg-on-nude/90"
                : "bg-nude text-on-nude hover:bg-nude-soft"
            )}
          >
            Open Web App
            <ArrowUpRight size={14} strokeWidth={2} />
          </a>
        </div>
      </div>
    </header>
  );
}
