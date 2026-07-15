import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsTable,
  DocsAssistantDropdown,
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "overview", title: "Overview" },
  { id: "local", title: "Local stdio (Recommended)" },
  { id: "mcp", title: "Remote MCP manifest" },
  { id: "tools", title: "MCP tools" }
];

const TOOLS = [
  { name: "analyze_wallet", route: "POST /api/agent/analyze", desc: "Full financial analysis" },
  { name: "get_wallet_signal", route: "GET /api/wallet/{address}/signals/{signal}", desc: "Cached signal read" },
  { name: "screen_wallet", route: "POST /api/lender/screen", desc: "Lender underwriting screen" },
  { name: "chat_query", route: "POST /api/agent/chat", desc: "Natural-language queries" },
  { name: "generate_report", route: "POST /api/agent/report", desc: "Verified REP passport" },
  { name: "generate_statement", route: "POST /api/agent/statement", desc: "Generate transaction statement PDF" },
  { name: "verify_report", route: "GET /api/agent/verify/{id}", desc: "Verify REP-{id}" }
] as const;

export default function AgentsDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Agents" title="MCP" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="docs-title !mb-0">Model Context Protocol (MCP)</h1>
        <DocsAssistantDropdown />
      </div>
      <p className="docs-lead">
        Agents discover OnFRA tools via MCP and invoke them over REST with x402 payments. 
        You can run the OnFRA MCP server locally or point your client to our remote manifest.
      </p>

      <div className="docs-prose">
        <DocsH2 id="local">Local stdio (Recommended)</DocsH2>
        <p>
          Run it locally with Node. Your client spawns <code>npx</code> and talks to OnFRA over stdio. 
          Works in any stdio client (Cursor, Claude Desktop, LM Studio, Continue, MCP Inspector). Requires Node.js.
        </p>
        
        <ol className="list-decimal pl-5 space-y-2 mb-4 text-sm text-stardust">
          <li>Run <code>npx -y @jeffishmael/onfra-skill</code> to test it.</li>
          <li>Open your MCP config (e.g., <code>claude_desktop_config.json</code> or Cursor <em>Settings → MCP</em>).</li>
          <li>Merge the snippet below into <code>mcpServers</code>.</li>
          <li>Restart the client.</li>
        </ol>

        <DocsCode>{`{
  "mcpServers": {
    "onfra-skill": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@jeffishmael/onfra-skill"],
      "env": {
        "CELO_PRIVATE_KEY": "0x..."
      }
    }
  }
}`}</DocsCode>

        <p className="mt-4 text-sm">
          Keep <code>CELO_PRIVATE_KEY</code> out of source control — it stays securely on your machine to sign x402 payments.
        </p>

        <DocsH2 id="mcp">Remote hosted</DocsH2>
        <p className="font-medium">Skip the install — point at the hosted endpoint</p>
        <p className="mt-2 text-sm text-stardust">
          No Node, no keys. The hosted endpoint exposes all OnFRA tools for financial analysis, lender screening, and verified reports.
        </p>

        <div className="mt-6 mb-8 rounded-xl border border-white/10 bg-canvas-card/50 p-5">
          <h3 className="text-sm font-semibold mb-2">Endpoint</h3>
          <DocsCode>{`${API_URL}/api/mcp`}</DocsCode>
        </div>

        <h3 className="mt-8 text-base font-semibold">Streamable HTTP clients</h3>
        <p className="mt-2 text-sm text-stardust">
          For clients that support remote MCP URLs directly (Cursor, Claude, etc.):
        </p>
        <DocsCode>{`{
  "mcpServers": {
    "onfra-mcp": {
      "url": "${API_URL}/api/mcp"
    }
  }
}`}</DocsCode>

        <h3 className="mt-8 text-base font-semibold">Stdio-only clients (mcp-remote bridge)</h3>
        <p className="mt-2 text-sm text-stardust">
          If your client only supports stdio, use <code>mcp-remote</code> to bridge to the hosted endpoint:
        </p>
        <DocsCode>{`{
  "mcpServers": {
    "onfra-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-remote", "${API_URL}/api/mcp"]
    }
  }
}`}</DocsCode>

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

        <div className="docs-next-links">
          <Link href="/docs/agents/a2a" className="docs-next-card">
            <span className="docs-next-label">A2A</span>
            <span className="docs-next-title">Agent-to-Agent →</span>
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
