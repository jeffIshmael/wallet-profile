# Chainalyse Documentation

Chainalyse is an onchain financial reputation platform for the Celo ecosystem. Users connect a wallet, receive AI-powered financial intelligence, generate verified financial passports, and verify reports onchain. The platform is powered by **OnFRA** (Onchain Financial Reputation Agent), an [ERC-8004 agent on Celo mainnet (#9219)](https://8004scan.io/agents/celo/9219).

## Quick links

| Resource | URL |
|----------|-----|
| **Live demo** | [chainalyse.xyz](https://chainalyse.xyz) |
| **Demo video** | [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4) |
| **GitHub** | [github.com/jeffIshmael/wallet-profile](https://github.com/jeffIshmael/wallet-profile) |
| **X / Twitter** | [@chainalyse_xyz](https://x.com/chainalyse_xyz) |
| **OnFRA on 8004scan** | [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219) |
| **OnchainReporter contract** | [celoscan.io](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |

## Documentation index

| Document | Description |
|----------|-------------|
| [Platform overview](./platform-overview.md) | Problem, solution, user flows, and key features |
| [Architecture](./architecture.md) | Monorepo layout, data flow, and integrations |
| [Onchain](./onchain.md) | Smart contracts, ERC-8004 agent, verification, and x402 payments |
| [API reference](./api.md) | REST endpoints, schemas, and agent discovery manifests |
| [MiniPay guide](./minipay.md) | Using Chainalyse inside Celo MiniPay |
| [Scoring methodology](../OnFRA%20agent/METHODOLOGY.md) | Formulas and rules behind financial health and reputation scores |

## Repository packages

```
.
├── web/              # Next.js app — landing, dashboard, API routes, agent discovery
├── OnFRA agent/      # LangChain agent — wallet analysis, chat, report compilation
└── contracts/        # OnchainReporter UUPS contract + ERC-8004 registration tooling
```

## Getting started (developers)

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Copy `web/.env.local.example` to `web/.env` and configure wallet auth, database, Gemini, Thirdweb/x402, and the OnchainReporter relayer key. See [Architecture](./architecture.md) and the package READMEs for details.
