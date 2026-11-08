# OnFRA API Reference

**OnFRA — Onchain Financial Intelligence Agent**

Base URL: `https://app.onfra.xyz`

MCP Server: `https://app.onfra.xyz/api/mcp`

Version: `2026-11-05`

## 1. Discovery

| Resource | Path |
|---|---|
| MCP manifest | `/.well-known/mcp.json` |
| Agent card | `/.well-known/agent-card.json` |
| Capabilities | `/api/capabilities` |
| Health and settlement address | `/api/health/integrations` |
| x402 configuration | `/api/x402/config` |
| LLM documentation | `/llms.txt` |

All discovery endpoints are free.

## 2. MCP Connection

OnFRA exposes a Streamable HTTP MCP server that allows external AI agents and MCP-compatible clients to discover and call its tools.

```json
{
  "mcpServers": {
    "onfra": {
      "url": "https://app.onfra.xyz/api/mcp"
    }
  }
}
```

## 3. Available Tools

OnFRA exposes 11 tools covering wallet analysis, cash flow, token holdings, spending, transaction explanations, statements, and natural-language financial queries.

### Free tools

| Tool | Description | Route |
|---|---|---|
| `analyze_wallet` | Generates a structured wallet profile, financial summary, token overview, activity insights, and data quality information. | `POST /api/agent/tools/analyze_wallet` |
| `get_cash_flow_summary` | Calculates total inflows, outflows, net flow, transaction counts, daily averages, and trends. | `POST /api/agent/tools/get_cash_flow_summary` |
| `get_token_balances` | Retrieves current token holdings, normalized token information, and USD valuations. | `POST /api/agent/tools/get_token_balances` |
| `get_token_breakdown` | Breaks down wallet activity by token, using balance, received, sent, or volume metrics. | `POST /api/agent/tools/get_token_breakdown` |
| `compare_periods` | Compares financial activity between two periods, including inflows, outflows, net flow, and transaction counts. | `POST /api/agent/tools/compare_periods` |
| `get_spending_breakdown` | Analyzes outgoing transactions by token, counterparty, protocol, or spending category. | `POST /api/agent/tools/get_spending_breakdown` |
| `get_dominant_counterparties` | Identifies and ranks the addresses and entities a wallet interacts with most. | `POST /api/agent/tools/get_dominant_counterparties` |
| `get_wallet_activity` | Analyzes transaction frequency, active days, first and last activity, and wallet activity trends. | `POST /api/agent/tools/get_wallet_activity` |

Free tools are subject to fair-use rate limits.

### Paid tools

| Tool | Price | Description |
|---|---:|---|
| `generate_transaction_statement` | 0.01 USDT | Generates a PDF or CSV transaction statement, pins it to IPFS, and returns its CID, URI, gateway URL, checksum, and summary. |
| `explain_transaction` | 0.02 USDT | Explains a blockchain transaction in plain language, including token movements, parties, transaction type, gas, classifications, and warnings. |

Both tools use x402 payment settlement when called by external agents or API clients. They are free inside the OnFRA application.

### Natural-language chat

| Tool | Price | Route |
|---|---:|---|
| `chat_query` | 0.01 USDT for external-wallet queries | `POST /api/agent/chat` |

`chat_query` accepts natural-language questions about wallet financial activity and uses OnFRA's analysis tools to generate answers.

- External-wallet queries through agent/API access cost 0.01 USDT.
- Questions about the caller's own wallet inside the OnFRA app are free.
- If a query requires another paid tool, such as transaction explanation or statement generation, the corresponding tool charge also applies.

## 4. JSON Schemas

All schemas are publicly accessible from the production application.

Base schema URL:

`https://app.onfra.xyz/schemas/`

### Wallet analysis

| Schema | Path |
|---|---|
| Analyze wallet request | `/schemas/analyze_walletRequest.schema.json` |
| Analyze wallet result | `/schemas/walletAnalysisResult.schema.json` |

### Cash flow

| Schema | Path |
|---|---|
| Cash flow request | `/schemas/get_cash_flow_summaryRequest.schema.json` |
| Cash flow result | `/schemas/cashFlowSummaryResult.schema.json` |

### Token balances

| Schema | Path |
|---|---|
| Token balances request | `/schemas/get_token_balancesRequest.schema.json` |
| Token balances result | `/schemas/tokenBalancesResult.schema.json` |

### Token breakdown

| Schema | Path |
|---|---|
| Token breakdown request | `/schemas/get_token_breakdownRequest.schema.json` |
| Token breakdown result | `/schemas/tokenBreakdownResult.schema.json` |

### Period comparison

| Schema | Path |
|---|---|
| Compare periods request | `/schemas/compare_periodsRequest.schema.json` |
| Compare periods result | `/schemas/comparePeriodsResult.schema.json` |

