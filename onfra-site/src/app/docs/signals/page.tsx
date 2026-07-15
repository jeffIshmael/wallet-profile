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
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "cache-model", title: "Cache model" },
  { id: "signal-ids", title: "Signal IDs" },
  { id: "read-signal", title: "Read one signal" },
  { id: "fields-param", title: "fields parameter" }
];

export default function SignalsDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Integrate" title="Signal endpoints" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="docs-title !mb-0">Signal endpoints</h1>
        <DocsAssistantDropdown />
      </div>
      <p className="docs-lead">
        After a wallet is analyzed, you can read individual reputation fields from the cache. Every API query, 
        including fetching cached signals, requires an x402 payment of 0.01 USDT.
      </p>

      <div className="docs-prose">
        <DocsH2 id="cache-model">Cache model</DocsH2>
        <p>
          <code>POST /api/agent/analyze</code> runs the full analysis pipeline and writes to cache.
          Subsequent GET requests return cached slices until the TTL expires. Missing cache returns{" "}
          <code>404</code> with a hint to call <code>analyze</code> first.
        </p>
        <DocsCode>{`curl -H "X-PAYMENT: <x402-signature>" ${API_URL}/api/wallet/0xYourWallet.../signals`}</DocsCode>
        <p>Lists available signal IDs and whether valid cache exists for the wallet. Costs 0.01 USDT.</p>

        <DocsH2 id="signal-ids">Signal IDs</DocsH2>
        <DocsTable>
          <thead>
            <tr>
              <th>Signal</th>
              <th>Returns</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>monthly-income</code>
              </td>
              <td>Income label, monthly estimate, weekly consistency, income by period</td>
            </tr>
            <tr>
              <td>
                <code>financial-health</code>
              </td>
              <td>Health score (0–100) and breakdown</td>
            </tr>
            <tr>
              <td>
                <code>reputation-score</code>
              </td>
              <td>Reputation score, category, rationale</td>
            </tr>
            <tr>
              <td>
                <code>loan-capacity</code>
              </td>
              <td>Min/max USD range, confidence, factors</td>
            </tr>
            <tr>
              <td>
                <code>statement</code>
              </td>
              <td>3-month inflow/outflow, net, monthly breakdown</td>
            </tr>
            <tr>
              <td>
                <code>assessment</code>
              </td>
              <td>AI narrative, strengths, watch items, attestation</td>
            </tr>
          </tbody>
        </DocsTable>

        <DocsH2 id="read-signal">Read one signal</DocsH2>
        <DocsCode>{`curl -H "X-PAYMENT: <x402-signature>" ${API_URL}/api/wallet/0xYourWallet.../signals/loan-capacity`}</DocsCode>
        <p>Response shape:</p>
        <DocsCode>{`{
  "signal": "loan-capacity",
  "walletAddress": "0x...",
  "cached": true,
  "fetchedAt": "2026-07-08T...",
  "expiresAt": "2026-07-09T...",
  "data": { "range": "...", "minLoanUsd": 0, "maxLoanUsd": 0, ... }
}`}</DocsCode>

        <DocsH2 id="fields-param">fields parameter</DocsH2>
        <p>
          On <code>POST /api/agent/analyze</code>, pass <code>fields</code> in the body or query string
          to return a subset without full <code>walletData</code>:
        </p>
        <DocsCode>{`curl -X POST '${API_URL}/api/agent/analyze?fields=loanCapacity,reputationScore' \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{"walletAddress":"0xBorrower..."}'`}</DocsCode>
        <DocsH3 id="field-keys">Allowed field keys</DocsH3>
        <p>
          <code>monthlyIncome</code>, <code>financialHealth</code>, <code>reputationScore</code>,{" "}
          <code>loanCapacity</code>, <code>statement</code>, <code>assessment</code>,{" "}
          <code>walletData</code>
        </p>

        <div className="docs-next-links">
          <Link href="/docs/x402" className="docs-next-card">
            <span className="docs-next-label">Payments</span>
            <span className="docs-next-title">x402 payments →</span>
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
