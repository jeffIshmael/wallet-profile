---
name: onfra-skill
description: >-
  Check Celo wallet financial reputation via OnFRA — income, health score,
  reputation score, loan capacity, statements, and REP passports. Use when the
  user asks to check a wallet, screen an address, verify financial reputation,
  analyze onchain activity, or query OnFRA / OnFRA API.
---

# OnFRA — Check Wallet Financial Reputation

OnFRA (Onchain Financial Reputation Agent) turns public Celo wallet activity into financial reputation signals. ERC-8004 agent **#9219** on Celo mainnet.

## When to use this skill

- User provides a Celo wallet address and wants financial reputation details
- User asks to verify a `REP-{id}` passport
- User wants income estimates, health score, reputation score, or loan capacity
- Agent needs to call OnFRA REST API or MCP tools

## Base URLs

| Surface | URL |
|---------|-----|
| API (production) | `https://app.onfra.xyz` |
| Marketing / docs | `https://onfra.xyz` |
| App | `https://app.onfra.xyz` |
| MCP manifest | `https://app.onfra.xyz/.well-known/mcp.json` |
| Agent card (A2A) | `https://app.onfra.xyz/.well-known/agent-card.json` |
| Capabilities | `https://app.onfra.xyz/api/capabilities` |
| Health + payTo | `https://app.onfra.xyz/api/health/integrations` |
| x402 config | `https://app.onfra.xyz/api/x402/config` |
| ERC-8004 registry | `https://8004scan.io/agents/celo/9219` |

Override `API_URL` with `ONFRA_API_URL` when testing locally.

## Quick flow

1. **Validate address** — must match `^0x[a-fA-F0-9]{40}$`
2. **Discover** — optional: `GET /api/capabilities` or MCP manifest
3. **Call API** with `curl` or MCP tool
4. **On 402** — read `payTo` / `accepts[0]`, settle USDT, retry with `X-PAYMENT`
5. **Summarize** scores and signals in plain language for the user
6. **Never invent** scores — only report fields returned by the API

## Auth model

- **No API keys.** Paid routes are gated by **x402** (USDT on Celo).
- Unpaid paid endpoints return **HTTP 402** with machine-readable fields: `payTo`, `asset`, `priceUsdt`, `maxAmountRequired`, `network`, `chainId`, `paymentHeader`, `accepts[]`, `retry`.
- Retry the **same** request with header `X-PAYMENT` (aliases: `PAYMENT-SIGNATURE`, `x-payment`).

### Example 402 body

```json
{
  "error": "Payment Required",
  "code": "PAYMENT_REQUIRED",
  "scheme": "x402",
  "network": "celo",
  "chainId": 42220,
  "asset": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
  "currencySymbol": "USDT",
  "priceUsdt": "0.01",
  "maxAmountRequired": "10000",
  "payTo": "<treasury>",
  "paymentHeader": "X-PAYMENT",
  "accepts": [{
    "scheme": "x402",
    "network": "celo",
    "chainId": 42220,
    "maxAmountRequired": "10000",
    "asset": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    "payTo": "<treasury>"
  }]
}
```

Live `payTo`: `GET /api/x402/config` or top-level `payTo` / `usdtSettlementAddress` on `GET /api/health/integrations` (always HTTP 200).

## Primary endpoint: analyze wallet (paid)

```bash
# 1) Quote — expect HTTP 402 with payTo / accepts
curl -sS -i -X POST "${ONFRA_API_URL:-https://app.onfra.xyz}/api/agent/analyze" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x..."}'

# 2) Pay + submit
curl -sS -X POST "${ONFRA_API_URL:-https://app.onfra.xyz}/api/agent/analyze" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{"walletAddress":"0x..."}'
```

### Key response fields

| Field | Meaning |
|-------|---------|
| `financialHealthScore` | 0–100 composite health |
| `financialHealthBreakdown` | incomeStability, savingsDiscipline, portfolioRisk, etc. |
| `reputationScore` | 0–100 wallet reputation |
| `reputationCategory` | Human label (e.g. Stable Earner) |
| `incomeLabel` | Income stability classification |
| `loanRange` | Suggested loan capacity range (USD) |
| `loanConfidence` | Confidence in loan estimate |
| `createdAt` | ISO timestamp of when the analysis was generated |
| `aiDashboardSummary` | Natural-language summary |

