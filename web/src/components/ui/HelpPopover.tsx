"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type HelpPopoverProps = {
  title: string;
  meaning: string;
  calculation: string;
  lenderRelevance: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
};

export function HelpPopover({
  title,
  meaning,
  calculation,
  lenderRelevance,
  anchorRef,
  open,
  onClose
}: HelpPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    function updatePosition() {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const popoverWidth = 288;
      const gap = 10;
      const viewportPadding = 12;

      let left = rect.right + gap;
      if (left + popoverWidth > window.innerWidth - viewportPadding) {
        left = rect.left - popoverWidth - gap;
      }
      if (left < viewportPadding) {
        left = viewportPadding;
      }

      let top = rect.top;
      const estimatedHeight = 260;
      if (top + estimatedHeight > window.innerHeight - viewportPadding) {
        top = window.innerHeight - estimatedHeight - viewportPadding;
      }
      top = Math.max(viewportPadding, top);

      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Help: ${title}`}
      className="help-popover fixed z-[100] w-72 rounded-xl border border-white/10 bg-void-surface p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
      style={{ top: position.top, left: position.left }}
    >
      <p className="help-popover-title font-sora text-sm font-bold">{title}</p>
      <div className="help-popover-body mt-3 space-y-3 text-[11px] leading-5">
        <div>
          <p className="help-popover-label font-semibold uppercase tracking-wide">What it means</p>
          <p className="help-popover-text mt-0.5">{meaning}</p>
        </div>
        <div>
          <p className="help-popover-label font-semibold uppercase tracking-wide">How it is calculated</p>
          <p className="help-popover-text mt-0.5">{calculation}</p>
        </div>
        <div>
          <p className="help-popover-label font-semibold uppercase tracking-wide">Why lenders care</p>
          <p className="help-popover-text mt-0.5">{lenderRelevance}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
