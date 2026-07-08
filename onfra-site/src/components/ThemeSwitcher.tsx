"use client";

import { Palette } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useNudeTheme } from "@/components/ThemeProvider";
import type { NudeThemeId } from "@/lib/nudeThemes";

export function ThemeSwitcher() {
  const { themeId, themes, setThemeId, theme } = useNudeTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2">
      {open && (
        <div className="w-64 rounded-2xl border border-white/10 bg-black/95 p-3 shadow-float backdrop-blur-xl">
          <p className="px-1 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
            Nude palette
          </p>
          <p className="mt-1 px-1 text-[10px] text-ink-muted">{theme.note}</p>
          <ul className="mt-3 space-y-1">
            {themes.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setThemeId(t.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition",
                    themeId === t.id ? "bg-white/8" : "hover:bg-white/5"
                  )}
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-full border border-white/15"
                    style={{ background: `linear-gradient(135deg, ${t.nude}, ${t.soft})` }}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-ink">{t.label}</span>
                    <span className="block truncate text-[10px] text-ink-faint">{t.note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <a
            href="/themes"
            className="mt-2 block rounded-lg px-2 py-1.5 text-center text-[10px] text-nude-muted transition hover:text-nude-soft"
          >
            Compare all side-by-side →
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/12 bg-black/90 px-4 py-2.5 text-xs font-medium text-ink shadow-pill backdrop-blur-xl transition hover:border-white/20"
        aria-expanded={open}
      >
        <Palette size={14} className="text-nude" />
        <span
          className="h-4 w-4 rounded-full border border-white/20"
          style={{ backgroundColor: theme.nude }}
        />
        {theme.label}
      </button>
    </div>
  );
}

/** Inline swatch row for /themes comparison page */
export function ThemeSwatch({
  id,
  active,
  onSelect
}: {
  id: NudeThemeId;
  active: boolean;
  onSelect: (id: NudeThemeId) => void;
}) {
  const { themes } = useNudeTheme();
  const t = themes.find((x) => x.id === id)!;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "rounded-xl border px-3 py-2 text-left transition",
        active ? "border-nude/50 bg-white/5" : "border-white/8 hover:border-white/15"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-6 w-6 rounded-full border border-white/15"
          style={{ background: t.nude }}
        />
        <span className="text-xs font-medium text-ink">{t.label}</span>
      </div>
    </button>
  );
}
