"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText, ZoomIn } from "lucide-react";

type FocusRegion = {
  /** background-position X (%) */
  bgX: number;
  /** background-position Y (%) */
  bgY: number;
  /** Zoom multiplier applied to background-size width */
  scale: number;
};

const TOP_CODE_FOCUS: FocusRegion = { bgX: 50, bgY: 21, scale: 3.2 };
const BOTTOM_CODE_FOCUS: FocusRegion = { bgX: 50, bgY: 95, scale: 4.5 };

/** Highlight rectangles on the full-page preview (percent of image). */
const TOP_HIGHLIGHT = { top: 17.5, left: 4.5, width: 91, height: 7.5 };
const BOTTOM_HIGHLIGHT = { top: 91.5, left: 3, width: 94, height: 5.5 };

function VerificationCodeZoom({
  focus,
  label,
  caption
}: {
  focus: FocusRegion;
  label: string;
  caption: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <ZoomIn size={14} className="text-btc-orange" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">{label}</p>
      </div>
      <div
        className="relative h-36 overflow-hidden rounded-xl border-2 border-btc-orange bg-void-surface shadow-[0_0_28px_-10px_rgba(247,147,26,0.5)] ring-4 ring-btc-orange/15 md:h-40"
        role="img"
        aria-label={caption}
        style={{
          backgroundImage: "url(/first-page.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: `${focus.scale * 100}% auto`,
          backgroundPosition: `${focus.bgX}% ${focus.bgY}%`
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-btc-orange/5 via-transparent to-btc-orange/5" />
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-md border border-btc-orange/60 bg-black/70 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-btc-orange">
          Verification code
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-stardust">{caption}</p>
    </div>
  );
}

function FullPagePreview({ onImageError }: { onImageError?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white">
      <Image
        src="/first-page.png"
        alt="First page of a Wallet Analyst financial passport report"
        width={595}
        height={842}
        className="h-auto w-full"
        onError={onImageError}
        priority
      />
      {[TOP_HIGHLIGHT, BOTTOM_HIGHLIGHT].map((box, index) => (
        <div
          key={index}
          className="pointer-events-none absolute rounded-sm border-2 border-btc-orange bg-btc-orange/10 shadow-[0_0_16px_rgba(247,147,26,0.45)]"
          style={{
            top: `${box.top}%`,
            left: `${box.left}%`,
            width: `${box.width}%`,
            height: `${box.height}%`
          }}
        />
      ))}
    </div>
  );
}

function FallbackPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-void-surface p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="font-dancing text-lg text-btc-orange">Wallet Analyst</p>
        <span className="rounded-full border border-btc-gold/40 bg-btc-gold/10 px-2 py-0.5 font-mono text-[9px] text-btc-gold">
          Verified
        </span>
      </div>
      <div className="mt-4 rounded-xl border-2 border-btc-orange bg-btc-orange/10 px-4 py-3 ring-4 ring-btc-orange/20">
        <p className="font-mono text-[9px] uppercase tracking-widest text-btc-orange">Top of page</p>
        <p className="mt-1 font-mono text-sm text-white">Verification Code: REP-XXXXXXXXXX</p>
      </div>
      <div className="mt-4 rounded-xl border-2 border-btc-orange bg-btc-orange/10 px-4 py-3 ring-4 ring-btc-orange/20">
        <p className="font-mono text-[9px] uppercase tracking-widest text-btc-orange">Bottom footer</p>
        <p className="mt-1 font-mono text-xs text-white">Verification Code: REP-XXXXXXXXXX · walletanalyst.xyz/verify</p>
      </div>
    </div>
  );
}

export function ReportCodeGuide() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">On your report</p>
      <h3 className="mt-2 font-space text-xl font-bold text-white md:text-2xl">Where to find your verification code</h3>
      <p className="mt-3 text-sm leading-6 text-stardust">
        Open page 1 of your Wallet Analyst financial passport. The verification code appears twice — in the
        metadata box under the title, and again in the footer at the bottom of the page.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-btc-orange/30 bg-black/50 shadow-[0_0_40px_-12px_rgba(247,147,26,0.25)]">
        <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-btc-orange" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-btc-orange" />

        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-btc-orange" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Report preview</p>
          </div>
        </div>

        <div className="relative space-y-5 p-4 md:p-5">
          {!imageError ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <VerificationCodeZoom
                  focus={TOP_CODE_FOCUS}
                  label="1 · Top of page"
                  caption="In the grey box below “Financial Passport Report”, on the line labelled Verification Code."
                />
                <VerificationCodeZoom
                  focus={BOTTOM_CODE_FOCUS}
                  label="2 · Bottom of page"
                  caption="In the small footer text at the very bottom — starts with “Verification Code:”."
                />
              </div>

              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-stardust/80">
                  Full first page
                </p>
                <FullPagePreview onImageError={() => setImageError(true)} />
              </div>
            </>
          ) : (
            <FallbackPreview />
          )}
        </div>
      </div>
    </div>
  );
}
