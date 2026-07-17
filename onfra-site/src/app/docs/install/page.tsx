import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsAssistantDropdown,
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "skills-cli", title: "Skills CLI" },
  { id: "mcp-discovery", title: "MCP discovery" },
  { id: "what-you-get", title: "What the skill teaches" }
];

export default function InstallDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Overview" title="Install skill" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="docs-title !mb-0">Install OnFRA for agents</h1>
        <DocsAssistantDropdown />
      </div>
      <p className="docs-lead">
        Add the OnFRA skill so AI agents know how to analyze wallets, handle x402 payments, and verify
        REP passports.
      </p>

      <div className="docs-prose">
        <DocsH2 id="skills-cli">Skills CLI</DocsH2>
        <p>Run from your project root:</p>
        <DocsCode>npx skills add jeffIshmael/onfra-skill</DocsCode>
        <p>
          Works with Cursor, Claude Code, Antigravity, and other agents that support the Skills CLI.
          The skill installs into your project&apos;s <code>.agents/skills/</code> directory.
        </p>

        <DocsH2 id="mcp-discovery">MCP discovery</DocsH2>
        <p>
          For tool-based discovery without installing files, point your MCP client at the live manifest:
        </p>
        <DocsCode>{`${API_URL}/.well-known/mcp.json`}</DocsCode>
        <p>
          See <Link href="/docs/agents">MCP &amp; ERC-8004</Link> for tool names, input schemas, and
          routing.
        </p>

        <DocsH2 id="what-you-get">What the skill teaches</DocsH2>
        <ul>
          <li>
            <code>POST /api/agent/analyze</code> — full wallet reputation analysis
          </li>
          <li>
            <code>GET /api/wallet/{"{address}"}/signals/{"{signal}"}</code> — free cached signal reads
          </li>
          <li>
            <code>POST /api/lender/screen</code> — lender underwriting screen
          </li>
          <li>
            <code>GET /api/agent/verify/{"{reportId}"}</code> — verify REP passports
          </li>
          <li>x402 <code>X-PAYMENT</code> header handling for external wallet queries</li>
        </ul>

        <DocsH3 id="github-source">Source</DocsH3>
        <p>
          <a href="https://github.com/jeffIshmael/onfra-skill" target="_blank" rel="noopener noreferrer">
            github.com/jeffIshmael/onfra-skill
          </a>
        </p>

        <div className="docs-next-links">
          <Link href="/docs/rest-api" className="docs-next-card">
            <span className="docs-next-label">Next</span>
            <span className="docs-next-title">REST API →</span>
          </Link>
          <Link href="/docs/agents" className="docs-next-card">
            <span className="docs-next-label">Agents</span>
            <span className="docs-next-title">MCP &amp; ERC-8004 →</span>
          </Link>
        </div>
      </div>
    </DocsShell>
  );
}
