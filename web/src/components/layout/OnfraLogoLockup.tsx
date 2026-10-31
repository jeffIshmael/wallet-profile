"use client";

import Image from "next/image";

/**
 * Logo for light/lavender backgrounds.
 * The mark in /logo_dark.png is made for dark surfaces, so it sits on an ink tile.
 * That keeps it readable on the lavender background; the wordmark is plain ink text.
 */
export function OnfraLogoLockup({ size = "md" }: { size?: "md" | "lg" }) {
  const tile = size === "lg" ? "h-24 w-24 rounded-2xl" : "h-10 w-10 rounded-xl";
  const px = size === "lg" ? 32 : 24;
  const text = size === "lg" ? "text-2xl" : "text-xl";

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`flex shrink-0 items-center justify-center ${tile}`}>
        <Image src="/logo_dark.png" alt="" width={px} height={px} aria-hidden className="rounded-md" />
      </span>
      <span className={`font-extrabold tracking-[-0.04em] text-[#111017] ${text}`}>OnFRA</span>
    </span>
  );
}