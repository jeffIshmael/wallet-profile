import type { Metadata } from "next";
import Link from "next/link";
import { FooterSection } from "@/components/landing/design-4/sections/FooterSection";
import { APP_BASE_URL, ONCHAIN_REPORTER_PROXY } from "@/lib/blockchain/constants";
import { PLATFORM_LINKS } from "@/lib/siteLinks";

export const metadata: Metadata = {
  title: "OnFRA for Lenders | Developers",
  description:
    "Integrate OnFRA — onchain financial reputation infrastructure for Celo lenders. Screen borrower wallets via API before extending credit."
};

const SCREEN_EXAMPLE = `curl -X POST ${APP_BASE_URL}/api/lender/screen \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <x402-signature>" \\
  -d '{
    "walletAddress": "0xBorrowerWallet...",
    "callerAddress": "0xYourLenderWallet..."
  }'`;

const VERIFY_EXAMPLE = `curl ${APP_BASE_URL}/api/agent/verify/REP-X141GYYEUM`;

// EIP-3009 signing example shown on the developers page
const X402_SIGNING_EXAMPLE = [
  "import { privateKeyToAccount } from 'viem/accounts';",
  "import { createWalletClient, http, toHex, parseUnits, keccak256 } from 'viem';",
  "import { celo } from 'viem/chains';",
  "",
  "// Config",
  "const USDC = '0xcebA9300f2b948710d2653dD7B07f33A8B32118C'; // Celo mainnet USDC",
  `const ONFRA_API = '${APP_BASE_URL}';`,
  "",
  "const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY);",
  "const client = createWalletClient({ chain: celo, transport: http(), account });",
  "",
  "// 1. Discover the recipient treasury address",
  "const { publicPayTo } = await fetch(`${ONFRA_API}/api/x402/config`).then(r => r.json());",
  "",
  "// 2. Sign EIP-3009 transferWithAuthorization",
  "const nonce = keccak256(toHex(Date.now()));",
  "const validBefore = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 min",
  "const value = parseUnits('0.01', 6); // 0.01 USDC",
  "",
  "const signature = await client.signTypedData({",
  "  domain: { name: 'USDC', version: '2', chainId: 42220, verifyingContract: USDC },",
  "  types: {",
  "    TransferWithAuthorization: [",
  "      { name: 'from',        type: 'address' },",
  "      { name: 'to',          type: 'address' },",
  "      { name: 'value',       type: 'uint256' },",
  "      { name: 'validAfter',  type: 'uint256' },",
  "      { name: 'validBefore', type: 'uint256' },",
  "      { name: 'nonce',       type: 'bytes32' },",
  "    ],",
  "  },",
  "  primaryType: 'TransferWithAuthorization',",
  "  message: { from: account.address, to: publicPayTo, value,",
  "             validAfter: 0n, validBefore, nonce },",
  "});",
  "",
  "// 3. Attach signature and call OnFRA",
  "const payment = JSON.stringify({",
  "  from: account.address, to: publicPayTo,",
  "  value: value.toString(), validAfter: '0',",
  "  validBefore: validBefore.toString(), nonce, signature, token: USDC,",
  "});",
  "",
  "const res = await fetch(`${ONFRA_API}/api/lender/screen`, {",
  "  method: 'POST',",
  "  headers: { 'Content-Type': 'application/json', 'X-PAYMENT': payment },",
  "  body: JSON.stringify({ walletAddress: '0xBorrower...', callerAddress: account.address }),",
  "});",
  "",
  "const { trust, reputationScore, loanCapacity } = await res.json();",
  "// trust.isTrustworthy → boolean",
  "// reputationScore     → 0-100",
  "// loanCapacity        → { min, max, currency, confidence }",
].join("\n");


