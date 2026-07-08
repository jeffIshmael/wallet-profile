"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_THEME_ID,
  getTheme,
  THEME_BOOT_MAP,
  THEME_STORAGE_KEY,
  type NudeTheme,
  type NudeThemeId,
  NUDE_THEMES
} from "@/lib/nudeThemes";

const STORAGE_KEY = THEME_STORAGE_KEY;

type ThemeContextValue = {
  themeId: NudeThemeId;
  theme: NudeTheme;
  themes: NudeTheme[];
  setThemeId: (id: NudeThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(id: NudeThemeId) {
  const t = getTheme(id);
  document.documentElement.setAttribute("data-theme", id);
  document.documentElement.style.setProperty("--color-nude", t.nude);
  document.documentElement.style.setProperty("--color-nude-soft", t.soft);
  document.documentElement.style.setProperty("--color-nude-dark", t.dark);
  document.documentElement.style.setProperty("--color-nude-muted", t.muted);
  document.documentElement.style.setProperty("--accent-glow", t.glow);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<NudeThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as NudeThemeId | null;
    const initial =
      stored && NUDE_THEMES.some((t) => t.id === stored) ? stored : DEFAULT_THEME_ID;
    setThemeIdState(initial);
    applyTheme(initial);
  }, []);

  const setThemeId = useCallback((id: NudeThemeId) => {
    setThemeIdState(id);
    applyTheme(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      theme: getTheme(themeId),
      themes: NUDE_THEMES,
      setThemeId
    }),
    [themeId, setThemeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useNudeTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useNudeTheme must be used within ThemeProvider");
  return ctx;
}
