# API Reference

OnFRA exposes financial-reputation infrastructure through REST API routes and ERC-8004 / MCP discovery manifests. Chainalyse is the reference borrower UI.

**Base URL:** [https://wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app)

**Lender integration guide:** [/developers](https://wallet-profile-orpin.vercel.app/developers)

## Endpoints

| Method | Route | Description | Pricing |
|--------|-------|-------------|---------|
| `POST` | `/api/lender/screen` | **Lender underwriting screen** — trust + reputation + average monthly income + loan capacity | 0.01 USDT (lender wallet via x402) |
| `POST` | `/api/agent/analyze` | Full wallet analysis | Own wallet: free · External: 0.01 USDT |
| `POST` | `/api/agent/chat` | Conversational wallet queries | Own wallet: free · External: 0.01 USDT |
| `POST` | `/api/agent/report` | Verified report + onchain attestation | 0.10 USDT |
| `GET` | `/api/agent/verify/{reportId}` | Verify report by `REP-{id}` or hash | Free |
| `GET` | `/api/health/integrations` | Integration health check | Free |
| `GET` | `/api/stats` | Platform usage metrics | Free |
| `GET` | `/api/wallet/{address}/analysis` | Cached full `walletData` lookup | Free |
| `GET` | `/api/wallet/{address}/signals` | List available signal ids + cache status | Free |
| `GET` | `/api/wallet/{address}/signals/{signal}` | One reputation signal from cache | Free |

## JSON schemas

Request and response schemas are the single source of truth in `web/public/schemas/`:

| Schema | URL |
|--------|-----|
| Lender screen request | `/schemas/lenderScreenRequest.schema.json` |
| Lender screen result | `/schemas/lenderScreenResult.schema.json` |
| Wallet analysis request | `/schemas/walletAnalysisRequest.schema.json` |
| Wallet analysis result | `/schemas/walletAnalysisResult.schema.json` |
| Wallet signal result | `/schemas/walletSignalResult.schema.json` |
| Chat request | `/schemas/chatRequest.schema.json` |
| Report request | `/schemas/reportRequest.schema.json` |
| Report result | `/schemas/reportResult.schema.json` |

Full URLs: `https://wallet-profile-orpin.vercel.app/schemas/{filename}`

## x402 payment headers

Paid endpoints require an x402 payment signature in the `X-PAYMENT` header (aliases: `PAYMENT-SIGNATURE`, `x-payment`). Settlement is in USDT on Celo mainnet.

Configure enforcement with `X402_ENFORCE=true` and Thirdweb credentials in the web app environment.

## Agent discovery

### ERC-8004 manifests

| Manifest | Path |
|----------|------|
| Agent URI | `/.well-known/agent.json` |
| Agent card (A2A) | `/.well-known/agent-card.json` |
| MCP tools | `/.well-known/mcp.json` |

### OnFRA on 8004scan

[8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219)

## Example: screen borrower (lenders)

```bash
curl -X POST https://wallet-profile-orpin.vercel.app/api/lender/screen \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{
    "walletAddress": "0xBorrowerWallet...",
    "callerAddress": "0xYourLenderWallet..."
  }'
```

Returns `trust.isTrustworthy`, wallet reputation (score + category), average monthly income estimate, and loan capacity range/confidence. Also includes optional REP passport verification metadata.

## Example: analyze wallet

```bash
curl -X POST https://wallet-profile-orpin.vercel.app/api/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0xYourWalletAddress"}'
```

For external wallet queries, include the x402 payment header after obtaining a payment signature.

Optional `fields` returns a subset without full `walletData`:

```bash
curl -X POST 'https://wallet-profile-orpin.vercel.app/api/agent/analyze?fields=loanCapacity,reputationScore' \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{"walletAddress": "0xBorrowerWallet..."}'
```

Allowed field keys: `monthlyIncome`, `financialHealth`, `reputationScore`, `loanCapacity`, `statement`, `assessment`, `walletData`.

## Example: read one signal (cache)

After a wallet has been analyzed, individual signals are free cache reads:

```bash
# List signals + cache status
curl https://wallet-profile-orpin.vercel.app/api/wallet/0xYourWalletAddress/signals

# Loan capacity only
curl https://wallet-profile-orpin.vercel.app/api/wallet/0xYourWalletAddress/signals/loan-capacity
```

Signal ids: `monthly-income`, `financial-health`, `reputation-score`, `loan-capacity`, `statement`, `assessment`.

Returns `404` with a hint to `POST /api/agent/analyze` when cache is missing or expired. One x402 charge per wallet refresh window applies to `analyze`, not per signal read.

## Example: verify report

```bash
curl https://wallet-profile-orpin.vercel.app/api/agent/verify/REP-X141GYYEUM
```

Returns wallet address, scores, report hash, IPFS CID, and onchain attestation status.
