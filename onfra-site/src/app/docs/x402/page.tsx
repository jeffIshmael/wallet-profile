import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsTable,
  DocsAssistantDropdown,
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "overview", title: "Overview" },
  { id: "header", title: "X-PAYMENT header" },
  { id: "pricing", title: "Pricing" },
  { id: "own-wallet", title: "Own wallet queries" }
];

export default function X402DocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Integrate" title="x402 payments" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="docs-title !mb-0">x402 payments</h1>
        <DocsAssistantDropdown />
      </div>
      <p className="docs-lead">
        Paid OnFRA endpoints settle in USDT on Celo mainnet via the x402 payment protocol. No API keys
        or subscriptions — pay per query from your wallet.
      </p>

      <div className="docs-prose">
        <DocsH2 id="overview">Overview</DocsH2>
        <p>
          x402 lets clients attach a payment signature to HTTP requests. OnFRA verifies the signature
          and settles USDT before running paid analysis. This aligns with agent-native micropayments on
          Celo.
        </p>

        <DocsH2 id="header">X-PAYMENT header</DocsH2>
        <p>Include the payment signature in the request header:</p>
        <DocsCode>{`X-PAYMENT: <x402-signature>

# Aliases also accepted:
# PAYMENT-SIGNATURE
# x-payment`}</DocsCode>
        <p>
          Obtain a signature from your x402-compatible wallet or payment client before calling paid
          routes like <code>/api/lender/screen</code> or external <code>/api/agent/analyze</code>.
        </p>

        <DocsH2 id="pricing">Pricing</DocsH2>
        <DocsTable>
          <thead>
            <tr>
              <th>Action</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Lender screen</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>External wallet analyze / chat</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>Verified REP report</td>
              <td>0.10 USDT</td>
            </tr>
            <tr>
              <td>Generate statement</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>Cached signal reads</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>Verify REP passport</td>
              <td>Free</td>
            </tr>
          </tbody>
        </DocsTable>
        <p>
          Settlement currency: USDT on Celo (chain ID 42220). See{" "}
          <Link href="/pricing">pricing page</Link> for the full breakdown.
        </p>

        <DocsH2 id="app-vs-api">App vs API Queries</DocsH2>
        <p>
          When using the OnFRA web application dashboard, querying your own connected wallet is <strong>free</strong>. 
          However, <strong>all</strong> queries made through the Agent API (including analyze, chat, and statements) 
          require x402 payment of 0.01 USDT, regardless of whether you are querying your own wallet or an external one.
        </p>
        <div className="docs-callout">
          <strong>Lender screen</strong> always requires payment from <code>callerAddress</code> (the
          lender wallet), even if screening your own address.
        </div>

        <div className="docs-next-links">
          <Link href="/docs/lenders" className="docs-next-card">
            <span className="docs-next-label">Lenders</span>
            <span className="docs-next-title">Lender screening →</span>
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
