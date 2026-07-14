# Onfra (OnFRA)

Onfra is an onchain financial reputation platform for the Celo ecosystem. Users connect a wallet, receive AI-powered financial intelligence (health scores, income stability, loan capacity), purchase verified attestations, and verify reports onchain.

The platform is powered by **OnFRA** (Onchain Financial Reputation Agent), an [ERC-8004 agent on Celo mainnet (#9219)](https://8004scan.io/agents/celo/9219).

## Links

| Resource | URL |
|----------|-----|
| **Live demo** | [wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app) |
| **Demo video** | [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4) |
| **Documentation** | [docs/](./docs/) |
| **GitHub** | [github.com/jeffIshmael/wallet-profile](https://github.com/jeffIshmael/wallet-profile) |
| **X / Twitter** | [@onfra_xyz](https://x.com/onfra_xyz) |
| **OnFRA on 8004scan** | [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219) |
| **OnchainReporter contract** | [`0xE7621aF5dE3806ba26115bdC89190c65ed835C21`](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |
| **ERC-8004 Identity Registry** | [`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`](https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) |

## The problem

Your wallet knows your income. Your lender doesn't.

Millions of freelancers, remote workers, creators, and DAO contributors receive payments in crypto every month. Yet when applying for loans, they are asked for bank statements, payslips, and employment records that don't reflect their real financial activity.

As a result, reliable earners are often unable to prove their income despite having years of verifiable onchain history:

- Crypto payments don't appear on traditional bank statements
- Freelancers struggle to prove recurring income
- Lenders have no standard way to assess wallet reputation
- Years of financial history remain trapped inside blockchain data

## The solution

Onfra analyzes onchain activity and transforms it into lender-ready financial insights, reputation scores, income verification, and borrowing recommendations.

Instead of asking users for payslips and bank statements, lenders can evaluate a wallet's financial behavior through transparent blockchain data — turning onchain wallet activity into financial reputation.

## How it works

1. **Connect your wallet** — Securely connect your wallet and allow Onfra to analyze your onchain financial history.
2. **OnFRA analyzes activity** — The AI agent evaluates wallet activity on Celo — income patterns, savings behavior, wallet maturity, and financial consistency.
3. **Generate financial scores** — Receive Financial Health, Reputation, Income Stability, and Loan Capacity insights.
4. **Download your financial passport** — Generate a verified report with transaction statements, financial scores, and borrowing recommendations. Reports can be registered onchain and verified by code.

Watch the full walkthrough: [Demo video (YouTube)](https://youtu.be/7WC3lD5dDj4)

---

The repository is organized into three packages:

```
.
├── web/              # Next.js app — landing, dashboard, API routes, agent discovery
├── OnFRA agent/      # LangChain agent — wallet analysis, chat, report compilation
└── contracts/        # Solidity contracts and ERC-8004 registration tooling
    ├── smart-contract/   # OnchainReporter UUPS attestation registry (Hardhat)
    └── erc8004-agent/    # ERC-8004 identity registration scripts
```

Full platform documentation: **[docs/](./docs/)**

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

See each package README and [docs/architecture.md](./docs/architecture.md) for additional configuration.

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

See [docs/api.md](./docs/api.md) for full API reference.

## Onchain deployment (Celo mainnet)

| Contract | Address |
|----------|---------|
| OnchainReporter proxy | [`0xE7621aF5dE3806ba26115bdC89190c65ed835C21`](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |
| ERC-8004 Identity Registry | [`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`](https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) |
| OnFRA agent ID | [`9219`](https://8004scan.io/agents/celo/9219) |

See [docs/onchain.md](./docs/onchain.md) for verification flow and contract details.

## License

MIT
