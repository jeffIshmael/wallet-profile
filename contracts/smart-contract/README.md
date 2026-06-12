# OnchainReporter — Smart Contract

Upgradeable (UUPS) financial attestation registry for Wallet Analyst verified reports on Celo.

## Contract

`contracts/OnchainReporter.sol` stores lender-ready attestations published by an authorized backend reporter after x402 payment verification.

**Key functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `publishFinancialReport(...)` | `REPORTER_ROLE` | Publish attestation for a wallet |
| `verifyReport(reportId)` | public | Look up attestation by onchain ID |
| `verifyReportByHash(reportHash)` | public | Look up attestation by content hash |
| `getProfile(wallet)` | public | Latest attestation for a wallet |
| `setReporter(address)` | admin | Rotate backend reporter address |
| `pause()` / `unpause()` | admin | Emergency stop |

## Project layout

```
contracts/          OnchainReporter.sol + Solidity tests (*.t.sol)
scripts/            deploy.ts, upgrade.ts, utils/
deployments/        Per-network deployment records (proxy + implementation)
.openzeppelin/      OpenZeppelin upgrades manifest
hardhat.config.ts   Celo mainnet + Celo Sepolia networks
```

## Setup

```bash
npm install
```

Create `.env`:

```bash
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...   # for contract verification
REPORTER_ADDRESS=0x...  # optional; defaults to deployer
```

## Commands

```bash
# Solidity unit tests (Foundry-style *.t.sol)
npx hardhat test solidity

# Deploy UUPS proxy to Celo mainnet
npx hardhat run scripts/deploy.ts --network celo

# Upgrade to a new implementation
npx hardhat run scripts/upgrade.ts --network celo

# Verify on Celoscan (after deploy)
npx hardhat verify --network celo <implementation-address>
```

Re-running deploy skips if `deployments/celo.json` exists. Set `FORCE_REDEPLOY=1` to deploy a new proxy.

## Celo mainnet deployment

| | Address |
|---|---|
| Proxy | `0x50a8Fc322497e2EAc5489A64ce162E07Fb85E6AB` |
| Implementation | `0xA656BFda3EE51D30F21220936A72C7d0D7257BA9` |

The web backend calls `publishFinancialReport()` via the reporter private key configured in `web/.env` (`REPORTER_PRIVATE_KEY`).

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| `celo` | 42220 | `https://forno.celo.org` |
| `celo-sepolia` | 11142220 | `https://forno.celo-sepolia.celo-testnet.org/` |
