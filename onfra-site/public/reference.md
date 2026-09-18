# OnFRA API reference (skill supplement)

Base URL: `https://app.onfra.xyz`

## Discovery

| Resource | Path |
|----------|------|
| MCP manifest | `/.well-known/mcp.json` |
| Agent card | `/.well-known/agent-card.json` |
| Capabilities | `/api/capabilities` |
| Health + payTo | `/api/health/integrations` |
| x402 config | `/api/x402/config` |
| llms.txt | `/llms.txt` |

## JSON schemas

| Schema | Path |
|--------|------|
| Analysis request | `/schemas/walletAnalysisRequest.schema.json` |
| Analysis result | `/schemas/walletAnalysisResult.schema.json` |
| Chat request | `/schemas/chatRequest.schema.json` |
| Statement request | `/schemas/statementRequest.schema.json` |
| Report request | `/schemas/reportRequest.schema.json` |
| Report result | `/schemas/reportResult.schema.json` |
| Lender screen request | `/schemas/lenderScreenRequest.schema.json` |
| Lender screen result | `/schemas/lenderScreenResult.schema.json` |
| Wallet signal result | `/schemas/walletSignalResult.schema.json` |

## Granular signals (cache reads — free)

Valid signal ids: `monthly-income`, `financial-health`, `reputation-score`, `loan-capacity`, `statement`, `assessment`.

```bash
curl -sS "${ONFRA_API_URL}/api/wallet/0xBorrower.../signals"
curl -sS "${ONFRA_API_URL}/api/wallet/0xBorrower.../signals/loan-capacity"
```

`POST /api/agent/analyze` accepts optional `fields` (`monthlyIncome`, `financialHealth`, `reputationScore`, `loanCapacity`, `statement`, `assessment`, `walletData`). Unpaid analyze returns **402**.

## Lender screen

```bash
curl -sS -X POST "${ONFRA_API_URL}/api/lender/screen" \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{"walletAddress": "0xBorrower..."}'
```

## Health & settlement address (free)

```bash
curl -sS "${ONFRA_API_URL}/api/health/integrations"
# → always HTTP 200; use top-level payTo / usdtSettlementAddress
curl -sS "${ONFRA_API_URL}/api/x402/config"
curl -sS "${ONFRA_API_URL}/api/capabilities"
```

## Environment variables for agents

| Variable | Purpose |
|----------|---------|
| `ONFRA_API_URL` | Override API base (default: production) |
| `AGENT_PRIVATE_KEY` / `CELO_PRIVATE_KEY` | Sign x402 payments |

## EIP-3009 payment sketch

```typescript
import { createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as Hex);
const client = createWalletClient({ account, chain: celo, transport: http() });

const { payTo } = await fetch("https://app.onfra.xyz/api/x402/config").then((r) => r.json());
// Sign EIP-3009 TransferWithAuthorization for USDT → payTo, then:
// headers: { "X-PAYMENT": JSON.stringify({ ...authorization, signature }) }
```

USDT on Celo: `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e`.

## On-chain contracts

| Contract | Address |
|----------|---------|
| OnchainReporter (REP attest/verify) | `0xE7621aF5dE3806ba26115bdC89190c65ed835C21` |
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| USDT (settlement) | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` |

## Error handling

- `402 Payment Required` — read `accepts[0]`, settle, retry with `X-PAYMENT`
- `400` — invalid wallet address or missing required fields
- `404` — no cached analysis or unknown REP id
- `status: "processing"` — analysis in flight; retry cached lookup
