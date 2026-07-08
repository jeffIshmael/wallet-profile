import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsTable
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL, LINKS } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "erc-8004", title: "ERC-8004" },
  { id: "mcp", title: "MCP manifest" },
  { id: "tools", title: "MCP tools" },
  { id: "manifests", title: "Discovery manifests" }
];

const TOOLS = [
  { name: "analyze_wallet", route: "POST /api/agent/analyze", desc: "Full financial analysis" },
  { name: "get_wallet_signal", route: "GET /api/wallet/{address}/signals/{signal}", desc: "Cached signal read" },
  { name: "screen_wallet", route: "POST /api/lender/screen", desc: "Lender underwriting screen" },
  { name: "chat_query", route: "POST /api/agent/chat", desc: "Natural-language queries" },
  { name: "generate_report", route: "POST /api/agent/report", desc: "Verified REP passport" },
  { name: "verify_report", route: "GET /api/agent/verify/{id}", desc: "Verify REP-{id}" }
] as const;

export default function AgentsDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Agents" title="MCP & ERC-8004" />
      <h1 className="docs-title">MCP &amp; ERC-8004</h1>
      <p className="docs-lead">
        OnFRA is registered as ERC-8004 agent #9219 on Celo. Agents discover tools via MCP and invoke
        them over REST with x402 payments.
      </p>

      <div className="docs-prose">
        <DocsH2 id="erc-8004">ERC-8004</DocsH2>
        <p>
          OnFRA is an onchain-identified agent on Celo mainnet. View the public registration:
        </p>
        <p>
          <a href={LINKS.agent8004} target="_blank" rel="noopener noreferrer">
            8004scan.io/agents/celo/9219
          </a>
        </p>

        <DocsH2 id="mcp">MCP manifest</DocsH2>
        <p>Point your MCP client at:</p>
        <DocsCode>{`${API_URL}/.well-known/mcp.json`}</DocsCode>
        <p>
          The manifest includes tool definitions, input schemas, x402 auth config, and REST route
          mappings. Install the skill for agent-specific guidance:{" "}
          <Link href="/docs/install">Install skill</Link>.
        </p>

        <DocsH2 id="tools">MCP tools</DocsH2>
        <DocsTable>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Route</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map((tool) => (
              <tr key={tool.name}>
                <td>
                  <code>{tool.name}</code>
                </td>
                <td>
                  <code>{tool.route}</code>
                </td>
                <td>{tool.desc}</td>
              </tr>
            ))}
          </tbody>
        </DocsTable>

        <DocsH2 id="manifests">Discovery manifests</DocsH2>
        <DocsH3 id="agent-json">Agent URI</DocsH3>
        <DocsCode>{`${API_URL}/.well-known/agent.json`}</DocsCode>
        <DocsH3 id="agent-card">A2A agent card</DocsH3>
        <DocsCode>{`${API_URL}/.well-known/agent-card.json`}</DocsCode>

        <div className="docs-next-links">
          <Link href="/docs/install" className="docs-next-card">
            <span className="docs-next-label">Setup</span>
            <span className="docs-next-title">Install skill →</span>
          </Link>
          <Link href="/docs/schemas" className="docs-next-card">
            <span className="docs-next-label">Reference</span>
            <span className="docs-next-title">JSON schemas →</span>
          </Link>
        </div>
      </div>
    </DocsShell>
  );
}
