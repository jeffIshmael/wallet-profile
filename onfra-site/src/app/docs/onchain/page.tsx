import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsTable
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { LINKS } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "deployed-contracts", title: "Deployed contracts" },
  { id: "erc-8004-agent", title: "ERC-8004 Agent" },
  { id: "attribution-tags", title: "Attribution tags" }
];

export default function OnchainDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Integrate" title="Onchain & Attribution" />
      <h1 className="docs-title">Onchain &amp; Attribution</h1>
      <p className="docs-lead">
        OnFRA operates as a verified ERC-8004 reputation agent on Celo mainnet. Learn how to verify
        records onchain and attribute transactions back to your platform.
      </p>

      <div className="docs-prose">
        <DocsH2 id="deployed-contracts">Deployed contracts (Celo mainnet)</DocsH2>
        <p>
          The core OnFRA attestation contracts are deployed on Celo mainnet (chain ID <code>42220</code>).
          Lenders and developers can call these contracts directly to verify reputations.
        </p>

        <DocsTable>
          <thead>
            <tr>
              <th>Contract</th>
              <th>Address</th>
              <th>Explorer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>OnchainReporter</strong> (Proxy)
              </td>
              <td>
                <code>0xE7621aF5dE3806ba26115bdC89190c65ed835C21</code>
              </td>
              <td>
                <a
                  href="https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Celoscan
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <strong>ERC-8004 Identity Registry</strong>
              </td>
              <td>
                <code>0x8004A169FB4a3325136EB29fA0ceB6D2e539a432</code>
              </td>
              <td>
                <a
                  href="https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Celoscan
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <strong>ERC-8004 Reputation Registry</strong>
              </td>
              <td>
                <code>0x8004BAa17C55a88189AE136b182e5fdA19dE9b63</code>
              </td>
              <td>
                <a
                  href="https://celoscan.io/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Celoscan
                </a>
              </td>
            </tr>
          </tbody>
        </DocsTable>

        <DocsH2 id="erc-8004-agent">ERC-8004 Agent ID</DocsH2>
        <p>
          OnFRA is registered on the Celo ERC-8004 Identity Registry under Agent ID <strong>9219</strong>.
          You can inspect the onchain identity, services, and reputation summaries at:
        </p>
        <p>
          <a href={LINKS.agent8004} target="_blank" rel="noopener noreferrer">
            8004scan.io/agents/celo/9219
          </a>
        </p>

        <DocsH2 id="attribution-tags">Transaction attribution tags</DocsH2>
        <p>
          Attribution tags allow ecosystem aggregators and off-chain indexers to credit transactions
          back to your dApp or platform. On Celo, this is standardized via trailing transaction
          calldata suffixes.
        </p>
        <p>
          Smart contracts on EVM ignore trailing calldata past the function arguments boundary, so
          adding this tag incurs only a minimal gas cost (~16 gas per byte) and never affects execution.
        </p>

        <DocsH3 id="deriving-tag">How to derive and append suffixes</DocsH3>
        <p>
          Use Celo&apos;s official <code>@celo/attribution-tags</code> helper along with <code>viem</code>
          to encode and append suffixes to the data payload:
        </p>

        <DocsCode>{`import { toDataSuffix } from "@celo/attribution-tags";
import { concat } from "viem";

// 1. Get the configured attribution tag (e.g. "onfra")
const attributionTag = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG || "onfra";

// 2. Derive the hex suffix
const tagSuffix = toDataSuffix(attributionTag);

// 3. Append suffix to contract call data
const taggedData = concat([originalCalldata, tagSuffix]);

// 4. Send transaction with the tagged data
const hash = await walletClient.sendTransaction({
  to: TARGET_CONTRACT_ADDRESS,
  data: taggedData,
  type: "legacy"
});`}</DocsCode>

        <div className="docs-next-links">
          <Link href="/docs/x402" className="docs-next-card">
            <span className="docs-next-label">Previous</span>
            <span className="docs-next-title">x402 payments →</span>
          </Link>
          <Link href="/docs/agents" className="docs-next-card">
            <span className="docs-next-label">Next</span>
            <span className="docs-next-title">MCP &amp; ERC-8004 →</span>
          </Link>
        </div>
      </div>
    </DocsShell>
  );
}
