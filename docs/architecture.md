# Architecture

## Monorepo structure

Onfra is an npm workspaces monorepo with three packages:

| Package | Stack | Role |
|---------|-------|------|
| [`web/`](../web/) | Next.js 14, React, Tailwind, Privy | User-facing UI, REST API, x402 payment gates, ERC-8004 manifests |
| [`OnFRA agent/`](../OnFRA%20agent/) | LangChain, TypeScript, Gemini | Wallet analysis, scoring, chat, report compilation |
| [`contracts/`](../contracts/) | Hardhat 3, OpenZeppelin UUPS | OnchainReporter attestation registry + ERC-8004 registration scripts |

## High-level data flow

```
User wallet (Celo)
       │
       ▼
  web/ (Next.js)
       ├── Auth: Privy (web) or MiniPay injected provider (mobile)
       ├── /api/agent/analyze  ──► OnFRA agent (dist/)
       ├── /api/agent/chat     ──► OnFRA chat agent
       ├── /api/agent/report   ──► OnFRA report chain + IPFS (Pinata) + OnchainReporter
       └── /api/agent/verify   ──► OnchainReporter.verifyReport()
       │
       ▼
  PostgreSQL (Supabase) — analysis cache, chat history, reports, stats
       │
       ▼
  Celo mainnet — OnchainReporter attestations, ERC-8004 identity (#9219)
```

## Web app (`web/`)

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — problem, solution, how it works, CTA |
| `/dashboard` | Financial dashboard after wallet analysis |
| `/dashboard/statements` | Transaction statement downloads |
| `/dashboard/stats` | Per-wallet stats |
| `/chat` | OnFRA agent chat (full-screen on mobile when signed in) |
| `/verify` | Public report verification by code |
| `/stats` | Platform-wide usage metrics |

### Mobile shell

Authenticated mobile users see a bottom navigation bar (`MobileBottomNav`) with Home, Verify, Dashboard, Agent chat, and Statements. MiniPay users auto-connect via the injected Ethereum provider.

### API layer

REST routes under `web/src/app/api/agent/` load the compiled OnFRA agent from `OnFRA agent/dist/`. x402 middleware enforces micropayments on external wallet queries and report generation.

### Agent discovery

Static manifests in `web/public/.well-known/`:

- `agent.json` — on-chain `agentURI` target
- `agent-card.json` — A2A capabilities and pricing
- `mcp.json` — MCP tool definitions

JSON schemas are served from `web/public/schemas/` at `/schemas/*.schema.json`.

## OnFRA agent (`OnFRA agent/`)

### Analysis pipeline

1. `getWalletDetails` fetches balances, transactions, and NFT counts from Celo RPC (Thirdweb)
2. `analysis_chain` runs scoring tools: reputation, financial health, income stability, risk exposure, loan capacity
3. Gemini generates dashboard narrative and attestation text (rule-based fallback offline)
4. Results map to the web `WalletData` type

### Chat agent

ReAct-style LangChain agent with tools for wallet data lookup, score explanation, and report context. Supports multi-turn conversation with session memory.

### Report chain

Compiles formal financial passport content, renders PDF, pins to IPFS via Pinata, and returns verification metadata for onchain publishing.

See [Scoring methodology](../OnFRA%20agent/METHODOLOGY.md) for formula details.

## Contracts (`contracts/`)

### OnchainReporter

Upgradeable UUPS contract on Celo mainnet. Authorized reporters call `publishFinancialReport()` after payment verification. Anyone can verify via `verifyReport(reportId)` or `verifyReportByHash(reportHash)`.

### ERC-8004 registration

Scripts in `contracts/erc8004-agent/` register and update OnFRA agent metadata on the Celo Identity Registry. OnFRA is agent **#9219**.

See [Onchain](./onchain.md) for deployed addresses and verification flow.

## External services

| Service | Purpose |
|---------|---------|
| **Privy** | Wallet authentication (web browser) |
| **MiniPay** | In-wallet auto-connect and stablecoin payments |
| **Supabase (PostgreSQL)** | Analysis cache, chat, reports, platform stats |
| **Google Gemini** | AI summaries, chat, report narrative |
| **Thirdweb** | Celo RPC and wallet data (onchain reads) |
| **Celo x402 Facilitator** | Gasless EIP-3009 payment settlement (`api.x402.celo.org`) |
| **Pinata** | IPFS pinning for report PDFs |
| **Celo Forno RPC** | OnchainReporter reads and transaction publishing |

## Environment

Key variables (see `web/.env.local.example`):

- `NEXT_PUBLIC_PRIVY_APP_ID` — wallet auth
- `DATABASE_URL` / `DIRECT_URL` — Supabase PostgreSQL
- `GEMINI_API_KEY` — OnFRA AI
- `REPORTER_PRIVATE_KEY` — backend relayer for onchain report publishing
- `ONCHAIN_REPORTER_PROXY_ADDRESS` — deployed proxy on Celo
- `X402_API_KEY` — Celo x402 facilitator API key (replaces Thirdweb secret)
- `X402_PAY_TO` — treasury wallet address that receives x402 payments
- `X402_ENFORCE` — set `true` to require real payments in production
- `NEXT_PUBLIC_ATTRIBUTION_TAG` — ERC-8021 attribution tag code (e.g. `onfra`)
- `PINATA_*` — IPFS pinning for reports

## ERC-8021 attribution

Every on-chain transaction emitted by the web app (onchain reports, ERC-8004 feedback, MiniPay transfers, direct USDT payments) appends a trailing ERC-8021 attribution tag to the calldata using `@celo/attribution-tags`:

```typescript
import { toDataSuffix } from "@celo/attribution-tags";
import { concat } from "viem";

const taggedData = concat([callData, toDataSuffix("onfra")]);
```

Smart contracts ignore trailing calldata; off-chain indexers use it to attribute transactions back to the originating dApp.
