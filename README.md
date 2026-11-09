# OnFRA — Onchain Financial Research Agent

**Intelligence behind every wallet.**

OnFRA is an AI-powered onchain financial intelligence agent that helps people, businesses, applications, and other AI agents understand blockchain financial activity.

It turns raw onchain transactions into meaningful financial insights through natural language. Ask questions about a wallet, understand where money comes from and where it goes, investigate transactions, explore cash flow, compare financial activity, and generate structured transaction statements.

At its core, OnFRA is an autonomous financial research agent. It retrieves blockchain data, selects the appropriate tools, analyzes financial activity, and delivers understandable answers.

The agent is accessible through conversational interfaces and APIs, allowing both humans and other AI agents to use the same financial intelligence.

OnFRA is registered as an **ERC-8004 agent on Celo mainnet (#9219)**.

## Links

| Resource | URL |
|---|---|
| **Platform** | [app.onfra.xyz](https://app.onfra.xyz/) |
| **Demo video (Loom)** | [Loom walkthrough](https://www.loom.com/share/1d48b54d58ac461da37d298c147c928d) |
| **Financial Researcher demo** | [https://fin-researcher.vercel.app/](https://fin-researcher.vercel.app/) |
| **Documentation** | [docs/](docs/) |
| **GitHub** | [github.com/jeffIshmael/wallet-profile](https://github.com/jeffIshmael/wallet-profile) |
| **X / Twitter** | [@onfra_xyz](https://x.com/onfra_xyz) |
| **OnFRA on 8004scan** | [ERC-8004 Agent #9219](https://8004scan.io/agents/celo/9219) |
| **OnchainReporter contract** | [`0xE7621aF5dE3806ba26115bdC89190c65ed835C21`](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |
| **ERC-8004 Identity Registry** | [`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`](https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) |

## The vision

Blockchains contain an enormous amount of financial information, but understanding that information is not always straightforward.

A wallet may have thousands of transactions involving tokens, smart contracts, exchanges, payments, and other financial activities. Accessing the raw data is relatively easy. Understanding what it means requires multiple queries, data interpretation, and financial context.

People and applications often have to rely on block explorers, analytics dashboards, custom scripts, and fragmented data providers to understand what is happening onchain.

OnFRA aims to make onchain financial intelligence accessible through an AI agent that can research, interpret, and explain blockchain financial activity.

## What OnFRA does

OnFRA acts as a financial researcher for blockchain activity.

Instead of manually navigating explorers and running multiple queries, users can ask questions in natural language and let the agent determine what information is needed.

Core capabilities include:

- **Wallet analysis:** Understand the financial activity and history of any supported public wallet.
- **Cash flow analysis:** Explore incoming funds, outgoing funds, net flow, and financial activity over different periods.
- **Transaction intelligence:** Investigate individual transactions, including transfers, swaps, contract interactions, and failed transactions.
- **Token balances:** Retrieve and understand token holdings and wallet balances.
- **Transaction statements:** Generate structured records of wallet transactions.
- **Financial reporting:** Compile transaction data and financial activity into downloadable reports.
- **Conversational research:** Ask follow-up questions, investigate specific activities, and explore financial information through natural language.

OnFRA is designed to serve different users and use cases:

| Audience | What OnFRA enables |
|---|---|
| **Individuals** | Understand personal onchain activity, income, spending, and cash flow. |
| **Freelancers and crypto earners** | Understand and organize their onchain financial history. |
| **Businesses and DAOs** | Research treasury activity, transaction flows, and financial operations. |
| **Applications** | Integrate onchain financial intelligence into existing products. |
| **AI agents** | Access financial research tools and retrieve structured wallet intelligence programmatically. |

Financial assessment, reporting, and reputation analysis can be built on top of this intelligence, but they are applications of OnFRA rather than the definition of the product.

## How OnFRA works

OnFRA combines blockchain data retrieval, specialized financial tools, and AI-powered reasoning.

1. **Ask a question:** A user or external agent submits a financial research request. For example, "Analyze this wallet's financial activity" or "Who are the top recipients of funds from this address?"
2. **Understand the request:** OnFRA interprets the intent, identifies relevant wallet addresses, and determines which tools are needed.
3. **Retrieve blockchain data:** The agent calls specialized tools to retrieve wallet transactions, balances, cash flow, and other relevant information.
4. **Analyze and interpret:** OnFRA processes the retrieved information, identifies patterns, and explains the results in context.
5. **Deliver insights:** The agent returns a natural-language answer or structured financial output. Where needed, it can compile transaction statements and reports.

The agent also maintains conversational context, allowing users to ask follow-up questions without repeating the entire research request.

### Meet Financial Researcher

**Financial Researcher is a conversational experience powered by OnFRA.**

It demonstrates how people can interact with onchain financial intelligence without needing to understand blockchain explorers, RPC methods, or individual analytics tools.

Users open a conversation and ask questions. They can provide a public wallet address directly in their messages, request an analysis, investigate transactions, and explore financial activity through follow-up questions.

The experience is designed around three principles:

- No wallet connection required to research public wallet activity.
- Natural-language interaction instead of complex analytics interfaces.
- OnFRA handles the underlying research and tool selection.

Try the [Financial Researcher demo](https://fin-researcher.vercel.app/).

## OnFRA as an agent and platform

OnFRA is designed as an agent-first financial intelligence platform.

The agent is the core intelligence layer. The platform makes that intelligence accessible, usable, and extensible.

### 1. OnFRA Agent

The OnFRA agent is responsible for understanding requests, retrieving blockchain data, selecting tools, analyzing financial activity, and generating responses.

It is built using LangChain and specialized financial intelligence tools.

### 2. OnFRA Platform

The platform provides the interfaces and supporting infrastructure through which users interact with the agent and access its capabilities.

This includes conversational experiences, wallet research, transaction statements, report generation, and other financial intelligence workflows.

### 3. OnFRA APIs and Agent Integration

OnFRA exposes its capabilities through APIs so applications and external AI agents can request financial research without implementing their own blockchain analysis infrastructure.

An external agent can call OnFRA, receive structured financial information, and use the results in its own workflows.

This makes OnFRA useful beyond its own user interface.

## Agent-to-agent financial intelligence

OnFRA is not limited to direct human interaction.

We built a sample external agent, Financial Researcher, to demonstrate how another AI application can use OnFRA as a financial intelligence service.

Rather than independently implementing wallet analysis, the external agent delegates financial research to OnFRA through its API.

**Demonstration:**

- [Financial Researcher](https://fin-researcher.vercel.app/)
- [Loom walkthrough](https://www.loom.com/share/1d48b54d58ac461da37d298c147c928d)

This demonstrates an important part of the OnFRA vision: AI agents should be able to access specialized financial intelligence from other agents instead of rebuilding the same capabilities independently.

## Open Rails on Celo: agent-purchased services via Buy

OnFRA was built for the **Open Rails hackathon on Celo** and integrates **Buy** to demonstrate how an AI agent can purchase external services when it needs additional capabilities.

### Service purchased: Chainstack Celo RPC

OnFRA purchases access to Chainstack's Celo RPC through the Buy gateway.

| Item | Detail |
|---|---|
| **Service** | Chainstack Celo RPC (via Buy) |
| **Route** | `POST https://gateway.usebuy.ai/chainstack/celo` |
| **Price** | $0.01 per request (one request can carry up to 2,000 JSON-RPC calls; OnFRA sends only one) |
| **RPC method** | `debug_traceTransaction` with the call tracer |
| **Payment** | The OnFRA wallet signs a USDT transfer on Celo to the Buy gateway address [`0x20faAca5F980E29639A0FCC6dcA6988E18ed333B`](https://celoscan.io/address/0x20faAca5F980E29639A0FCC6dcA6988E18ed333B). The gateway pays the gas. |
| **Paying wallet (OnFRA Buy account)** | [`0x8eb67dCF33f12536528CcA2071eF847B8FF6Df47`](https://celoscan.io/address/0x8eb67dCF33f12536528CcA2071eF847B8FF6Df47) |

### Why OnFRA purchases this service

Reading a transaction from a public Celo node is straightforward for standard transfers and ERC20 calls. However, understanding more complex transactions requires access to their internal execution traces.

For example:

- Swaps involving multiple contract calls.
- Complex smart contract interactions.
- Failed transactions and their revert reasons.
- Transactions with unknown or non-standard execution patterns.

The `debug_traceTransaction` RPC method with the call tracer provides:

- Every internal call made during transaction execution.
- Information about calls that moved CELO.
- Revert reasons when a transaction fails.

The free public RPC endpoint does not support this method (`rpc method is not whitelisted`).

OnFRA therefore purchases access to Chainstack through Buy when this additional transaction intelligence is required.

### When OnFRA makes a purchase

The purchase happens inside the `explain_transaction` tool, and only for swaps, contract calls, failed transactions, and unknown transaction types.

**Plain transfers never trigger a purchase.**

This is the only place OnFRA currently uses Buy.

### Proof of payment

Each `explain_transaction` result includes a `purchases` list containing the purchased service, route, price, token, and settlement transaction hash.

Payments can also be independently verified on Celo.

Open `https://celoscan.io/tx/<hash>` to inspect the USDT transfer from the OnFRA Buy wallet to the gateway address.

Sample settlement transactions (test calls to the same Chainstack service through Buy):

| # | Transaction |
|---|---|
| 1 | [0x5e913c35c3b5f39b6a5ffe539bdb01b78e7cc68a4e9a21420697768389be3553](https://celoscan.io/tx/0x5e913c35c3b5f39b6a5ffe539bdb01b78e7cc68a4e9a21420697768389be3553) |
| 2 | [0xdd22625e577f1938935ad7646ff0218255a0e2d2130c038f43da978f3cf4d5c2](https://celoscan.io/tx/0xdd22625e577f1938935ad7646ff0218255a0e2d2130c038f43da978f3cf4d5c2) |
| 3 | [0xbed4510b8c8be41b1ae4d1927bb3743f2756c8d28fa8198cc6fb209c5cfd5cdd](https://celoscan.io/tx/0xbed4510b8c8be41b1ae4d1927bb3743f2756c8d28fa8198cc6fb209c5cfd5cdd) |

## Architecture

The repository is organized into three main packages:

```text
.
├── web/                  # Next.js application, platform UI, APIs and agent discovery
├── OnFRA agent/          # LangChain agent and financial intelligence tools
└── contracts/            # Solidity contracts and ERC-8004 registration tooling
    ├── smart-contract/   # OnchainReporter UUPS attestation registry (Hardhat)
    └── erc8004-agent/    # ERC-8004 identity registration scripts
```

### Package overview

| Package | Role |
|---|---|
| [`web/`](web/) | User-facing platform, REST APIs (`/api/agent/*`), x402 payment gates, onchain reporter client, ERC-8004 `/.well-known` manifests, and JSON schemas at `/schemas/*`. |
| [`OnFRA agent/`](OnFRA%20agent/) | LangChain agent responsible for wallet research, conversational queries, blockchain data retrieval, financial analysis, and report compilation. |
| [`contracts/`](contracts/) | OnchainReporter upgradeable contract and ERC-8004 agent registration for OnFRA (#9219 on Celo mainnet). |

## API endpoints

OnFRA exposes its financial intelligence capabilities through REST APIs.

| Endpoint | Purpose |
|---|---|
| `POST /api/agent/analyze` | Run a full wallet analysis. |
| `POST /api/agent/chat` | Submit conversational wallet research queries. |
| `POST /api/agent/report` | Generate a structured report and publish an onchain attestation. |
| `GET /api/agent/verify/{reportId}` | Verify a report using `REP-{id}` or an onchain hash. |

JSON request and response schemas are served from `web/public/schemas/` at:

`https://<app-url>/schemas/*.schema.json`

For the complete API reference, see [docs/api.md](docs/api.md).

## Onchain identity and reporting

OnFRA is registered as an ERC-8004 agent on Celo mainnet.

This provides an onchain identity for the agent, making its identity discoverable and independently verifiable.

The project also includes an upgradeable `OnchainReporter` contract that supports publishing and verifying report attestations.

### Onchain deployment (Celo mainnet)

| Contract | Address |
|---|---|
| **OnchainReporter proxy** | [`0xE7621aF5dE3806ba26115bdC89190c65ed835C21`](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |
| **ERC-8004 Identity Registry** | [`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`](https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) |
| **OnFRA Agent ID** | [#9219 on Celo](https://8004scan.io/agents/celo/9219) |

For more details, see [docs/onchain.md](docs/onchain.md).

## Quick start

Install dependencies from the repository root. The project uses npm workspaces, including the `web` package.

```bash
npm install
npm run dev
```

The application runs at:

[http://localhost:3000](http://localhost:3000)

The web application builds the OnFRA agent automatically through its `predev` and `prebuild` scripts.

### Local installation

Follow these steps to set up the project from scratch.

```bash
# 1. Clone the repository
git clone https://github.com/jeffIshmael/wallet-profile.git
cd wallet-profile

# 2. Install workspace dependencies
npm install

# 3. Set up environment variables
cp web/.env.local.example web/.env

# 4. Build the OnFRA agent bundle
npm run build:agent --prefix web

# 5. Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment variables

Configure the following variables in `web/.env`.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID for authentication in the platform. |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `REPORTER_PRIVATE_KEY` | Backend relayer private key for publishing onchain report attestations. |
| `ONCHAIN_REPORTER_PROXY_ADDRESS` | Deployed OnchainReporter UUPS proxy address on Celo. |
| `OPENAI_API_KEY` | OpenAI API key used by the AI analysis agent. |
| `PINATA_JWT` | Pinata JWT for IPFS report pinning. |
| `PINATA_GATEWAY` | Pinata IPFS gateway URL. |

Optional variables for x402 paid tools and Chainstack RPC purchases through Buy:

| Variable | Description |
|---|---|
| `BUY_ENABLED` | Set to `true` to enable x402 payments through the Buy CLI. |
| `BUY_ACCOUNT` | Account name configured in the Buy CLI. |

## Testing the agent

After building the agent bundle, run the test script to execute all nine intelligence tools against a test wallet.

```bash
node scripts/test-agent.mjs [wallet_address] [tx_hash]
```

Example:

```bash
node scripts/test-agent.mjs 0x4821ced48fb4456055c86e42587f61c1f39c6315
```

The script executes the available intelligence tools, including:

- `analyze_wallet`
- `get_cash_flow_summary`
- `get_token_balances`
- `explain_transaction`

It prints a pass/fail table with response times.

Exit codes:

- `0` if all tools pass.
- `1` if at least one tool fails.

## Technology stack

| Component | Technology |
|---|---|
| **Agent framework** | LangChain |
| **AI intelligence** | OpenAI |
| **Web platform** | Next.js |
| **Blockchain** | Celo |
| **Smart contracts** | Solidity, Hardhat |
| **Agent identity** | ERC-8004 |
| **Payments** | x402, Buy |
| **Transaction tracing** | Chainstack RPC |
| **Report storage** | IPFS, Pinata |
| **Database** | PostgreSQL, Prisma |

## Roadmap

OnFRA is being developed as a reusable financial intelligence layer for the onchain economy.

Areas of continued development include:

- Expanding the agent's blockchain data retrieval and analysis capabilities.
- Improving conversational financial research and multi-turn context.
- Supporting additional blockchain networks.
- Making OnFRA's tools easier for external AI agents and applications to integrate.
- Expanding financial reporting and transaction statement capabilities.
- Developing more specialized financial intelligence workflows for individuals, organizations, and autonomous agents.

## License

MIT