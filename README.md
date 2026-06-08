# Wallet Profile

Monorepo for the Wallet Profile onchain financial reputation platform.

## Structure

```
.
├── web/                  # Next.js frontend (dashboard, landing, API routes)
├── contracts/
│   ├── erc-8004/         # ERC-8004 agent identity & registration contracts
│   └── normal/           # Core Wallet Profile contracts (attestation, payments, etc.)
├── agent/                # LangChain / OnFRA backend agent
└── docs/                 # Specs and notes (*.md at repo root)
```

## Quick start

### Web (Next.js)

```bash
cd web
npm install
npm run dev
```

Or from the repo root:

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Contracts

Each contract package is a standalone [Foundry](https://book.getfoundry.sh/) project.

```bash
# ERC-8004 agent contracts
cd contracts/erc-8004
forge build
forge test

# Core Wallet Profile contracts
cd contracts/normal
forge build
forge test
```

### Agent

See `agent/` for the LangChain OnFRA agent service.

## Environment

Copy `web/.env.local.example` to `web/.env` and set your Privy app ID and other secrets.
