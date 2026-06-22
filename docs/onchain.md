# Onchain Integration

Chainalyse registers verified financial reports on Celo mainnet and exposes OnFRA as an ERC-8004 discoverable agent.

## Deployed contracts (Celo mainnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **OnchainReporter** (UUPS proxy) | `0xE7621aF5dE3806ba26115bdC89190c65ed835C21` | [Celoscan](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |
| **ERC-8004 Identity Registry** | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | [Celoscan](https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) |
| **ERC-8004 Reputation Registry** | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | [Celoscan](https://celoscan.io/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63) |

## OnFRA ERC-8004 agent

| Field | Value |
|-------|-------|
| Agent ID | **9219** |
| Chain | Celo mainnet (42220) |
| 8004scan profile | [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219) |
| Agent URI | Served from `https://wallet-profile-orpin.vercel.app/.well-known/agent.json` |
| Agent card | `https://wallet-profile-orpin.vercel.app/.well-known/agent-card.json` |
| MCP manifest | `https://wallet-profile-orpin.vercel.app/.well-known/mcp.json` |

## OnchainReporter

The `OnchainReporter` contract is an upgradeable financial attestation registry. After a user purchases a verified financial passport, the Chainalyse backend relayer calls `publishFinancialReport()` with:

- Wallet subject and buyer addresses
- Reputation and financial health scores (0–100)
- Loan capacity label
- Report content hash (IPFS CID hash)

### Verification

Reports use verification codes in the format `REP-{reportId}`. Verification works two ways:

1. **Web UI** — paste the code at [wallet-profile-orpin.vercel.app/verify](https://wallet-profile-orpin.vercel.app/verify)
2. **Onchain** — call `verifyReport(reportId)` or `verifyReportByHash(reportHash)` on the proxy contract
3. **API** — `GET /api/agent/verify/{reportId}`

### Contract development

```bash
cd contracts/smart-contract
npm install
cp .env.example .env

npx hardhat test solidity
npx hardhat run scripts/deploy.ts --network celo
npx hardhat run scripts/upgrade.ts --network celo
```

See [`contracts/smart-contract/README.md`](../contracts/smart-contract/README.md) for deployment details.

## ERC-8004 registration

Scripts in `contracts/erc8004-agent/` register and update OnFRA metadata:

```bash
cd contracts/erc8004-agent
npm install
npm run register    # first-time registration
npm run set-uri     # update metadata URI
```

See [`contracts/erc8004-agent/README.md`](../contracts/erc8004-agent/README.md) for the full checklist.

## x402 micropayments

Premium actions use [x402](https://www.x402.org/) micropayments in USDT on Celo:

| Action | Price |
|--------|-------|
| External wallet analysis / chat | 0.01 USDT |
| Verified financial passport | 0.10 USDT |

Settlement is handled via Thirdweb. MiniPay users can pay directly from their wallet balance.

## Report lifecycle

1. User requests a verified report via dashboard or API
2. x402 payment is verified (0.10 USDT)
3. OnFRA compiles report content and renders PDF
4. PDF is pinned to IPFS (Pinata)
5. Backend relayer publishes attestation to OnchainReporter on Celo
6. User receives verification code, IPFS link, and Celoscan transaction hash
7. Lenders verify at `/verify` or via onchain/API calls
