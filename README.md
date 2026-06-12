# Wallet Analyst (OnFRA)

Wallet Analyst is an onchain financial reputation platform for the Celo ecosystem. Users connect a wallet, receive AI-powered financial intelligence (health scores, income stability, loan capacity), purchase verified attestations, and verify reports onchain.

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
