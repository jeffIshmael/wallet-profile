---
name: onfra-skill
description: >-
  Check Celo wallet financial reputation via OnFRA — income, health score,
  reputation score, loan capacity, cash flows, token breakdown, statements, and plain-language
  transaction explanations. Powered by OnFRA MCP at https://app.onfra.xyz/api/mcp.
---

# OnFRA — Check Wallet Financial Reputation & Financial Intelligence

OnFRA (Onchain Financial Reputation Agent) turns public Celo blockchain activity into structured financial intelligence, cash flow analyses, reputation scores, and transaction explanations. ERC-8004 agent **#9219** on Celo mainnet.

## When to use this skill

- User provides a Celo wallet address and wants financial intelligence, activity profile, or cash flows
- User asks for income estimates, financial health, reputation score, or loan capacity
- User wants a spending breakdown, token breakdown, or period-over-period comparison
- User wants a plain-language explanation of a Celo transaction hash
- User requests an official PDF/CSV transaction statement pinned to IPFS
- Agent connects via MCP to OnFRA tools

## Base Endpoints

| Service | Endpoint | Protocol |
|---------|----------|----------|
| **MCP Server (Streamable HTTP)** | `https://app.onfra.xyz/api/mcp` | MCP (Model Context Protocol) |
| REST API | `https://app.onfra.xyz/api` | HTTPS REST |
| App / Dashboard | `https://app.onfra.xyz` | Web UI |
| Marketing / Docs | `https://onfra.xyz` | Web UI |
| ERC-8004 Registry | `https://8004scan.io/agents/celo/9219` | ERC-8004 Scanner |
| Capabilities | `https://app.onfra.xyz/api/capabilities` | JSON |
| Health & Settlement Config | `https://app.onfra.xyz/api/health/integrations` | JSON |

---

## MCP Server Setup

Connect OnFRA directly to your AI agent or MCP client (Claude Code, Cursor, Windsurf, Antigravity, etc.):

```json
{
  "mcpServers": {
    "onfra": {
      "url": "https://app.onfra.xyz/api/mcp"
    }
  }
}
```