### Spending breakdown

| Schema | Path |
|---|---|
| Spending breakdown request | `/schemas/get_spending_breakdownRequest.schema.json` |
| Spending breakdown result | `/schemas/spendingBreakdownResult.schema.json` |

### Counterparties

| Schema | Path |
|---|---|
| Dominant counterparties request | `/schemas/get_dominant_counterpartiesRequest.schema.json` |
| Counterparties result | `/schemas/counterpartiesResult.schema.json` |

### Wallet activity

| Schema | Path |
|---|---|
| Wallet activity request | `/schemas/get_wallet_activityRequest.schema.json` |
| Wallet activity result | `/schemas/walletActivityResult.schema.json` |

### Transaction statements

| Schema | Path |
|---|---|
| Transaction statement request | `/schemas/generate_transaction_statementRequest.schema.json` |
| Transaction statement result | `/schemas/statementResult.schema.json` |

### Transaction explanations

| Schema | Path |
|---|---|
| Explain transaction request | `/schemas/explain_transactionRequest.schema.json` |
| Explain transaction result | `/schemas/explainTransactionResult.schema.json` |

### Natural-language chat

| Schema | Path |
|---|---|
| Chat request | `/schemas/chatRequest.schema.json` |

The chat tool does not currently advertise a separate output schema in the MCP manifest.

## 5. Common Tool Parameters

All wallet-analysis tools operate on Celo today.

### Wallet address

```json
{
  "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
  "chain": "celo"
}
```

- `wallet_address`: Required 42-character EVM wallet address.
- `chain`: Required blockchain identifier. Currently only `celo` is supported.

### Supported periods

Depending on the tool, supported periods include:

- `7d` — Last 7 days.
- `30d` — Last 30 days.
- `90d` — Last 90 days.
- `1y` — Last year.
- `all-time` — Entire available history.
- `YYYY-MM` — Specific calendar month.
- `YYYY-MM-DD/YYYY-MM-DD` — Explicit date range, where supported.

### Custom date ranges

Cash flow summaries also support:

- `start_date`: Start date in `YYYY-MM-DD`.
- `end_date`: End date in `YYYY-MM-DD`.
- `currency`: Reporting currency, default `USD`.

When both custom dates are supplied, they take precedence over the named period.

## 6. Tool-Specific Parameters

### `analyze_wallet`

Required:
- `wallet_address`
- `chain`

Optional:
- `period`

Returns a structured wallet profile containing:

- Wallet overview and transaction history.
- Total received, total sent, and net flow.
- Token overview and dominant token.
- Wallet activity patterns.
- Financial insights.
- Data quality and limitations.

### `get_cash_flow_summary`

Required:
- `wallet_address`
- `chain`
- `period`

Optional:
- `start_date`
- `end_date`
- `currency` (default `USD`)

Returns inflows, outflows, net flow, transaction counts, averages, and trends.

### `get_token_balances`

Required:
- `wallet_address`
- `chain`

Optional:
- `include_spam` (default `false`)
- `include_prices` (default `true`)

Returns current token holdings and available USD valuations.

### `get_token_breakdown`

Required:
- `wallet_address`
- `chain`

Optional:
- `period`
- `metric`: `balance`, `received`, `sent`, or `volume` (default `volume`).

Separates current holdings from historical token transaction volume.

### `compare_periods`

Required:
- `wallet_address`
- `chain`
- `current_period`
- `previous_period`

Optional:
- `metrics`: Array containing `inflow`, `outflow`, `net_flow`, and `transaction_count`.

Returns period comparisons, percentage changes, and insights. Incomplete comparison windows are flagged.

### `get_spending_breakdown`

Required:
- `wallet_address`
- `chain`
- `period`

Optional:
- `group_by`: `token`, `counterparty`, `protocol`, or `category` (default `category`).

Returns an organized breakdown of outgoing funds, including classifications and confidence levels where available.

### `get_dominant_counterparties`

Required:
- `wallet_address`
- `chain`

Optional:
- `period`
- `limit`: 1–50 (default `10`).
- `sort_by`: `volume` or `frequency` (default `volume`).

Returns the most significant wallet interactions, with entity labels where known.

### `get_wallet_activity`

Required:
- `wallet_address`
- `chain`

Optional:
- `period`

Returns:
- Transaction count.
- Active days.
- First and last activity.
- Activity frequency: `dormant`, `sporadic`, `regular`, or `frequent`.
- Activity trend.

### `generate_transaction_statement`

Required:
- `wallet_address`
- `chain`
- `period`

Optional:
- `format`: `pdf` or `csv` (default `pdf`).
- `currency` (default `USD`).

Returns a generated statement and its IPFS reference, including:

- IPFS CID.
- `ipfs://` URI.
- HTTPS gateway URL.
- SHA-256 checksum.
- Transaction summary.

The statement is pinned to IPFS. Its CID is returned only after upload verification.

Price: `0.01 USDT` via x402 for external agents and API clients.

### `explain_transaction`

Required:
- `transaction_hash`
- `chain`

Optional:
- `wallet_address`: Wallet perspective for the explanation.
- `use_trace`: Whether to purchase a transaction call trace for complex transactions (default `true`).

Explains:
- Transaction type.
- Token movements and amounts.
- Sender and recipient.
- Gas information.
- Contract interactions.
- Transaction classification and confidence.
- Warnings and failure reasons where applicable.

Supports transfers, swaps, contract calls, liquidity interactions, NFTs, bridges, and failed transactions.

For complex transactions, OnFRA can purchase an RPC call trace through the Buy gateway to provide additional execution context.

Price: `0.02 USDT` via x402.

### `chat_query`

Required:
- `message`

Optional:
- `wallet_address`
- `chain`
- `history`

The `message` field contains the user's natural-language question. `wallet_address` is required for wallet-specific queries.

The `history` array supports previous conversation messages with `role` and `content` fields.

Price: `0.01 USDT` for external-wallet queries through agent/API access. Inside the OnFRA app, queries about the caller's own wallet are free.

## 7. x402 Payment Model

OnFRA uses x402 micropayments for paid tools and external-wallet chat queries.

### Network configuration

| Parameter | Value |
|---|---|
| Protocol | x402 |
| Network | Celo |
| Chain ID | `42220` |
| Currency | USDT |
| Payment header | `X-PAYMENT` |
| Settlement currency address | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` |
| Configuration endpoint | `/api/x402/config` |
| Health endpoint | `/api/health/integrations` |

### Pricing

| Operation | Price |
|---|---:|
| Free wallet-analysis tools | Free |
| Transaction statement | 0.01 USDT |
| Transaction explanation | 0.02 USDT |
| External-wallet chat query | 0.01 USDT |
| Own-wallet chat inside the app | Free |

### Payment flow

1. Call a paid tool or external-wallet query.
2. If payment is required, the server responds with HTTP `402 Payment Required`.
3. Read the payment details from the response, especially `accepts[0]`.
4. Retrieve the settlement address (`payTo`) and payment configuration.
5. Sign an EIP-3009 USDT `TransferWithAuthorization` for the required amount and recipient.
6. Retry the same request with the payment payload in the `X-PAYMENT` header.

The payment-required response may contain:

- `payTo`
- `asset`
- `priceUsdt`
- `maxAmountRequired`
- `network`
- `chainId`
- `paymentHeader`
- `accepts`
- `retry`

Always use the current payment details returned by the server. Do not hardcode the treasury address or payment amount.

### Example payment response

```json
{
  "error": "Payment Required",
  "code": "PAYMENT_REQUIRED",
  "scheme": "x402",
  "network": "celo",
  "chainId": 42220,
  "asset": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
  "currencySymbol": "USDT",
  "priceUsdt": "0.02",
  "maxAmountRequired": "20000",
  "payTo": "<from /api/x402/config>",
  "paymentHeader": "X-PAYMENT"
}
```

The example above represents a 0.02 USDT payment. The amount in `maxAmountRequired` is denominated in the token's smallest units.

## 8. REST API Examples

All tool requests use JSON over HTTPS.

### Analyze a wallet (free)

```bash
curl -sS -X POST \
  "https://app.onfra.xyz/api/agent/tools/analyze_wallet" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    "chain": "celo",
    "period": "90d"
  }'
```

### Get cash flow summary (free)

```bash
curl -sS -X POST \
  "https://app.onfra.xyz/api/agent/tools/get_cash_flow_summary" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    "chain": "celo",
    "period": "30d",
    "currency": "USD"
  }'
```

### Compare two periods (free)

```bash
curl -sS -X POST \
  "https://app.onfra.xyz/api/agent/tools/compare_periods" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    "chain": "celo",
    "current_period": "2026-10",
    "previous_period": "2026-09"
  }'
```

### Get spending breakdown (free)

```bash
curl -sS -X POST \
  "https://app.onfra.xyz/api/agent/tools/get_spending_breakdown" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    "chain": "celo",
    "period": "30d",
    "group_by": "category"
  }'
```

### Generate transaction statement (paid)

```bash
curl -sS -X POST \
  "https://app.onfra.xyz/api/agent/tools/generate_transaction_statement" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-payment-payload>" \
  -d '{
    "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    "chain": "celo",
    "period": "90d",
    "format": "pdf",
    "currency": "USD"
  }'
