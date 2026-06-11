"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "right" | "bottom" | "left";

const sideTransforms: Record<TooltipSide, string> = {
  top: "-translate-x-1/2 -translate-y-full",
  right: "-translate-y-1/2",
  bottom: "-translate-x-1/2",
  left: "-translate-x-full -translate-y-1/2"
};

function getCoords(rect: DOMRect, side: TooltipSide, gap = 8) {
  switch (side) {
    case "top":
      return { top: rect.top - gap, left: rect.left + rect.width / 2 };
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.right + gap };
    case "bottom":
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2 };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - gap };
  }
}

export function Tooltip({
  label,
  children,
  side = "top"
}: {
  label: string;
  children: ReactNode;
  side?: TooltipSide;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setCoords(getCoords(el.getBoundingClientRect(), side));
  }, [side]);

  const show = useCallback(() => {
    updatePosition();
    setVisible(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={hide}
      >
        {children}
      </span>
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            className={`pointer-events-none fixed z-[200] whitespace-nowrap rounded-md border border-white/10 bg-void-surface px-2 py-1 text-xs font-semibold text-white shadow-lg ${sideTransforms[side]}`}
            style={{ top: coords.top, left: coords.left }}
          >
            {label}
          </span>,
          document.body
        )}
    </>
  );
}
