"use client";

import { useState, useRef, useEffect } from "react";
import { Code, Terminal, Copy, FileText, ChevronDown, Check } from "lucide-react";
import { API_URL } from "@/lib/links";
import { usePathname } from "next/navigation";

export function DocsAssistantDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);
  const [copiedCursor, setCopiedCursor] = useState(false);
  const [copiedVsCode, setCopiedVsCode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  // Strip /docs from pathname to get the raw page name, default to index
  const pageId = pathname?.replace(/^\/docs\/?/, "") || "index";
  const rawUrl = `${API_URL}/api/docs/raw?page=${pageId || "index"}`;

  const mcpUrl = `${API_URL}/api/docs-mcp`;

  const cursorConfig = `{
  "mcpServers": {
    "onfra-docs": {
      "url": "${mcpUrl}"
    }
  }
}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleCopyPage = async () => {
    try {
      const res = await fetch(rawUrl);
      const text = await res.text();
      handleCopy(text, setCopiedPage);
    } catch (err) {
      console.error("Failed to fetch markdown", err);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-ink transition border border-white/10"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Copy size={14} className="text-nude-soft" />
        Copy page
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-[220px] rounded-xl border border-white/10 bg-canvas-card shadow-xl overflow-hidden z-50 p-1 flex flex-col gap-0.5"
          role="menu"
        >
          <button
            onClick={handleCopyPage}
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-white/5 transition text-left"
          >
            {copiedPage ? <Check size={16} className="text-btc-orange" /> : <Copy size={16} />}
            <span className="font-medium">Copy page</span>
          </button>

          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-white/5 transition"
          >
            <FileText size={16} />
            <span className="font-medium">View as Markdown</span>
          </a>

          <div className="my-1 border-t border-white/10" />

          <button
            onClick={() => handleCopy(mcpUrl, setCopiedUrl)}
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-white/5 transition text-left"
          >
            {copiedUrl ? <Check size={16} className="text-btc-orange" /> : <Terminal size={16} />}
            <span className="font-medium">Copy MCP Server</span>
          </button>
        </div>
      )}
    </div>
  );
}