```

### Explain a transaction (paid)

```bash
curl -sS -X POST \
  "https://app.onfra.xyz/api/agent/tools/explain_transaction" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-payment-payload>" \
  -d '{
    "transaction_hash": "0xabababababababababababababababababababababababababababababababab",
    "chain": "celo",
    "use_trace": true
  }'
```

### Ask OnFRA a natural-language question

```bash
curl -sS -X POST \
  "https://app.onfra.xyz/api/agent/chat" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-payment-payload>" \
  -d '{
    "message": "How much did this wallet receive and spend in the last 30 days?",
    "wallet_address": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
    "chain": "celo"
  }'
```

For external-wallet queries, use the 0.01 USDT x402 pricing. Additional paid tool operations may incur separate charges.

## 9. Response Conventions and Data Provenance

OnFRA returns structured JSON rather than prose-only responses.

Result schema fields include `x-origin` metadata to distinguish the nature of the information.

| Origin | Meaning |
|---|---|
| `observed` | Data read directly from the blockchain. |
| `calculated` | Totals, averages, percentages, and metrics computed by OnFRA. |
| `classified` | Categories or labels assigned by OnFRA, sometimes with confidence levels. |
| `interpreted` | Plain-language interpretation generated by OnFRA. |

### Data provenance

Where available, results include:

- `period`: Requested analysis period.
- `data_source`: Source of the underlying information.
- `data_last_updated`: Last data update.
- `generated_at`: Report generation timestamp.
- `data_quality.limitations`: Known limitations affecting the result.

Agents should preserve these distinctions when presenting results. In particular, calculated values, classifications, and interpretations should not be presented as direct blockchain observations.

OnFRA reports uncertainty where transaction purpose or classification cannot be established reliably.

## 10. Environment Variables

| Variable | Purpose |
|---|---|
| `ONFRA_API_URL` | Optional API base URL override. Defaults to `https://app.onfra.xyz`. |
| `AGENT_PRIVATE_KEY` | Agent wallet private key used to sign x402 payments. |
| `CELO_PRIVATE_KEY` | Alternative Celo wallet private key configuration. |

Private keys must be stored securely and must never be exposed in frontend code, logs, or public repositories.

## 11. On-chain Infrastructure

| Component | Details |
|---|---|
| Network | Celo Mainnet |
| Chain ID | `42220` |
| Settlement token | USDT |
| USDT contract | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` |
| Agent identity | ERC-8004 Agent #9219 |
| Transaction tracing | Buy gateway, with Chainstack call traces for complex transactions |

Agent identity:

`https://8004scan.io/agents/celo/9219`

OnFRA uses ERC-8004 for its agent identity and x402 for paid interactions with external agents and API clients.

## 12. Health and Integration Checks

These endpoints are free and do not require x402 payment.

```bash
# Integration health and settlement address
curl -sS \
  "https://app.onfra.xyz/api/health/integrations"

# x402 payment configuration
curl -sS \
  "https://app.onfra.xyz/api/x402/config"

# Available tools and capabilities
curl -sS \
  "https://app.onfra.xyz/api/capabilities"
```

Use the health endpoint to retrieve the current `payTo` or `usdtSettlementAddress`. Do not assume a settlement address from an old configuration.

## 13. Error Handling

| Response | Meaning | Recommended action |
|---|---|---|
| `400 Bad Request` | Invalid wallet address, transaction hash, or missing/invalid parameters. | Validate the request against the corresponding input schema. |
| `402 Payment Required` | Payment is required for the requested operation. | Read `accepts[0]`, settle the required amount, and retry with `X-PAYMENT`. |
| `404 Not Found` | Requested resource or route was not found. | Verify the endpoint and requested resource. |
| `429 Too Many Requests` | Fair-use rate limit reached. | Respect rate limits before retrying. |
| `5xx` | Server-side failure. | Retry appropriately and check the health endpoint. |

## 14. Additional Resources

| Resource | URL |
|---|---|
| OnFRA application | https://app.onfra.xyz |
| Official website | https://onfra.xyz |
| MCP endpoint | https://app.onfra.xyz/api/mcp |
| Capabilities | https://app.onfra.xyz/api/capabilities |
| x402 configuration | https://app.onfra.xyz/api/x402/config |
| Integration health | https://app.onfra.xyz/api/health/integrations |
| ERC-8004 agent identity | https://8004scan.io/agents/celo/9219 |
| MCP manifest | https://app.onfra.xyz/.well-known/mcp.json |

**Install the OnFRA skill**

Via Skills CLI:

```bash
npx skills add jeffIshmael/onfra-skill
```

Via Git:

```bash
git clone https://github.com/jeffIshmael/onfra-skill.git .agents/skills/onfra-skill
```

---

**OnFRA — An AI agent that turns on-chain transactions into understandable financial information for individuals, teams, treasuries, analysts, and other AI agents.**