export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-void font-inter text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="font-dancing text-xl text-btc-orange transition hover:opacity-90">
            Onfra
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">OnFRA · Lenders</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-widest text-btc-orange">Infrastructure</p>
        <h1 className="mt-2 font-space text-3xl font-bold md:text-4xl">OnFRA for lenders</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stardust">
          OnFRA is financial-reputation infrastructure on Celo — not a consumer app. Lenders call the API to screen
          borrower wallets <em>before</em> extending credit. Onfra is the reference UI; your integration uses
          OnFRA directly.
        </p>

        <section className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-6">
          <h2 className="font-space text-xl font-semibold">What lenders already look at</h2>
          <p className="mt-2 text-sm text-stardust">
            On Celo, underwriting today is mostly onchain collateral and basic wallet signals:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-stardust">
            <li>· Collateral value and loan-to-value (Morpho, Aave)</li>
            <li>· USDT / cUSD balance and liquidity</li>
            <li>· KYC and identity (where required)</li>
            <li>· Wallet age and transaction count (manual or ad hoc)</li>
          </ul>
          <p className="mt-4 text-sm text-stardust">
            What&apos;s missing for MiniPay and stablecoin earners: <strong className="text-white">proof of income</strong>.
            Bank statements don&apos;t reflect onchain earnings. That gap is what OnFRA fills.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-btc-orange/30 bg-btc-orange/5 p-6">
          <h2 className="font-space text-xl font-semibold text-btc-orange">What OnFRA adds</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Onchain income stability",
                body: "Recurring stablecoin inflows, weekly consistency %, monthly income estimate — from transaction history, not self-reported PDFs."
              },
              {
                title: "Wallet reputation score",
                body: "Maturity, protocol trust, activity consistency — a 0–100 signal lenders can threshold in their own rules."
              },
              {
                title: "Loan capacity range",
                body: "Suggested min/max USD borrowing capacity with confidence level, derived from income + risk + savings discipline."
              },
              {
                title: "Trustworthiness & capacity",
                body: "One API call returns lender-friendly underwriting data: trustworthiness, reputation, average monthly income, and loan capacity range (with confidence)."
              },
              {
                title: "Onchain passport verification",
                body: "Borrowers can publish a verified REP-{id} attestation. You verify via API or the OnchainReporter contract."
              },
              {
                title: "x402 micropayments",
                body: "0.01 USDT per screen on Celo — no subscriptions, no API keys. Pay per borrower check from your lender wallet."
              }
            ].map((item) => (
              <li key={item.title} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <h3 className="font-space text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-6 text-stardust">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-space text-xl font-semibold">Integration flow</h2>
          <ol className="mt-4 space-y-3 text-sm text-stardust">
            <li>
              <span className="font-mono text-btc-orange">1.</span> Borrower applies with their Celo wallet address
            </li>
            <li>
              <span className="font-mono text-btc-orange">2.</span> Your backend calls{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">
                POST /api/lender/screen
              </code>{" "}
              with x402 payment from your lender treasury wallet
            </li>
            <li>
              <span className="font-mono text-btc-orange">3.</span> OnFRA returns{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">trust.isTrustworthy</code>{" "}
              plus reputation, average monthly income, and loan capacity range
            </li>
            <li>
              <span className="font-mono text-btc-orange">4.</span> Optional: require borrower to submit a verified
              passport — verify free via{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">
                GET /api/agent/verify/REP-…
              </code>
            </li>
            <li>
              <span className="font-mono text-btc-orange">5.</span> Combine OnFRA signal with your collateral and KYC
              rules — OnFRA does not replace collateral checks
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-space text-xl font-semibold">API reference</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-white/10 bg-black/50 font-mono text-[10px] uppercase tracking-widest text-stardust">
                <tr>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stardust">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-white">POST /api/lender/screen</td>
                  <td className="px-4 py-3">Trustworthiness + income + loan capacity for a borrower wallet</td>
                  <td className="px-4 py-3">0.01 USDT</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-white">POST /api/agent/analyze</td>
                  <td className="px-4 py-3">Full analysis or subset via <code className="text-white/80">fields</code></td>
                  <td className="px-4 py-3">0.01 USDT</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-white">GET /api/wallet/{"{address}"}/signals/{"{signal}"}</td>
                  <td className="px-4 py-3">Single signal from cache (free after analyze)</td>
                  <td className="px-4 py-3">Free</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-white">GET /api/agent/verify/{"{id}"}</td>
                  <td className="px-4 py-3">Verify borrower passport onchain</td>
                  <td className="px-4 py-3">Free</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-white">POST /api/agent/report</td>
                  <td className="px-4 py-3">Generate verified passport for borrower</td>
                  <td className="px-4 py-3">0.10 USDT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="font-space text-lg font-semibold">Screen a borrower wallet</h3>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-6 text-stardust">
            {SCREEN_EXAMPLE}
          </pre>
          <p className="mt-3 text-xs text-stardust">
            Schema:{" "}
            <a href="/schemas/lenderScreenRequest.schema.json" className="text-btc-orange hover:underline">
              lenderScreenRequest
            </a>
            {" · "}
            <a href="/schemas/lenderScreenResult.schema.json" className="text-btc-orange hover:underline">
              lenderScreenResult
            </a>
          </p>
        </section>

        <section className="mt-8">
          <h3 className="font-space text-lg font-semibold">Verify a borrower passport</h3>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-6 text-stardust">
            {VERIFY_EXAMPLE}
          </pre>
          <p className="mt-3 text-xs text-stardust">
            OnchainReporter:{" "}
            <a href={PLATFORM_LINKS.onchainReporter} className="text-btc-orange hover:underline" target="_blank" rel="noopener noreferrer">
              {ONCHAIN_REPORTER_PROXY}
            </a>
          </p>
        </section>

        <section className="mt-8">
          <h3 className="font-space text-lg font-semibold">x402 payment — backend signing</h3>
          <p className="mt-2 text-sm text-stardust">
            Paid endpoints require an{" "}
            <strong className="text-white">EIP-3009 transferWithAuthorization</strong>{" "}
            signature in the{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">X-PAYMENT</code>{" "}
            header. Settlement is handled by the{" "}
            <strong className="text-white">Celo x402 facilitator</strong> — no gas required from your side.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-stardust">
            <li>· Set <code className="text-white/80">AGENT_PRIVATE_KEY</code> to a Celo wallet funded with USDC or USDT</li>
            <li>· USDC domain: <code className="text-white/80">name: &quot;USDC&quot;, version: &quot;2&quot;</code></li>
            <li>· USDT domain: <code className="text-white/80">name: &quot;Tether USD&quot;, version: &quot;1&quot;</code></li>
          </ul>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-6 text-stardust">
            {X402_SIGNING_EXAMPLE}
          </pre>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-6">
          <h2 className="font-space text-xl font-semibold">Discovery &amp; agent protocols</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={PLATFORM_LINKS.onfra8004} className="text-btc-orange hover:underline" target="_blank" rel="noopener noreferrer">
                ERC-8004 agent #9219 on 8004scan
              </a>
            </li>
            <li>
              <a href={`${APP_BASE_URL}/.well-known/agent-card.json`} className="text-btc-orange hover:underline">
                A2A agent card
              </a>
            </li>
            <li>
              <a href={`${APP_BASE_URL}/.well-known/mcp.json`} className="text-btc-orange hover:underline">
                MCP manifest
              </a>
            </li>
            <li>
              <a href={PLATFORM_LINKS.github} className="text-btc-orange hover:underline" target="_blank" rel="noopener noreferrer">
                Open-source repo (MIT)
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <h2 className="font-space text-xl font-semibold">Pilot with us</h2>
          <p className="mt-2 text-sm text-stardust">
            We&apos;re looking for Celo lenders and MFIs to run a 5–10 borrower pilot: screen wallets via API, optionally
            require REP- passports, measure time-to-underwrite vs. your current flow.
          </p>
          <a
            href={PLATFORM_LINKS.x}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full bg-btc-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-btc-orange/90"
          >
            Contact {PLATFORM_LINKS.xHandle}
          </a>
        </section>

        <p className="mt-10 text-center text-xs text-stardust">
          Onfra is the borrower-facing reference app.{" "}
          <Link href="/" className="text-btc-orange hover:underline">
            Back to Onfra
          </Link>
        </p>
      </main>

      <FooterSection />
    </div>
  );
}
