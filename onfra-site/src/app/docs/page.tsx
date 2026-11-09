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
  { id: "capabilities", title: "What you can do" },
  { id: "who-its-for", title: "Who it's for" },
  { id: "quick-start", title: "Quick start" },
  { id: "base-url", title: "Base URL" },
  { id: "supported-chains", title: "Supported chains" },
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
        OnFRA is an AI onchain financial intelligence agent that
        turns blockchain activity into understandable insights, financial
        analysis, and structured data. Integrate its capabilities into your
        application or let your AI agent delegate financial research to OnFRA.
      </p>

      <div className="docs-prose">
        <DocsH2 id="what-is-onfra">What is OnFRA?</DocsH2>
        <p>
          OnFRA (Onchain Financial Intelligence) is an AI agent that
          researches and interprets public blockchain activity. It retrieves
          wallet data, analyzes transactions, understands financial flows,
          and turns raw onchain information into meaningful financial
          intelligence.
        </p>
        <p>
          Instead of building your own blockchain data pipelines and
          financial analysis tools, you can delegate that work to OnFRA
          through its APIs and agent integrations.
        </p>
        <p>
          A wallet address is enough to get started.
          OnFRA handles the underlying data retrieval, tool selection, and
          analysis.
        </p>

        <DocsH2 id="capabilities">What you can do with OnFRA</DocsH2>
        <ul>
          <li>
            <strong>Wallet analysis:</strong> Research a wallet's onchain
            activity, history, and financial behavior.
          </li>
          <li>
            <strong>Cash flow analysis:</strong> Understand incoming funds,
            outgoing funds, net flow, and activity across different periods.
          </li>
          <li>
            <strong>Transaction intelligence:</strong> Investigate
            transactions, including transfers, swaps, contract interactions,
            and failed transactions.
          </li>
          <li>
            <strong>Token balances:</strong> Retrieve and understand a
            wallet's token holdings and balances.
          </li>
          <li>
            <strong>Transaction statements:</strong> Retrieve and organize
            wallet transaction records into structured statements.
          </li>
          <li>
            <strong>Financial reports:</strong> Generate reports that
            summarize wallet activity and financial information.
          </li>
          <li>
            <strong>Conversational research:</strong> Ask questions about
            wallet activity and investigate results through follow-up queries.
          </li>
        </ul>

        <DocsH2 id="who-its-for">Who it's for</DocsH2>

        <DocsH3 id="individuals">Individuals and crypto earners</DocsH3>
        <p>
          Understand personal onchain financial activity, explore income
          patterns, track spending, and make sense of where funds come from
          and where they go.
        </p>

        <DocsH3 id="agents">AI agents and automations</DocsH3>
        <p>
          Delegate financial research to OnFRA instead of implementing
          blockchain analysis tools from scratch. Integrate through the
          available APIs, install the OnFRA skill, or discover its tools
          through MCP.
        </p>

        <DocsH3 id="apps">Applications and developers</DocsH3>
        <p>
          Integrate onchain financial intelligence into your application.
          Use the REST API to retrieve wallet analysis, cash flow summaries,
          transaction explanations, balances, and structured reports.
        </p>

        <DocsH3 id="organizations">Businesses and DAOs</DocsH3>
        <p>
          Research treasury activity, understand transaction flows, organize
          financial records, and generate reports for organizational
          financial operations.
        </p>

        <DocsH2 id="quick-start">Quick start</DocsH2>
        <p>
          There are several ways to access OnFRA, depending on how you intend
          to use its financial intelligence.
        </p>
        <ol>
          <li>
            <Link href="/docs/install">Install the OnFRA skill</Link> to
            give Cursor, Claude Code, or another supported agent runtime
            access to OnFRA's capabilities.
          </li>
          <li>
            <Link href="/docs/rest-api">Explore the REST API</Link> to
            integrate wallet analysis, cash flow, transaction intelligence,
            and reporting into your application.
          </li>
          <li>
            <Link href="/docs/x402">Configure x402 payments</Link> to enable
            paid data retrieval and external services where required.
          </li>
          <li>
            <Link href="/docs/signals">Explore cached signals</Link> to
            retrieve previously generated analysis results without
            repeating the underlying analysis.
          </li>
        </ol>

        <DocsH2 id="base-url">Base URL</DocsH2>
        <DocsCode>{API_URL}</DocsCode>
        <p>
          JSON schemas are available at <code>{API_URL}/schemas/</code>.
          The MCP manifest is available at{" "}
          <code>{API_URL}/.well-known/mcp.json</code>.
        </p>
        <p>
          All API requests should use the base URL above. Refer to the
          individual endpoint documentation for request parameters,
          authentication, and response formats.
        </p>

        <DocsH2 id="supported-chains">Supported chains</DocsH2>
        <p>
          <strong>Celo Mainnet</strong> is currently supported. Additional
          EVM networks are planned as OnFRA expands its blockchain data
          infrastructure.
        </p>
        <p>
          Wallet addresses use the standard <code>0x</code> EVM address
          format. Chain support is determined by the individual endpoint
          and its underlying data sources.
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