"use client";

import Image from "next/image";
import { useState } from "react";

const REPORT_IMAGE = "/first-page.png";
const IMAGE_ASPECT = 1670 / 1158;

/** Percent-of-page region on first-page.png (1158×1670, from 595×842 PDF). */
const REGION = {
  /** Grey metadata box — Verification Code row. */
  highlight: { top: 25.3, left: 3.5, width: 93, height: 1.35 },
  /** Point the lens zooms into — the "Verification Code:" text. */
  focus: { x: 21.5, y: 26.8 },
  lensSize: { width: 380, height: 47 },
  zoom: { bgScale: 3.7 }
} as const;

const CAPTION =
  "In the grey box below the title — the line labelled Verification Code (e.g. REP-SAMPLE0001).";

function HighlightBox() {
  const { highlight } = REGION;
  return (
    <div
      className="pointer-events-none absolute z-[5] rounded-sm border-2 border-btc-orange bg-btc-orange/15 shadow-[0_0_20px_rgba(184,176,200,0.55)]"
      style={{
        top: `${highlight.top}%`,
        left: `${highlight.left}%`,
        width: `${highlight.width}%`,
        height: `${highlight.height}%`
      }}
    />
  );
}

function LensCallout({ imageSrc }: { imageSrc: string }) {
  const { highlight, focus, lensSize, zoom } = REGION;
  const boxCenterX = highlight.left + highlight.width / 2;
  const halfW = lensSize.width / 2;
  const halfH = lensSize.height / 2;
  const scale = zoom.bgScale;

  const scaledW = scale * lensSize.width;
  const scaledH = scaledW * IMAGE_ASPECT;
  const marginLeft = halfW - (focus.x / 100) * scaledW;
  const marginTop = halfH - (focus.y / 100) * scaledH;

  const anchorY = highlight.top + highlight.height + 0.35;

  return (
    <div
      className="absolute z-10 flex -translate-x-1/2 flex-col items-center transition-all duration-500 ease-out"
      style={{ top: `${anchorY}%`, left: `${boxCenterX}%` }}
    >
      <div className="mb-1 h-0 w-0 border-x-[7px] border-b-[8px] border-x-transparent border-b-btc-orange" />

      <div
        className="overflow-hidden rounded-lg border-[3px] border-btc-orange bg-white shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-4 ring-btc-orange/25"
        style={{ width: lensSize.width, height: lensSize.height }}
        role="img"
        aria-label={CAPTION}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          className="max-w-none"
          style={{
            width: scaledW,
            height: "auto",
            marginLeft,
            marginTop
          }}
        />
      </div>

      <span className="mt-1 inline-flex items-center rounded bg-btc-orange px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
        Find your code here
      </span>
    </div>
  );
}

type VerificationGuideProps = {
  imageSrc?: string;
};

export function VerificationGuide({ imageSrc = REPORT_IMAGE }: VerificationGuideProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">On your report</p>
        <h3 className="mt-2 font-space text-lg font-bold text-white">Where to find your verification code</h3>
        <p className="mt-4 rounded-lg border border-btc-orange/30 bg-btc-orange/5 px-4 py-3 text-sm text-stardust">
          <span className="font-mono text-xs text-btc-orange">Top of page 1</span>
          <br />
          Verification Code in the grey box under “Financial Passport Report”.
        </p>
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
        Page 1 of your financial passport — look in the grey box near the top.
      </p>

      <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-white p-3 shadow-[0_0_40px_-12px_rgba(184,176,200,0.35)] sm:p-4">
        <div className="relative w-full overflow-hidden rounded-lg">
          <div className="relative aspect-[1158/1670] w-full">
            <Image
              src={imageSrc}
              alt="Onfra financial passport report — page 1"
              fill
              sizes="(max-width: 650px) 100vw, 650px"
              priority
              className="object-contain"
              onError={() => setImageError(true)}
            />

            <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />

            <HighlightBox />

            <LensCallout imageSrc={imageSrc} />
          </div>
        </div>

        <p className="mt-3 text-center text-sm font-medium text-stardust">{CAPTION}</p>
      </div>
    </div>
  );
}
