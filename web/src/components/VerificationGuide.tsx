"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";

const REPORT_IMAGE = "/first-page.png";

/** Percent-of-page regions on first-page.png (1158×1670, from 595×842 PDF). */
const REGIONS = {
  top: {
    /** Grey metadata box — Verification Code row. */
    highlight: { top: 9.0, left: 3.5, width: 93, height: 1.5 },
    lensSize: { width: 300, height: 52 },
    zoom: { bgScale: 6.5 }
  },
  bottom: {
    /** Footer verification line at page bottom. */
    highlight: { top: 98.1, left: 2.5, width: 95, height: 1.6 },
    lensSize: { width: 320, height: 48 },
    zoom: { bgScale: 8.5 }
  }
} as const;

function regionCenter(region: (typeof REGIONS)[keyof typeof REGIONS]) {
  const { highlight } = region;
  return {
    x: highlight.left + highlight.width / 2,
    y: highlight.top + highlight.height / 2
  };
}

type HotspotId = keyof typeof REGIONS;

type Hotspot = {
  id: HotspotId;
  tabLabel: string;
  badge: string;
  caption: string;
  region: (typeof REGIONS)[HotspotId];
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "top",
    tabLabel: "Top of page",
    badge: "Find your code here",
    caption:
      "In the grey box below the title — the line labelled Verification Code (e.g. REP-SAMPLE-000001).",
    region: REGIONS.top
  },
  {
    id: "bottom",
    tabLabel: "Bottom footer",
    badge: "Also printed here",
    caption: "In the footer at the very bottom — the line starting with “Verification Code:”.",
    region: REGIONS.bottom
  }
];

function HighlightBox({ region }: { region: (typeof REGIONS)[HotspotId] }) {
  const { highlight } = region;
  return (
    <div
      className="pointer-events-none absolute z-[5] rounded-sm border-2 border-btc-orange bg-btc-orange/15 shadow-[0_0_20px_rgba(247,147,26,0.55)]"
      style={{
        top: `${highlight.top}%`,
        left: `${highlight.left}%`,
        width: `${highlight.width}%`,
        height: `${highlight.height}%`
      }}
    />
  );
}

const IMAGE_ASPECT = 1670 / 1158;

function LensCallout({ imageSrc, hotspot }: { imageSrc: string; hotspot: Hotspot }) {
  const { highlight, lensSize, zoom } = hotspot.region;
  const center = regionCenter(hotspot.region);
  const arrowDown = hotspot.id === "bottom";
  const halfW = lensSize.width / 2;
  const halfH = lensSize.height / 2;
  const scale = zoom.bgScale;
  const anchorY = arrowDown ? highlight.top - 0.35 : highlight.top + highlight.height + 0.35;

  return (
    <div
      className="absolute z-10 flex -translate-x-1/2 flex-col items-center transition-all duration-500 ease-out"
      style={{ top: `${anchorY}%`, left: `${center.x}%` }}
    >
      {!arrowDown && (
        <div className="mb-1 h-0 w-0 border-x-[7px] border-b-[8px] border-x-transparent border-b-btc-orange" />
      )}

      <div
        className="overflow-hidden rounded-lg border-[3px] border-btc-orange bg-white shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-4 ring-btc-orange/25"
        style={{ width: lensSize.width, height: lensSize.height }}
        role="img"
        aria-label={hotspot.caption}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          className="max-w-none"
          style={{
            width: `calc(${scale} * 100cqw)`,
            height: "auto",
            marginLeft: `calc(${halfW}px - ${center.x / 100} * ${scale} * 100cqw)`,
            marginTop: `calc(${halfH}px - ${center.y / 100} * ${scale} * 100cqw * ${IMAGE_ASPECT})`
          }}
        />
      </div>

      {arrowDown && (
        <div className="mt-1 h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-btc-orange" />
      )}

      <span className="mt-1 inline-flex items-center rounded bg-btc-orange px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
        {hotspot.badge}
      </span>
    </div>
  );
}

type VerificationGuideProps = {
  imageSrc?: string;
};

export function VerificationGuide({ imageSrc = REPORT_IMAGE }: VerificationGuideProps) {
  const [active, setActive] = useState<HotspotId>("top");
  const [imageError, setImageError] = useState(false);
  const hotspot = HOTSPOTS.find((h) => h.id === active) ?? HOTSPOTS[0];

  if (imageError) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">On your report</p>
        <h3 className="mt-2 font-space text-lg font-bold text-white">Where to find your verification code</h3>
        <ul className="mt-4 space-y-3 text-sm text-stardust">
          <li className="rounded-lg border border-btc-orange/30 bg-btc-orange/5 px-4 py-3">
            <span className="font-mono text-xs text-btc-orange">Top of page 1</span>
            <p className="mt-1">Verification Code in the grey box under “Financial Passport Report”.</p>
          </li>
          <li className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <span className="font-mono text-xs text-stardust">Bottom footer</span>
            <p className="mt-1">Same code repeated in the footer line.</p>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[650px] lg:mx-auto">
      <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">On your report</p>
      <h3 className="mt-2 font-space text-xl font-bold text-white md:text-2xl">
        Where to find your verification code
      </h3>
      <p className="mt-2 text-sm leading-6 text-stardust">
        Page 1 of your financial passport — use the tabs to see both locations.
      </p>

      <div
        role="tablist"
        aria-label="Verification code location"
        className="mt-4 inline-flex rounded-full border border-white/10 bg-black/40 p-1"
      >
        {HOTSPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            role="tab"
            aria-selected={active === spot.id}
            onClick={() => setActive(spot.id)}
            className={clsx(
              "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition",
              active === spot.id
                ? "bg-btc-orange text-white"
                : "text-stardust hover:text-white"
            )}
          >
            {spot.tabLabel}
          </button>
        ))}
      </div>

      <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-white p-3 shadow-[0_0_40px_-12px_rgba(247,147,26,0.35)] sm:p-4">
        <div className="relative w-full overflow-hidden rounded-lg">
          <div className="relative aspect-[1158/1670] w-full [container-type:inline-size]">
            <Image
              src={imageSrc}
              alt="Chainalyse financial passport report — page 1"
              fill
              sizes="(max-width: 650px) 100vw, 650px"
              priority
              className="object-contain"
              onError={() => setImageError(true)}
            />

            <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />

            <HighlightBox region={hotspot.region} />

            <LensCallout imageSrc={imageSrc} hotspot={hotspot} />
          </div>
        </div>

        <p className="mt-3 text-center text-sm font-medium text-stardust">{hotspot.caption}</p>
      </div>
    </div>
  );
}
