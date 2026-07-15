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
  { id: "what-is-onfra", title: "What is OnFRA?" },
  { id: "who-its-for", title: "Who it's for" },
  { id: "quick-start", title: "Quick start" },
  { id: "base-url", title: "Base URL" },
  { id: "supported-chains", title: "Supported chains" }
];

export default function GettingStartedPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Overview" title="Getting started" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="docs-title !mb-0">Integrating OnFRA</h1>
        <DocsAssistantDropdown />
      </div>
      <p className="docs-lead">
        OnFRA turns Celo wallet activity into financial reputation — income estimates, health scores,
        loan capacity, and verified REP passports. Use the REST API, MCP tools, or agent skill.
      </p>

      <div className="docs-prose">
        <DocsH2 id="what-is-onfra">What is OnFRA?</DocsH2>
        <p>
          OnFRA (Onchain Financial Reputation Agent) is infrastructure for reading a wallet&apos;s public
          onchain history and returning lender-friendly signals. One address in; structured reputation
          data out — no bank statements, no manual PDF review.
        </p>
        <p>Core outputs include:</p>
        <ul>
          <li>
            <strong>Monthly income estimate</strong> from stablecoin inflows and weekly patterns
          </li>
          <li>
            <strong>Financial health score</strong> (0–100) across income, savings, spending, and risk
          </li>
          <li>
            <strong>Reputation score</strong> and category for trust and maturity
          </li>
          <li>
            <strong>Loan capacity range</strong> with confidence level
          </li>
          <li>
            <strong>REP passport</strong> — verified report with onchain attestation
          </li>
        </ul>

        <DocsH2 id="who-its-for">Who it&apos;s for</DocsH2>
        <DocsH3 id="lenders">Lenders &amp; underwriters</DocsH3>
        <p>
          Call <code>POST /api/lender/screen</code> before extending credit. Use
          <code>trust.isTrustworthy</code>, reputation, average monthly income, and loan capacity
          range to apply your own underwriting rules.
        </p>
        <DocsH3 id="agents">AI agents &amp; automations</DocsH3>
        <p>
          Install the OnFRA skill or discover tools via MCP. Agents can analyze wallets, read cached
          signals, and verify REP passports.
        </p>
        <DocsH3 id="apps">Apps &amp; dashboards</DocsH3>
        <p>
          Embed reputation in your product with the REST API. Cache-first signal endpoints keep reads
          cheap after the first analysis.
        </p>

        <DocsH2 id="quick-start">Quick start</DocsH2>
        <ol>
          <li>
            <Link href="/docs/install">Install the skill</Link> for Cursor, Claude Code, or your agent
            runtime
          </li>
          <li>
            <Link href="/docs/rest-api">Pick an endpoint</Link> — <code>analyze</code> for full data,{" "}
            <code>screen</code> for lender decisions
          </li>
          <li>
            <Link href="/docs/x402">Add x402 payment</Link> when querying external wallets (0.01 USDT
            per refresh on Celo)
          </li>
          <li>
            <Link href="/docs/signals">Read cached signals</Link> for free after analysis
          </li>
        </ol>

        <DocsH2 id="base-url">Base URL</DocsH2>
        <DocsCode>{API_URL}</DocsCode>
        <p>
          JSON schemas live at <code>{API_URL}/schemas/</code>. MCP manifest at{" "}
          <code>{API_URL}/.well-known/mcp.json</code>.
        </p>

        <DocsH2 id="supported-chains">Supported chains</DocsH2>
        <p>
          <strong>Celo Mainnet</strong> is supported today. Additional EVM chains are planned. All
          endpoints are Celo-first; wallet addresses are standard 0x EVM format.
        </p>

        <div className="docs-next-links">
          <Link href="/docs/install" className="docs-next-card">
            <span className="docs-next-label">Next</span>
            <span className="docs-next-title">Install skill →</span>
          </Link>
          <Link href="/docs/rest-api" className="docs-next-card">
            <span className="docs-next-label">Reference</span>
            <span className="docs-next-title">REST API →</span>
          </Link>
        </div>
      </div>
    </DocsShell>
  );
}
