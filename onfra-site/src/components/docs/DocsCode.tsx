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
      <pre className="docs-code bg-[var(--lav-tint)] border border-[var(--lav-border)] rounded-xl p-4 pt-4 pb-4 overflow-x-auto text-[13px] text-[var(--ink-soft)] leading-relaxed">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded border border-[var(--lav-border)] bg-white hover:bg-[var(--lav-chip)] text-[var(--ink-body)] hover:text-[var(--ink)] transition opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm flex items-center gap-1.5 text-[11px] font-medium"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <Check size={12} className="text-[var(--brand)]" /> Copied
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