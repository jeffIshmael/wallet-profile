# OnFRA Agent

**Onchain Financial Reputation Agent** — the LangChain/TypeScript backend that powers Chainalyse. It ingests Celo wallet activity, computes financial scores, generates AI summaries, and compiles verified report attestations.

The web app loads this package at runtime from `dist/` (built automatically before `npm run dev` / `npm run build` in `web/`).

## Project structure

```
OnFRA agent/
├── chains/
│   ├── analysis_chain.ts    # Scoring pipeline (health, reputation, risk, income, loan)
│   ├── dashboard_bundle.ts  # Assembles full dashboard payload for the web UI
│   ├── chat_agent.ts        # ReAct conversational agent
│   └── report_chain.ts      # Premium report compilation
├── lib/
│   └── getWalletDetails.ts  # Celo transaction/balance fetching with caching
├── tools/                   # Individual scoring and data tools
├── prompts/                 # LLM prompt templates (Gemini)
├── middleware/
│   └── x402_billing.ts      # Micropayment gating helpers
├── memory/
│   └── wallet_cache.ts      # Block-aware wallet cache (15-min TTL)
├── reports/                 # Generated report files (gitignored)
├── main.ts                  # Local verification / dev entrypoint
└── dist/                    # Compiled ESM output (consumed by web)
```

## Analysis pipeline

When a wallet is analyzed (`dashboard_bundle.ts`):

1. `getWalletDetails` fetches balances, transactions, and NFT counts from Celo RPC
2. `analysis_chain` runs scoring tools in parallel where possible
3. Results are mapped to the web `WalletData` shape via `web/src/lib/agent/mapWalletData.ts`
4. Gemini generates dashboard narrative and formal attestation text (falls back to rule-based output offline)

## x402 pricing

| Action | Cost |
|--------|------|
| Wallet analysis / chat query | 0.05 USDT |
| Verified financial report | 0.10 USDT |

Billing middleware wraps tool calls; enforcement is handled at the web API layer.

## Getting started

```bash
npm install
npm run build    # compile to dist/
npm run dev      # run main.ts verification suite
```

### Environment

```bash
export GOOGLE_API_KEY="..."   # optional; enables Gemini summaries
```

Without an API key the agent uses deterministic fallbacks so the stack remains testable offline.

## Integration with web

`web/src/lib/agent/onfraServer.ts` dynamically imports from `dist/`:

- `runDashboardBundle` → full wallet analysis for the dashboard
- `runChatAgent` → chat sidebar

After a paid report, `web/src/app/api/agent/report/route.ts` runs analysis and publishes the attestation onchain via `OnchainReporter.publishFinancialReport()`.

## Methodology

See [`METHODOLOGY.md`](./METHODOLOGY.md) for scoring weights, income animal taxonomy, and reputation rubric details.