The MCP server supports Streamable HTTP (`GET`, `POST`, `OPTIONS`) and is directly accessible by external agents and web scanners (like [8004scan.io](https://8004scan.io/agents/celo/9219)).

---

## OnFRA MCP Tools (10 Available Tools)

OnFRA exposes 10 financial intelligence tools: 8 free tools and 2 x402-micropayment tools.

### 1. `analyze_wallet` (Free)
Flagship financial intelligence profile of a wallet: overview, total received/sent, token mix, activity level, and structured insights.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address (`0x...`, 40 hex characters)
  - `chain` (*enum: "celo", required*): Blockchain. Default `celo`.
  - `period` (*string, optional*): Analysis period. `7d`, `30d`, `90d` (default), `1y`, `all-time`, `YYYY-MM`, or `YYYY-MM-DD/YYYY-MM-DD`.
- **Response**: `wallet_overview` (age in days, transactions, active days, counterparties), `financial_summary` (received USD, sent USD, net flow USD), `token_overview` (dominant token and share), `activity` (activity level, most active days), and `insights`.

### 2. `get_cash_flow_summary` (Free)
Inflow, outflow, and net cash flow in USD for a given period, with transaction counts, daily averages, and trend direction. Swaps and self-transfers are cleanly excluded.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `period` (*string, optional*): e.g. `30d` (default), `7d`, `90d`, `1y`
  - `start_date` (*string, optional*): Explicit range start `YYYY-MM-DD`
  - `end_date` (*string, optional*): Explicit range end `YYYY-MM-DD`
  - `currency` (*string, optional*): Default `USD`

### 3. `get_token_balances` (Free)
Current token holdings with USD valuations (stablecoins and CELO priced; other tokens listed with unit balances). Automatically discovers tokens from the wallet's history.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `include_spam` (*boolean, optional*): Include suspected airdrop/spam tokens (default `false`)
  - `include_prices` (*boolean, optional*): Value stablecoins & CELO in USD (default `true`)

### 4. `get_token_breakdown` (Free)
Shows how wallet activity is distributed across tokens by balance, received, sent, or total volume.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `period` (*string, optional*): Default `90d`
  - `metric` (*enum: "volume" | "balance" | "received" | "sent", optional*): Default `volume`

### 5. `compare_periods` (Free)
Compares two time windows (inflow, outflow, net flow, transaction count) and computes percentage changes.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `current_period` (*string, required*): e.g. `30d`, `2026-10`, or `YYYY-MM-DD/YYYY-MM-DD`
  - `previous_period` (*string, required*): Format matching current period
  - `metrics` (*array of enums, optional*): `["inflow", "outflow", "net_flow", "transaction_count"]`

### 6. `get_spending_breakdown` (Free)
Analyzes outgoing funds, grouping by token, counterparty, protocol, or category.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `period` (*string, optional*): Default `90d`
  - `group_by` (*enum: "token" | "counterparty" | "protocol" | "category", optional*): Default `token`

### 7. `get_dominant_counterparties` (Free)
Ranks the top entities and addresses that the wallet interacts with by volume or frequency.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `period` (*string, optional*): Default `90d`
  - `limit` (*integer, optional*): Number of results (1–50, default 10)
  - `sort_by` (*enum: "volume" | "frequency", optional*): Default `volume`

### 8. `get_wallet_activity` (Free)
Assesses activity rhythm: transaction count, active days, first/last activity timestamps, frequency classification (`dormant`, `sporadic`, `regular`, `frequent`), and activity trend.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `period` (*string, optional*): Default `90d`

### 9. `generate_transaction_statement` (Paid — 0.01 USDT via x402)
Generates an official PDF or CSV statement for the wallet and period, pins the file to public IPFS, and returns the IPFS CID, gateway URL, sha256 checksum, and summary.
- **Parameters**:
  - `wallet_address` (*string, required*): Celo wallet address
  - `chain` (*enum: "celo", required*): Blockchain
  - `period` (*string, optional*): `30d`, `90d` (default), or `1y`
  - `format` (*enum: "pdf" | "csv", optional*): Default `pdf`
  - `currency` (*string, optional*): Default `USD`

### 10. `explain_transaction` (Paid — 0.02 USDT via x402)
Decodes a Celo transaction in plain language. If it is an ERC-20 or native transfer, it explains token flow and amounts directly from the public node. If it is **not an ERC-20 transfer** (DEX swap, DeFi protocol interaction, contract call, or reverted call), it executes a trace via Buy to explain internal calls and error reasons.
- **Parameters**:
  - `transaction_hash` (*string, required*): `0x` + 64 hex characters
  - `chain` (*enum: "celo", required*): Blockchain
  - `wallet_address` (*string, optional*): Perspective wallet (renders "You sent..." instead of addresses)
  - `use_trace` (*boolean, optional*): Whether to purchase an RPC call trace for complex txs (default `true`)

---

## x402 Payment Model for Paid Tools

1. When calling a paid tool without payment, the server responds with **HTTP 402 Payment Required** containing `payTo` address, `asset` (USDT contract on Celo), and `priceUsdt`.
2. Settle the payment via USDT transfer or authorization on Celo.
3. Retry the request including the header:
   ```http
   X-PAYMENT: <settlement-tx-hash-or-signature>
   ```

---

## Example REST Invocations

### Analyze a Wallet (Free)
```bash
curl -sS -X POST "https://app.onfra.xyz/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyze_wallet",
      "arguments": {
        "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
        "chain": "celo",
        "period": "30d"
      }
    }
  }'
```

### Cash Flow Summary (Free)
```bash
curl -sS -X POST "https://app.onfra.xyz/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_cash_flow_summary",
      "arguments": {
        "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
        "chain": "celo",
        "period": "30d"
      }
    }
  }'
```

### Explain a Transaction (Paid via x402)
```bash
curl -sS -X POST "https://app.onfra.xyz/api/mcp" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: 0x<tx-hash-of-0.02-usdt-settlement>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "explain_transaction",
      "arguments": {
        "transaction_hash": "0x16b72ba76249e227c80bf25bacb34e327c327c60c663db436d70b700c908d35e",
        "chain": "celo"
      }
    }
  }'
```

---

## Installation

### Via Skills CLI
```bash
npx skills add jeffIshmael/onfra-skill
```

### Via Git Clone
```bash
git clone https://github.com/jeffIshmael/onfra-skill.git .agents/skills/onfra-skill
```
