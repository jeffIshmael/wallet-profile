"use client";

import { CircleHelp } from "lucide-react";
import { useRef, useState } from "react";
import { HelpPopover } from "@/components/ui/HelpPopover";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  compact?: boolean;
  help: {
    meaning: string;
    calculation: string;
    lenderRelevance: string;
  };
};

export function SectionHeader({ title, subtitle, compact = false, help }: SectionHeaderProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className={compact ? "truncate font-sora text-sm font-bold text-white" : "font-sora text-base font-bold text-white"}>
            {title}
          </h2>
          {subtitle && (
            <p className={compact ? "mt-0.5 truncate text-[11px] text-stardust" : "mt-0.5 text-xs text-stardust"}>
              {subtitle}
            </p>
          )}
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 text-stardust transition hover:border-btc-orange/40 hover:text-btc-orange"
          aria-label={`Help: ${title}`}
          aria-expanded={open}
        >
          <CircleHelp size={13} />
        </button>
      </div>
      <HelpPopover
        title={title}
        meaning={help.meaning}
        calculation={help.calculation}
        lenderRelevance={help.lenderRelevance}
        anchorRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
