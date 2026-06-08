# ERC-8004 Agent Registration — Wallet Profile / OnFRA

This folder holds on-chain registration metadata and scripts for **OnFRA** (Onchain Financial Reputation Agent).

## Discovery files (served by Next.js)

| URL | Purpose |
|-----|---------|
| `/.well-known/agent.json` | ERC-8004 `#registration-v1` metadata (on-chain `agentURI` target) |
| `/.well-known/agent-card.json` | A2A agent card (capabilities, x402 pricing, skills) |
| `/.well-known/mcp.json` | MCP tool discovery manifest |
| `/schemas/*.schema.json` | Request/result JSON schemas |

Source of truth for schemas: [`../schemas/`](../schemas/) — copy to `web/public/schemas/` after edits.

Constants: [`../web/src/lib/blockchain/constants.ts`](../web/src/lib/blockchain/constants.ts)

## Pre-registration checklist

1. Deploy the web app so all `/.well-known/*` URLs resolve publicly.
2. Set `NEXT_PUBLIC_APP_URL=https://wallet-profile-orpin.vercel.app` (or your deployment URL).
3. Validate JSON (no trailing commas):
   - `GET /.well-known/agent.json`
   - `GET /.well-known/agent-card.json`
   - `GET /.well-known/mcp.json`
4. **Pin `agent.json` to IPFS** — ERC-8004 validators expect a content-addressed `agentURI` (`ipfs://` or `data:`), not mutable `https://`.
5. Update `agent-registration.json` if service versions change.

## Register on Celo mainnet

**Identity Registry:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`

```bash
# After pinning agent.json to IPFS:
export AGENT_IPFS_URI="ipfs://QmYourCidHere"
export PRIVATE_KEY="0x..."
export RPC_URL="https://forno.celo.org"

node erc8004-agent/scripts/register.mjs
```

The script calls `register(string agentURI)` on the ERC-8004 Identity Registry and prints the transaction hash.

### Testnet (Celo Sepolia)

Identity Registry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`

Set `CHAIN_ID=11142220` and use a Sepolia RPC URL.

## API routes (MCP → HTTP)

| MCP tool | Route |
|----------|-------|
| `analyze_wallet` | `POST /api/agent/analyze` |
| `chat_query` | `POST /api/agent/chat` |
| `generate_report` | `POST /api/agent/report` |
| `verify_report` | `GET /api/agent/verify/{reportId}` |

x402 enforcement is off by default. Set `X402_ENFORCE=true` and `THIRDWEB_SECRET_KEY` in production.

**Pricing:** External wallet analysis / chat query — 0.05 USDT · Verified Financial Reputation Report — 0.10 USDT

## Consistency

When changing manifests, verify:

- [ ] `name` matches across `agent.json`, `agent-card.json`, `mcp.json`, and `agent-registration.json`
- [ ] x402 chain/token/header identical in agent-card and mcp `auth`
- [ ] MCP tool schemas match `schemas/*.schema.json`
- [ ] Bump `mcp.json` `version` and agent-card `protocolVersion`; update `agent-registration.json` `services[].version`
- [ ] Copy updated schemas to `web/public/schemas/`

See also: [`../well-known-manifests.md`](../well-known-manifests.md) (Earnbase template — adapted for Wallet Profile).
