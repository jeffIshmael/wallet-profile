# Wallet Analyst Web

Next.js 14 application for Wallet Analyst — landing page, financial dashboard, transaction statements, AI chat, and REST API routes that expose the OnFRA agent.

## Setup

```bash
npm install
cp .env.local.example .env
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000). `predev` builds the OnFRA agent from `../OnFRA agent/`.

From the repo root: `npm run dev` (npm workspaces).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy wallet authentication |
| `NEXT_PUBLIC_APP_URL` | Public base URL for manifests and verification links |
| `REPORTER_PRIVATE_KEY` | Backend signer with `REPORTER_ROLE` on `OnchainReporter`; also used to submit ERC-8004 reputation feedback (must not be the agent owner wallet) |
| `ONCHAIN_REPORTER_PROXY_ADDRESS` | UUPS proxy on Celo (default: mainnet deployment) |
| `CELO_RPC_URL` | Optional Celo RPC (default: `https://forno.celo.org`) |
| `GEMINI_API_KEY` | Google Gemini API key for OnFRA chat and AI summaries (`GOOGLE_API_KEY` alias supported) |
| `THIRDWEB_SECRET_KEY` | Thirdweb secret key for x402 payment settlement |
| `THIRDWEB_CLIENT_ID` | Thirdweb client ID (used with the secret key) |
| `X402_PAY_TO` | Optional treasury wallet for x402 USDT; defaults to `REPORTER_PRIVATE_KEY` address |
| `X402_ENFORCE` + Thirdweb vars | Enable x402 micropayment enforcement on analyze/chat/report |

### ERC-8004 reputation feedback

Submit a positive `starred` rating for OnFRA (agent `#9219`) on Celo mainnet:

```bash
npm run feedback:erc8004
```

Optional env overrides: `FEEDBACK_SCORE` (default `95`), `FEEDBACK_TAG` (default `starred`), `AGENT_ID` (default `9219`).

## Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Analysis dashboard + statements
│   ├── verify/               # Public report verification
│   └── api/agent/            # REST API (analyze, chat, report, verify)
├── components/               # UI (landing, dashboard, scores, chat)
├── lib/
│   ├── agent/                # OnFRA loader, wallet data mapper, x402
│   └── blockchain/           # Chain constants, OnchainReporter client
├── providers/                # Auth (Privy/MiniPay), wallet data context
└── types/                    # WalletData and shared types

public/
├── .well-known/              # ERC-8004 agent.json, agent-card, MCP manifest
└── schemas/                  # JSON schemas served at /schemas/*
```

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/agent/analyze` | POST | Full wallet analysis (own wallet free; external 0.01 USDT) |
| `/api/agent/chat` | POST | AI chat about a wallet (own wallet free; external 0.01 USDT) |
| `/api/agent/report` | POST | Verified report (0.10 USDT) |
| `/api/agent/report` | POST | Verified report + onchain attestation (0.10 USDT) |
| `/api/agent/verify/{id}` | GET | Verify `REP-{id}` or onchain hash |

## JSON schemas

Request and response schemas live in **`public/schemas/`** and are served at `/schemas/*.schema.json` (rewritten in `next.config.mjs`). This is the single source of truth — edit files here when MCP tool shapes change.

Schemas referenced by `public/.well-known/mcp.json`:

- `walletAnalysisRequest.schema.json` / `walletAnalysisResult.schema.json`
- `chatRequest.schema.json`
- `reportRequest.schema.json` / `reportResult.schema.json`

## Onchain integration

After a paid report, the API calls `publishFinancialReport()` on the Celo `OnchainReporter` proxy via `src/lib/blockchain/onchainReporter.ts`. Verification codes use the onchain format `REP-{reportId}`.

## Agent discovery

ERC-8004 and MCP manifests are static files under `public/.well-known/`:

- `agent.json` — on-chain `agentURI` target (pin to IPFS for registration)
- `agent-card.json` — A2A capabilities and x402 pricing
- `mcp.json` — MCP tool definitions pointing at the API routes above
