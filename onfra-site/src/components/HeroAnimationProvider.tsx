"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_HERO_ANIMATION_ID,
  getHeroAnimation,
  HERO_ANIMATIONS,
  HERO_ANIMATION_STORAGE_KEY,
  type HeroAnimationId,
  type HeroAnimationMeta
} from "@/lib/heroAnimations";

type HeroAnimationContextValue = {
  animationId: HeroAnimationId;
  animation: HeroAnimationMeta;
  animations: HeroAnimationMeta[];
  setAnimationId: (id: HeroAnimationId) => void;
};

const HeroAnimationContext = createContext<HeroAnimationContextValue | null>(null);

export function HeroAnimationProvider({ children }: { children: ReactNode }) {
  const [animationId, setAnimationIdState] = useState<HeroAnimationId>(DEFAULT_HERO_ANIMATION_ID);

  useEffect(() => {
    const stored = localStorage.getItem(HERO_ANIMATION_STORAGE_KEY) as HeroAnimationId | null;
    if (stored && HERO_ANIMATIONS.some((a) => a.id === stored)) {
      setAnimationIdState(stored);
    }
  }, []);

  const setAnimationId = useCallback((id: HeroAnimationId) => {
    setAnimationIdState(id);
    localStorage.setItem(HERO_ANIMATION_STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({
      animationId,
      animation: getHeroAnimation(animationId),
      animations: HERO_ANIMATIONS,
      setAnimationId
    }),
    [animationId, setAnimationId]
  );

  return <HeroAnimationContext.Provider value={value}>{children}</HeroAnimationContext.Provider>;
}

export function useHeroAnimation() {
  const ctx = useContext(HeroAnimationContext);
  if (!ctx) throw new Error("useHeroAnimation must be used within HeroAnimationProvider");
  return ctx;
}
