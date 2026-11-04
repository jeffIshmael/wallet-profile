"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   RotatingWord: swaps the headline verb ("Understand" -> "Visualize" ...)
   Drop-in replacement for the static word, so the hero layout is unchanged.
------------------------------------------------------------------- */
const WORDS = ["Understand", "Visualize", "Export", "Track"];
// One soft background per word (same order as WORDS)
const COLORS = ["#ffffff99", "#ffd9a8aa", "#bfeedaaa", "#c3dcfaaa", "#f6c9d6aa"];

export function RotatingWord({
  words = WORDS,
  interval = 2600
}: {
  words?: string[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let swap: ReturnType<typeof setTimeout>;
    const tick = setInterval(() => {
      setLeaving(true);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setLeaving(false);
      }, 320);
    }, interval);

    return () => {
      clearInterval(tick);
      clearTimeout(swap);
    };
  }, [words.length, interval]);

  return (
    <span
      className="rotating-word-wrap"
      aria-live="polite"
      style={{ backgroundColor: COLORS[index % COLORS.length] }}
    >
      <span
        key={words[index]}
        className={leaving ? "rotating-word word-out" : "rotating-word word-in"}
      >
        {words[index]}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------
   CountUp: animates a number when it scrolls into view.
------------------------------------------------------------------- */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1600
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(to);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(to * eased);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}