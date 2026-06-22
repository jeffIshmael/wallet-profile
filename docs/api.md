# API Reference

Chainalyse exposes OnFRA capabilities through REST API routes and ERC-8004 / MCP discovery manifests.

**Base URL:** [https://wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app)

## Endpoints

| Method | Route | Description | Pricing |
|--------|-------|-------------|---------|
| `POST` | `/api/agent/analyze` | Full wallet analysis | Own wallet: free · External: 0.01 USDT |
| `POST` | `/api/agent/chat` | Conversational wallet queries | Own wallet: free · External: 0.01 USDT |
| `POST` | `/api/agent/report` | Verified report + onchain attestation | 0.10 USDT |
| `GET` | `/api/agent/verify/{reportId}` | Verify report by `REP-{id}` or hash | Free |
| `GET` | `/api/health/integrations` | Integration health check | Free |
| `GET` | `/api/stats` | Platform usage metrics | Free |
| `GET` | `/api/wallet/{address}/analysis` | Cached analysis lookup | Free |

## JSON schemas

Request and response schemas are the single source of truth in `web/public/schemas/`:

| Schema | URL |
|--------|-----|
| Wallet analysis request | `/schemas/walletAnalysisRequest.schema.json` |
| Wallet analysis result | `/schemas/walletAnalysisResult.schema.json` |
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

## Example: analyze wallet

```bash
curl -X POST https://wallet-profile-orpin.vercel.app/api/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0xYourWalletAddress"}'
```

For external wallet queries, include the x402 payment header after obtaining a payment signature.

## Example: verify report

```bash
curl https://wallet-profile-orpin.vercel.app/api/agent/verify/REP-X141GYYEUM
```

Returns wallet address, scores, report hash, IPFS CID, and onchain attestation status.
