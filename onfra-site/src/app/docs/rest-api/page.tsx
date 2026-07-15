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
              <td>
                <code>/api/lender/screen</code>
              </td>
              <td>Lender underwriting — trust + income + loan capacity</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>
                <code>/api/agent/analyze</code>
              </td>
              <td>Full wallet analysis</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>
                <code>/api/agent/chat</code>
              </td>
              <td>Natural-language wallet queries</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>
                <code>/api/agent/report</code>
              </td>
              <td>Verified REP passport + attestation</td>
              <td>0.10 USDT</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>
                <code>/api/agent/statement</code>
              </td>
              <td>Generate transaction statement PDF</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>
                <code>/api/agent/verify/{"{id}"}</code>
              </td>
              <td>Verify REP-{"{id}"} or hash</td>
              <td>Free</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>
                <code>/api/wallet/{"{address}"}/signals</code>
              </td>
              <td>List signals + cache status</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>
                <code>/api/wallet/{"{address}"}/signals/{"{signal}"}</code>
              </td>
              <td>One reputation signal</td>
              <td>0.01 USDT</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>
                <code>/api/wallet/{"{address}"}/analysis</code>
              </td>
              <td>Full walletData</td>
              <td>0.01 USDT</td>
            </tr>
          </tbody>
        </DocsTable>

        <DocsH2 id="analyze">Analyze wallet</DocsH2>
        <DocsCode>{`curl -X POST ${API_URL}/api/agent/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"walletAddress":"0xYourWallet..."}'`}</DocsCode>
        <p>
          For external wallets, include <code>X-PAYMENT</code> with a valid x402 signature. Pass{" "}
          <code>callerAddress</code> when the payer differs from the target wallet. Use optional{" "}
          <code>fields</code> to return a subset — see <Link href="/docs/signals">Signal endpoints</Link>.
        </p>

        <DocsH3 id="analyze-response">Response</DocsH3>
        <p>
          Returns financial health score, reputation score, income label, loan range, AI summary,
          attestation, and full <code>walletData</code> when no <code>fields</code> filter is set.
        </p>

        <DocsH2 id="statement">Generate statement</DocsH2>
        <DocsCode>{`curl -X POST ${API_URL}/api/agent/statement \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{"walletAddress":"0xYourWallet...", "period": "3M"}'`}</DocsCode>
        <p>
          Generates a verified transaction statement PDF and pins it to IPFS. By default, it covers the last 3 months. You can specify the number of months by passing the <code>period</code> field in the request body. Allowed values are: <code>1M</code>, <code>3M</code>, <code>6M</code>, or <code>12M</code>.
        </p>

        <DocsH2 id="verify">Verify report</DocsH2>
        <DocsCode>{`curl ${API_URL}/api/agent/verify/REP-X141GYYEUM`}</DocsCode>
        <p>
          Confirms a verified financial passport was issued by OnFRA. Returns scores, report hash,
          IPFS CID, and onchain attestation status.
        </p>

        <DocsH2 id="health">Health &amp; stats</DocsH2>
        <DocsCode>{`curl ${API_URL}/api/health/integrations
curl ${API_URL}/api/stats`}</DocsCode>

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
