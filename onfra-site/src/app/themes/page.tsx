"use client";

import Link from "next/link";
import { ThemeSwatch } from "@/components/ThemeSwitcher";
import { useNudeTheme } from "@/components/ThemeProvider";
import { LINKS } from "@/lib/links";
import type { NudeTheme } from "@/lib/nudeThemes";
import { NUDE_THEMES } from "@/lib/nudeThemes";

function MiniPreview({ theme }: { theme: NudeTheme }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-black">
      <div
        className="px-4 py-6 text-center"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(${theme.glow}, 0.32), transparent)`
        }}
      >
        <p className="headline text-lg text-white">
          Smarter underwriting,{" "}
          <span
            style={{
              color: theme.soft,
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              textUnderlineOffset: "0.22em",
              textDecorationThickness: "1px"
            }}
          >
            happier lenders.
          </span>
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <span
            className="rounded-full px-4 py-1.5 text-[10px] font-medium text-on-nude"
            style={{ background: theme.nude }}
          >
            View API
          </span>
          <span className="rounded-full border border-white/20 px-4 py-1.5 text-[10px] text-white">
            Open App
          </span>
        </div>
      </div>
      <div className="border-t border-white/6 px-4 py-3">
        <div className="flex justify-end">
          <span
            className="max-w-[80%] rounded-2xl px-3 py-2 text-[10px] leading-4 text-on-nude"
            style={{ background: theme.nude }}
          >
            Stable earner · approve signal
          </span>
        </div>
        <p className="mt-2 font-mono text-[9px]" style={{ color: theme.muted }}>
          {theme.nude} · {theme.soft}
        </p>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const { themeId, setThemeId } = useNudeTheme();

  return (
    <div className="page-shell min-h-screen pb-24 pt-10 text-ink">
      <header className="mx-auto max-w-5xl px-5">
        <Link href="/" className="text-xs text-ink-muted transition hover:text-nude-soft">
          ← Back to home
        </Link>
        <h1 className="headline mt-4 text-3xl">Compare nude palettes</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Vivid palettes — click a card to apply it across the whole site. Your choice is saved in
          the browser.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {NUDE_THEMES.map((t) => (
            <ThemeSwatch key={t.id} id={t.id} active={themeId === t.id} onSelect={setThemeId} />
          ))}
        </div>
      </header>

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {NUDE_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setThemeId(t.id)}
            className={`rounded-2xl text-left transition ${
              themeId === t.id ? "ring-2 ring-nude/50" : ""
            }`}
          >
            <MiniPreview theme={t} />
            <p className="mt-2 text-xs font-medium text-ink">{t.label}</p>
            <p className="text-[10px] text-ink-faint">{t.note}</p>
          </button>
        ))}
      </div>

      <p className="mx-auto mt-12 max-w-5xl px-5 text-center text-xs text-ink-muted">
        Applied theme persists in your browser.{" "}
        <a
          href={LINKS.app}
          target="_blank"
          rel="noopener noreferrer"
          className="text-nude-muted hover:text-nude-soft"
        >
          Open App →
        </a>
      </p>
    </div>
  );
}
