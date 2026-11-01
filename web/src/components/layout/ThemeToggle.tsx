"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { clsx } from "clsx";

const STORAGE_KEY = "onfra-theme";
const THEME_EVENT = "onfra-theme-change";

export type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light-theme") ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light-theme", theme === "light");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable: the choice just won't persist */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Dark is the default. The choice is stored and shared by every toggle on the page. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        document.documentElement.classList.toggle("light-theme", saved === "light");
      }
    } catch {
      /* ignore */
    }
    setTheme(readTheme());

    const sync = () => setTheme(readTheme());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  const toggle = useCallback(() => {
    applyTheme(readTheme() === "light" ? "dark" : "light");
  }, []);

  return { theme, toggle };
}

type ThemeToggleProps = {
  className?: string;
  showLabel?: boolean;
};

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const toLight = theme === "dark";
  const label = toLight ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 text-stardust transition hover:border-btc-orange/40 hover:text-white",
        showLabel ? "px-3 text-[11px] font-semibold" : "w-9",
        className
      )}
    >
      {toLight ? <Sun size={16} /> : <Moon size={16} />}
      {showLabel && <span>{toLight ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}