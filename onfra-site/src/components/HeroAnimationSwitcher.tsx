"use client";

import { Clapperboard } from "lucide-react";
import { useState } from "react";
import { useHeroAnimation } from "@/components/HeroAnimationProvider";
import { cn } from "@/lib/cn";
import type { HeroAnimationId } from "@/lib/heroAnimations";

export function HeroAnimationSwitcher() {
  const { animationId, animations, setAnimationId, animation } = useHeroAnimation();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-[100] flex flex-col items-start gap-2">
      {open && (
        <div className="w-64 rounded-2xl border border-white/10 bg-black/95 p-3 shadow-float backdrop-blur-xl">
          <p className="px-1 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
            Hero animation
          </p>
          <p className="mt-1 px-1 text-[10px] text-ink-muted">{animation.note}</p>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {animations.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAnimationId(a.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition",
                    animationId === a.id ? "bg-white/8" : "hover:bg-white/5"
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-nude/25 bg-nude/10 text-[10px] text-nude-soft">
                    {a.label.slice(0, 2)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-ink">{a.label}</span>
                    <span className="block truncate text-[10px] text-ink-faint">{a.note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <a
            href="/animations"
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
        <Clapperboard size={14} className="text-nude" />
        {animation.label}
      </button>
    </div>
  );
}

export function AnimationSwatch({
  id,
  active,
  onSelect
}: {
  id: HeroAnimationId;
  active: boolean;
  onSelect: (id: HeroAnimationId) => void;
}) {
  const { animations } = useHeroAnimation();
  const a = animations.find((x) => x.id === id)!;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "rounded-xl border px-3 py-2 text-left transition",
        active ? "border-nude/50 bg-white/5" : "border-white/8 hover:border-white/15"
      )}
    >
      <span className="text-xs font-medium text-ink">{a.label}</span>
    </button>
  );
}