Schema: `https://app.onfra.xyz/schemas/walletAnalysisResult.schema.json`

## Cached lookup (free)

```bash
curl -sS "${ONFRA_API_URL:-https://app.onfra.xyz}/api/wallet/0x.../analysis"
```

## Granular signals (free from cache)

Valid `{signal}` values:

- `monthly-income`
- `financial-health`
- `reputation-score`
- `loan-capacity`
- `statement`
- `assessment`

```bash
curl -sS "${ONFRA_API_URL:-https://app.onfra.xyz}/api/wallet/0x.../signals"
curl -sS "${ONFRA_API_URL:-https://app.onfra.xyz}/api/wallet/0x.../signals/loan-capacity"
```

## Verify REP passport (free, onchain)

```bash
curl -sS "${ONFRA_API_URL:-https://app.onfra.xyz}/api/agent/verify/REP-X141GYYEUM"
```

Reads **OnchainReporter** (`0xE7621aF5dE3806ba26115bdC89190c65ed835C21`) on Celo.

## Generate verified report (paid, onchain attest)

**0.10 USDT** via x402. Publishes report hash via `OnchainReporter.publishFinancialReport`.

```bash
curl -sS -X POST "${ONFRA_API_URL:-https://app.onfra.xyz}/api/agent/report" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{"walletAddress":"0x..."}'
```

## Generate statement (paid)

**0.01 USDT**. `period` enum: `3M` | `6M` | `12M`.

```bash
curl -sS -X POST "${ONFRA_API_URL:-https://app.onfra.xyz}/api/agent/statement" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{"walletAddress":"0x...", "period":"6M"}'
```

Input schema: `https://app.onfra.xyz/schemas/statementRequest.schema.json`

## Natural-language query (paid)

```bash
curl -sS -X POST "${ONFRA_API_URL:-https://app.onfra.xyz}/api/agent/chat" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{"walletAddress":"0x...", "message":"What is this wallet'\''s reputation?"}'
```

## MCP tools (agent-native)

Discover tools + **inline inputSchema** from `https://app.onfra.xyz/.well-known/mcp.json`:

| Tool | Purpose | Price |
|------|---------|-------|
| `analyze_wallet` | Full reputation analysis | 0.01 USDT |
| `get_wallet_signal` | Cached signal read | free |
| `chat_query` | Natural-language wallet Q&A | 0.01 USDT |
| `generate_statement` | Statement PDF → IPFS (`3M`/`6M`/`12M`) | 0.01 USDT |
| `generate_report` | Verified REP passport (onchain attest) | 0.10 USDT |
| `verify_report` | Verify REP-{id} onchain | free |
| `screen_wallet` | Lender underwriting screen | 0.01 USDT |

## What executes on-chain

1. **USDT x402 settlement** — paid calls settle USDT to treasury `payTo` on Celo
2. **REP attestation** — `OnchainReporter.publishFinancialReport` after paid report
3. **REP verify** — `OnchainReporter.verifyReport` / `GET /api/agent/verify/{id}`
4. **ERC-8004 identity** — agent #9219 on Celo Identity Registry

Analysis itself reads **public** Celo wallet history (not a contract write).

## Pricing summary

- Analyze / chat / statement / lender screen: **0.01 USDT**
- Verified report: **0.10 USDT**
- Cached signals, cached analysis GET, verify, health, capabilities: **free**

## Agent behavior

- Explain results in plain language; lead with reputation score and income label
- Mention data is derived from **public onchain activity** on Celo
- On `402`, follow `retry.steps` — do not invent payment fields
- If `status` is `processing`, poll cached lookup or ask user to retry
- Do not share private keys or ask users to sign unrelated transactions
- For lender approve/decline flows, use `screen_wallet` — see `reference.md`

## Install this skill

```bash
npx skills add jeffIshmael/onfra-skill
```

Or clone:

```bash
git clone https://github.com/jeffIshmael/onfra-skill.git .agents/skills/onfra-skill
```

See [reference.md](reference.md) for lender screen, schemas, and EIP-3009 notes.
