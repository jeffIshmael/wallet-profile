// FILE: app/docs/rest-api/page.tsx  (uploaded as page_29665b.tsx — REST API)
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
  { id: "endpoints", title: "Endpoints" },
  { id: "analyze", title: "Analyze wallet" },
  { id: "chat", title: "Chat query" },
  { id: "statement", title: "Generate statement" },
  { id: "report", title: "Generate report" },
  { id: "verify", title: "Verify report" },
  { id: "health", title: "Health & stats" }
];

export default function RestApiDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Integrate" title="REST API" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="docs-title !mb-0">REST API</h1>
        <DocsAssistantDropdown />
      </div>
      <p className="docs-lead">
        All routes are served from <code>{API_URL}</code>. Paid routes settle in USDT on Celo via x402.
        No API keys required.
      </p>

      <div className="docs-prose">
        <DocsH2 id="endpoints">Endpoints</DocsH2>
        <DocsTable>
          <thead>
            <tr>
              <th>Method</th>
              <th>Route</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>POST</td>
              <td><code>/api/lender/screen</code></td>
              <td>Lender underwriting — trust + income + loan capacity</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td><code>/api/agent/analyze</code></td>
              <td>Full wallet analysis</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td><code>/api/agent/chat</code></td>
              <td>Natural-language wallet queries</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td><code>/api/agent/statement</code></td>
              <td>Generate transaction statement PDF (pinned to IPFS)</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td><code>/api/agent/report</code></td>
              <td>Verified REP passport + onchain attestation</td>
              <td>0.10 USDT</td>
            </tr>
            <tr>
              <td>GET</td>
              <td><code>/api/agent/verify/{"{id}"}</code></td>
              <td>Verify REP-{"{id}"} or WP-… code</td>
              <td>Free</td>
            </tr>
            <tr>
              <td>GET</td>
              <td><code>/api/wallet/{"{address}"}/signals</code></td>
              <td>List signals + cache status</td>
              <td>Free</td>
            </tr>
            <tr>
              <td>GET</td>
              <td><code>/api/wallet/{"{address}"}/signals/{"{signal}"}</code></td>
              <td>One reputation signal (from cache after analyze)</td>
              <td>Free</td>
            </tr>
            <tr>
              <td>GET</td>
              <td><code>/api/wallet/{"{address}"}/analysis</code></td>
              <td>Full walletData</td>
              <td>0.01 USDT</td>
            </tr>
          </tbody>
        </DocsTable>

        <DocsH2 id="analyze">Analyze wallet</DocsH2>
        <DocsCode>{`curl -X POST ${API_URL}/api/agent/analyze \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{"walletAddress":"0xYourWallet...", "months": 3}'`}</DocsCode>
        <p>
          Agent/API calls require <code>X-PAYMENT</code> with a valid x402 signature; unpaid calls return
          HTTP 402. Pass <code>callerAddress</code> when the payer differs from the target wallet.
        </p>
        <DocsTable>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>walletAddress</code></td>
              <td>string (required)</td>
              <td>EVM address, <code>0x</code> + 40 hex characters</td>
            </tr>
            <tr>
              <td><code>months</code></td>
              <td>integer, 1–12 (default 3)</td>
              <td>Months of history for the cash-flow statement</td>
            </tr>
            <tr>
              <td><code>includeAttestation</code></td>
              <td>boolean (default true)</td>
              <td>Include the onchain attestation</td>
            </tr>
            <tr>
              <td><code>fields</code></td>
              <td>string[]</td>
              <td>Return a subset instead of full <code>walletData</code> — see <Link href="/docs/signals">Signal endpoints</Link></td>
            </tr>
            <tr>
              <td><code>force</code></td>
              <td>boolean (default false)</td>
              <td>Bypass cached analysis</td>
            </tr>
          </tbody>
        </DocsTable>

        <DocsH3 id="analyze-response">Response</DocsH3>
        <p>
          Returns financial health score, reputation score, income label, loan range, AI summary,
          attestation, and full <code>walletData</code> when no <code>fields</code> filter is set.
        </p>

        <DocsH2 id="chat">Chat query</DocsH2>
        <DocsCode>{`curl -X POST ${API_URL}/api/agent/chat \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{
    "message": "What is the income stability classification?",
    "walletAddress": "0xTargetWallet..."
  }'`}</DocsCode>
        <p>
          <code>message</code> is required. <code>walletAddress</code> is required for external wallet
          queries. <code>history</code> is an optional array of{" "}
          <code>{`{ role: "user" | "assistant" | "system", content }`}</code> messages.
        </p>

        <DocsH2 id="statement">Generate statement</DocsH2>
        <DocsCode>{`curl -X POST ${API_URL}/api/agent/statement \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{"walletAddress":"0xYourWallet...", "period": "3M"}'`}</DocsCode>
        <p>
          Generates a transaction statement PDF and pins it to IPFS. <code>period</code> defaults to{" "}
          <code>3M</code>. Allowed values: <code>3M</code>, <code>6M</code>, or <code>12M</code>.
          Optional <code>force</code> bypasses cache.
        </p>

        <DocsH2 id="report">Generate report</DocsH2>
        <DocsCode>{`curl -X POST ${API_URL}/api/agent/report \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{"walletAddress":"0xYourWallet...", "periodMonths": 3}'`}</DocsCode>
        <p>
          Purchases a Verified Financial Reputation Report with scores, AI summary, verification code,
          and an <code>OnchainReporter</code> attestation (0.10 USDT). <code>periodMonths</code> is an
          integer from 1 to 12 (default 3).
        </p>

        <DocsH2 id="verify">Verify report</DocsH2>
        <DocsCode>{`curl ${API_URL}/api/agent/verify/REP-X141GYYEUM`}</DocsCode>
        <p>
          Confirms a verified financial passport (<code>REP-…</code> ID or <code>WP-…</code> code) was
          issued by OnFRA and attested onchain. Returns scores, report hash, IPFS CID, and attestation
          status. Free.
        </p>

        <DocsH2 id="health">Health, capabilities &amp; stats</DocsH2>
        <DocsCode>{`curl ${API_URL}/api/health/integrations
# always HTTP 200 — use top-level payTo / usdtSettlementAddress
curl ${API_URL}/api/capabilities
curl ${API_URL}/api/x402/config
curl ${API_URL}/api/stats`}</DocsCode>
        <p>
          <code>/api/health/integrations</code> returns settlement address and discovery links even when
          optional probes (e.g. OpenAI) are degraded. Use <code>agentReady</code> / top-level{" "}
          <code>ok</code> for readiness.
        </p>

        <div className="docs-next-links">
          <Link href="/docs/lenders" className="docs-next-card">
            <span className="docs-next-label">Lenders</span>
            <span className="docs-next-title">Lender screening →</span>
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