"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function DocsCode({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group docs-code-wrap my-4">
      <pre className="docs-code bg-canvas-card border border-white/10 rounded-xl p-4 pt-4 pb-4 overflow-x-auto text-[13px] text-stardust leading-relaxed">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded border border-white/5 bg-void-surface hover:bg-white/10 text-ink-muted hover:text-white transition opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm flex items-center gap-1.5 text-[11px] font-medium"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <Check size={12} className="text-btc-orange" /> Copied
          </>
        ) : (
          <>
            <Copy size={12} /> Copy
          </>
        )}
      </button>
    </div>
  );
}
