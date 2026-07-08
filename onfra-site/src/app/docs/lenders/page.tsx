import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "why", title: "Why lenders use OnFRA" },
  { id: "flow", title: "Integration flow" },
  { id: "screen", title: "Screen endpoint" },
  { id: "response", title: "Response fields" },
  { id: "passport", title: "REP passport" }
];

export default function LendersDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Integrate" title="Lender screening" />
      <h1 className="docs-title">Lender screening</h1>
      <p className="docs-lead">
        Screen borrower wallets before extending credit. One API call returns an underwriting
        data package you can use to evaluate trustworthiness, reputation, average monthly income,
        and loan capacity.
      </p>

      <div className="docs-prose">
        <DocsH2 id="why">Why lenders use OnFRA</DocsH2>
        <p>
          On Celo, underwriting often relies on collateral and balances. What&apos;s missing for MiniPay
          earners and stablecoin freelancers is <strong>proof of income</strong> from onchain activity.
          OnFRA fills that gap with:
        </p>
        <ul>
          <li>Recurring stablecoin inflow patterns and weekly consistency</li>
          <li>Wallet reputation score (0–100) from maturity and behavior</li>
          <li>Loan capacity range with confidence level</li>
          <li>Trustworthiness flag derived from onchain financial signals</li>
        </ul>

        <DocsH2 id="flow">Integration flow</DocsH2>
        <ol>
          <li>Borrower provides wallet address (and optionally a REP passport ID)</li>
          <li>Your backend calls <code>POST /api/lender/screen</code> with x402 payment</li>
          <li>Use <code>trust.isTrustworthy</code>, reputation, income, and lending capacity to apply your rules</li>
          <li>Optionally verify REP passport via <code>GET /api/agent/verify/{"{id}"}</code></li>
        </ol>

        <DocsH2 id="screen">Screen endpoint</DocsH2>
        <DocsCode>{`curl -X POST ${API_URL}/api/lender/screen \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{
    "walletAddress": "0xBorrowerWallet...",
    "callerAddress": "0xYourLenderWallet..."
  }'`}</DocsCode>
        <div className="docs-callout">
          <strong>callerAddress</strong> is required — the lender wallet that pays 0.01 USDT via x402
          on Celo mainnet.
        </div>

        <DocsH2 id="response">Response fields</DocsH2>
        <ul>
          <li>
            <strong>trust.isTrustworthy</strong> — boolean trustworthiness flag
          </li>
          <li>
            <strong>income</strong> — monthly estimate, stability label, weekly consistency
          </li>
          <li>
            <strong>lending</strong> — min/max USD capacity, confidence, and risk category
          </li>
          <li>
            <strong>scores</strong> — financial health and wallet reputation scores
          </li>
        </ul>
        <p>
          Schema:{" "}
          <a href={`${API_URL}/schemas/lenderScreenResult.schema.json`} target="_blank" rel="noopener noreferrer">
            lenderScreenResult.schema.json
          </a>
        </p>

        <DocsH2 id="passport">REP passport</DocsH2>
        <DocsH3 id="verify-passport">Verify onchain</DocsH3>
        <p>
          Borrowers can purchase a verified financial passport (<code>REP-{"{id}"}</code>) for 0.10 USDT.
          Verify it in your flow:
        </p>
        <DocsCode>{`curl ${API_URL}/api/agent/verify/REP-X141GYYEUM`}</DocsCode>

        <div className="docs-next-links">
          <Link href="/docs/x402" className="docs-next-card">
            <span className="docs-next-label">Payments</span>
            <span className="docs-next-title">x402 payments →</span>
          </Link>
          <Link href="/docs/signals" className="docs-next-card">
            <span className="docs-next-label">Signals</span>
            <span className="docs-next-title">Signal endpoints →</span>
          </Link>
        </div>
      </div>
    </DocsShell>
  );
}
