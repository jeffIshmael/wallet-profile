"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import {
  DEFAULT_THEME_ID,
  getTheme,
  type NudeTheme,
  type NudeThemeId
} from "@/lib/nudeThemes";

type ThemeContextValue = {
  themeId: NudeThemeId;
  theme: NudeTheme;
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
  useEffect(() => {
    applyTheme(DEFAULT_THEME_ID);
  }, []);

  const value = useMemo(
    () => ({
      themeId: DEFAULT_THEME_ID,
      theme: getTheme(DEFAULT_THEME_ID)
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useNudeTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useNudeTheme must be used within ThemeProvider");
  return ctx;
}
