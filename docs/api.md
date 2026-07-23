# API Reference

OnFRA exposes financial-reputation infrastructure through REST API routes and ERC-8004 / MCP discovery manifests. Onfra is the reference borrower UI.

**Base URL:** [https://app.onfra.xyz](https://app.onfra.xyz)

**Lender integration guide:** [/developers](https://app.onfra.xyz/developers)

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

Full URLs: `https://app.onfra.xyz/schemas/{filename}`

## x402 payment headers

Paid endpoints require an x402 payment signature in the `X-PAYMENT` header (aliases: `PAYMENT-SIGNATURE`, `x-payment`). Settlement is handled by the **Celo x402 facilitator** at `https://api.x402.celo.org/settle`.

Configure enforcement with `X402_ENFORCE=true`, `X402_API_KEY`, and `X402_PAY_TO` in the web app environment.

### How it works

The Celo facilitator accepts USDC and USDT via gasless **EIP-3009 `transferWithAuthorization`** — the caller signs an authorization off-chain, and the facilitator submits it on-chain and pays the gas itself. No custodying of funds: tokens move directly payer → payee inside the token contract.

### Backend / agent callers (private key signing)

When a **backend service or AI agent** calls paid OnFRA endpoints programmatically (not through a browser wallet), it needs a private key to sign the EIP-3009 authorization. The caller signs the payment authorization, builds the `X-PAYMENT` payload, and attaches it to the request.

**Required on the calling side:**
- A funded USDC or USDT balance on Celo mainnet
- A private key (backend service key or agent wallet key) — never expose this client-side
- The `x402` client library (e.g. `wrapFetchWithPayment` from `x402-js`) **or** manual EIP-3009 signing

**Environment variable pattern for agent integrators:**

```bash
AGENT_PRIVATE_KEY=0x...          # Wallet that pays for x402 calls
X402_PAY_TO=0x...                # OnFRA treasury address (from /api/x402/config)
```

**Minimal TypeScript example (EIP-3009 signing with viem):**

```typescript
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, toHex, parseUnits, keccak256 } from "viem";
import { celo } from "viem/chains";

const USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
const FACILITATOR = "https://api.x402.celo.org";
const ONFRA_API = "https://app.onfra.xyz";

const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
const client = createWalletClient({ chain: celo, transport: http(), account });

// 1. Get the pay-to address from OnFRA
const { publicPayTo } = await fetch(`${ONFRA_API}/api/x402/config`).then(r => r.json());

// 2. Sign an EIP-3009 transferWithAuthorization
const nonce = keccak256(toHex(Date.now()));
const validBefore = BigInt(Math.floor(Date.now() / 1000) + 60 * 5); // 5 min
const signature = await client.signTypedData({
  domain: { name: "USDC", version: "2", chainId: 42220, verifyingContract: USDC },
  types: {
    TransferWithAuthorization: [
      { name: "from", type: "address" }, { name: "to", type: "address" },
      { name: "value", type: "uint256" }, { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" }, { name: "nonce", type: "bytes32" }
    ]
  },
  primaryType: "TransferWithAuthorization",
  message: {
    from: account.address, to: publicPayTo,
    value: parseUnits("0.01", 6), // 0.01 USDC
    validAfter: 0n, validBefore, nonce
  }
});

// 3. Build the x402 payment payload and call OnFRA
const payment = JSON.stringify({ from: account.address, to: publicPayTo,
  value: parseUnits("0.01", 6).toString(), validAfter: "0",
  validBefore: validBefore.toString(), nonce, signature, token: USDC });

const result = await fetch(`${ONFRA_API}/api/agent/analyze`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-PAYMENT": payment },
  body: JSON.stringify({ walletAddress: "0xBorrower...", callerAddress: account.address })
});
```

> **Note:** USDT uses `name: "Tether USD", version: "1"` in the EIP-712 domain. USDC uses `name: "USDC", version: "2"`.

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
curl -X POST https://app.onfra.xyz/api/lender/screen \
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
curl -X POST https://app.onfra.xyz/api/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0xYourWalletAddress"}'
```

For external wallet queries, include the x402 payment header after obtaining a payment signature.

Optional `fields` returns a subset without full `walletData`:

```bash
curl -X POST 'https://app.onfra.xyz/api/agent/analyze?fields=loanCapacity,reputationScore' \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-signature>" \
  -d '{"walletAddress": "0xBorrowerWallet..."}'
```

Allowed field keys: `monthlyIncome`, `financialHealth`, `reputationScore`, `loanCapacity`, `statement`, `assessment`, `walletData`.

## Example: read one signal (cache)

After a wallet has been analyzed, individual signals are free cache reads:

```bash
# List signals + cache status
curl https://app.onfra.xyz/api/wallet/0xYourWalletAddress/signals

# Loan capacity only
curl https://app.onfra.xyz/api/wallet/0xYourWalletAddress/signals/loan-capacity
```

Signal ids: `monthly-income`, `financial-health`, `reputation-score`, `loan-capacity`, `statement`, `assessment`.

Returns `404` with a hint to `POST /api/agent/analyze` when cache is missing or expired. One x402 charge per wallet refresh window applies to `analyze`, not per signal read.

## Example: verify report

```bash
curl https://app.onfra.xyz/api/agent/verify/REP-X141GYYEUM
```

Returns wallet address, scores, report hash, IPFS CID, and onchain attestation status.
