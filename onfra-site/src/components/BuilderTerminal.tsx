"use client";

import { useState } from "react";
import { LINKS } from "@/lib/links";

const NPX_INSTALL = "npx skills add github:jeffIshmael/onfra-skill";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="terminal-copy shrink-0"
      aria-label="Copy command"
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

export function BuilderTerminal() {
  return (
    <div className="builder-terminal mx-auto mt-10 max-w-3xl text-left">
      <div className="terminal-chrome">
        <div className="terminal-titlebar">
          <div className="terminal-dots" aria-hidden>
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
          </div>
          <p className="terminal-title">TERMINAL — ONFRA</p>
        </div>

        <div className="terminal-body font-mono text-[11px] leading-6 sm:text-xs sm:leading-7">
          <p className="terminal-login">
            <span className="terminal-login-dot" aria-hidden />
            Last login: Wed Jul 08 2026
          </p>

          <div className="terminal-step">
            <p className="terminal-comment"># Install the OnFRA skill</p>
            <div className="terminal-command-row">
              <code className="terminal-command">{NPX_INSTALL}</code>
              <CopyButton value={NPX_INSTALL} />
            </div>
            <div className="terminal-step-meta">
              <span className="terminal-step-desc">
                Works with Cursor, Claude Code, Antigravity + 39 more agents
              </span>
            </div>
          </div>
        </div>
      </div>

      <a
        href={LINKS.apiDocs}
        target="_blank"
        rel="noopener noreferrer"
        className="terminal-docs-link"
      >
        VIEW FULL DOCS →
      </a>
    </div>
  );
}
