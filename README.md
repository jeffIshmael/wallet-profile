# Chainalyse (OnFRA)

Chainalyse is an onchain financial reputation platform for the Celo ecosystem. Users connect a wallet, receive AI-powered financial intelligence (health scores, income stability, loan capacity), purchase verified attestations, and verify reports onchain.

The platform is powered by **OnFRA** (Onchain Financial Reputation Agent), an [ERC-8004 agent on Celo mainnet (#9219)](https://8004scan.io/agents/celo/9219).

## The problem

Your wallet knows your income. Your lender doesn't.

Millions of freelancers, remote workers, creators, and DAO contributors receive payments in crypto every month. Yet when applying for loans, they are asked for bank statements, payslips, and employment records that don't reflect their real financial activity.

As a result, reliable earners are often unable to prove their income despite having years of verifiable onchain history:

- Crypto payments don't appear on traditional bank statements
- Freelancers struggle to prove recurring income
- Lenders have no standard way to assess wallet reputation
- Years of financial history remain trapped inside blockchain data

## The solution

Chainalyse analyzes onchain activity and transforms it into lender-ready financial insights, reputation scores, income verification, and borrowing recommendations.

Instead of asking users for payslips and bank statements, lenders can evaluate a wallet's financial behavior through transparent blockchain data — turning onchain wallet activity into financial reputation.

## How it works

1. **Connect your wallet** — Securely connect your wallet and allow Chainalyse to analyze your onchain financial history.
2. **OnFRA analyzes activity** — The AI agent evaluates wallet activity on Celo — income patterns, savings behavior, wallet maturity, and financial consistency.
3. **Generate financial scores** — Receive Financial Health, Reputation, Income Stability, and Loan Capacity insights.
4. **Download your financial passport** — Generate a verified report with transaction statements, financial scores, and borrowing recommendations. Reports can be registered onchain and verified by code.

---

The repository is organized into three packages:

```
.
├── web/              # Next.js app — landing, dashboard, API routes, agent discovery
├── OnFRA agent/    # LangChain agent — wallet analysis, chat, report compilation
└── contracts/      # Solidity contracts and ERC-8004 registration tooling
    ├── smart-contract/   # OnchainReporter UUPS attestation registry (Hardhat)
    └── erc8004-agent/    # ERC-8004 identity registration scripts
```

## Quick start

Install dependencies from the repo root (npm workspaces include `web`):

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). The web app builds the OnFRA agent automatically via `predev` / `prebuild`.

### Environment

Copy `web/.env.local.example` to `web/.env` and configure:

- `NEXT_PUBLIC_PRIVY_APP_ID` — wallet auth
- `REPORTER_PRIVATE_KEY` — backend relayer for onchain report publishing
- `ONCHAIN_REPORTER_PROXY_ADDRESS` — deployed `OnchainReporter` proxy on Celo

See each package README for additional configuration.

## Package overview

| Package | Role |
|---------|------|
| [`web/`](./web/) | User-facing UI, REST API (`/api/agent/*`), x402 payment gates, onchain reporter client, ERC-8004 `/.well-known` manifests, JSON schemas at `/schemas/*` |
| [`OnFRA agent/`](./OnFRA%20agent/) | LangChain pipelines that fetch Celo wallet data, score financial health/reputation/risk, and generate attestations |
| [`contracts/`](./contracts/) | `OnchainReporter` upgradeable contract + ERC-8004 agent registration for OnFRA (#9219 on Celo mainnet) |

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/agent/analyze` | Run full wallet analysis |
| `POST /api/agent/chat` | Conversational wallet queries |
| `POST /api/agent/report` | Generate verified report + publish onchain attestation |
| `GET /api/agent/verify/{reportId}` | Verify a report by `REP-{id}` or onchain hash |

JSON request/response schemas are served from `web/public/schemas/` at `https://<app-url>/schemas/*.schema.json`.

## Onchain deployment (Celo mainnet)

| Contract | Address |
|----------|---------|
| OnchainReporter proxy | `0x50a8Fc322497e2EAc5489A64ce162E07Fb85E6AB` |
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| OnFRA agent ID | `9219` |

## License

MIT
