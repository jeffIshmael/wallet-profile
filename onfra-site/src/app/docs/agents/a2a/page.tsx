import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsAssistantDropdown,
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL, LINKS } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "peer", title: "OnFRA as a peer agent" },
  { id: "skills", title: "Skills" },
  { id: "erc-8004", title: "ERC-8004" }
];

const SKILLS = [
  { name: "analyze_wallet", title: "Full Financial Analysis", allowed: "analyze_wallet" },
  { name: "screen_wallet", title: "Lender Screening", allowed: "screen_wallet" },
  { name: "chat_query", title: "Natural Language Queries", allowed: "chat_query" },
  { name: "get_wallet_signal", title: "Signal Reads", allowed: "get_wallet_signal" },
  { name: "generate_report", title: "Verified Reports", allowed: "generate_report, verify_report" }
];

export default function A2ADocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Agents" title="A2A" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="docs-title !mb-0">OnFRA as a peer agent</h1>
        <DocsAssistantDropdown />
      </div>
      <p className="docs-lead">
        Other autonomous agents discover OnFRA via an Agent Card and delegate
        financial reputation checks and onchain reads over A2A JSON-RPC.
      </p>

      <div className="docs-prose">
        <DocsH2 id="peer">Peer Discovery</DocsH2>
        <p>
          OnFRA exposes a read-only A2A server. Send structured tool invocations 
          to the JSON-RPC task server.
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2 mb-8 mt-6">
          <div className="rounded-xl border border-white/10 bg-canvas-card/50 p-5">
            <h3 className="text-sm font-semibold mb-2">Agent Card</h3>
            <p className="text-xs text-ink-muted mb-4">Machine-readable skills and JSON-RPC endpoint URL.</p>
            <DocsCode>{`${API_URL}/.well-known/agent-card.json`}</DocsCode>
          </div>
          <div className="rounded-xl border border-white/10 bg-canvas-card/50 p-5">
            <h3 className="text-sm font-semibold mb-2">JSON-RPC task server</h3>
            <p className="text-xs text-ink-muted mb-4">POST message/send with an OnFRA tool payload.</p>
            <DocsCode>{`${API_URL}/api/a2a`}</DocsCode>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-canvas-card/50 p-5 mb-10">
          <h3 className="text-sm font-semibold mb-2">Skill IDs (comma-separated)</h3>
          <p className="text-xs text-ink-muted mb-4">OnFRA A2A skills from the Agent Card.</p>
          <DocsCode>{SKILLS.map(s => s.name).join(", ")}</DocsCode>
        </div>

        <DocsH2 id="skills">Skills ({SKILLS.length})</DocsH2>
        <p className="mb-6">Each skill maps to a subset of hosted MCP tools. Peers discover these via the Agent Card.</p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {SKILLS.map((skill) => (
            <div key={skill.name} className="rounded-xl border border-white/10 bg-canvas-card/30 p-5 hover:border-white/20 transition">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-btc-orange font-mono text-[13px]">{skill.name}</span>
                <span className="text-sm font-medium">{skill.title}</span>
              </div>
              <p className="text-xs text-ink-muted">
                Allowed tools: <code className="text-[11px] text-ink bg-white/5 px-1 rounded">{skill.allowed}</code>
              </p>
            </div>
          ))}
        </div>

        <DocsH2 id="erc-8004">ERC-8004</DocsH2>
        <p>
          OnFRA is an onchain-identified agent on Celo mainnet. View the public registration:
        </p>
        <p>
          <a href={LINKS.agent8004} target="_blank" rel="noopener noreferrer">
            8004scan.io/agents/celo/9219
          </a>
        </p>

        <div className="docs-next-links mt-12">
          <Link href="/docs/schemas" className="docs-next-card">
            <span className="docs-next-label">Reference</span>
            <span className="docs-next-title">JSON schemas →</span>
          </Link>
          <Link href="/docs/install" className="docs-next-card">
            <span className="docs-next-label">Setup</span>
            <span className="docs-next-title">Install skill →</span>
          </Link>
        </div>
      </div>
    </DocsShell>
  );
}
