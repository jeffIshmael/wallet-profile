# OnchainReporter — Smart Contract

Upgradeable (UUPS) financial attestation registry for Chainalyse verified reports on Celo.

## Contract

`contracts/OnchainReporter.sol` stores lender-ready attestations published by an authorized backend reporter after x402 payment verification.

**Key functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `publishFinancialReport(..., reportId, reportHash)` | `REPORTER_ROLE` | Publish attestation with opaque `REP-XXXXXXXXXX` ID |
| `verifyReport(reportId)` | public | Look up attestation by opaque report ID |
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

### Breaking change: opaque report IDs (`REP-XXXXXXXXXX`)

Report IDs changed from sequential `uint256` to opaque strings. **You cannot upgrade the existing proxy in place** — OpenZeppelin will reject the storage layout change.

Deploy a **new proxy** and point the web backend at it:

```bash
# Recompile with optimizer (enabled in hardhat.config.ts), then deploy
npx hardhat clean && npx hardhat compile
FORCE_REDEPLOY=1 REPORTER_ADDRESS=0x... npx hardhat run scripts/deploy.ts --network celo
```

If gas estimation fails on Celo, the deploy script sets an 8M gas limit automatically. Top up deployer CELO if balance is low (~0.5+ CELO recommended).

Update `ONCHAIN_REPORTER_PROXY_ADDRESS` in `web/.env` with the new proxy from `deployments/celo.json`.

The previous proxy (`0x50a8Fc322497e2EAc5489A64ce162E07Fb85E6AB`) remains onchain with any legacy numeric-ID attestations.

## Celo mainnet deployment

| | Address |
|---|---|
| Proxy | `0xE7621aF5dE3806ba26115bdC89190c65ed835C21` |
| Implementation | `0xb1604Bf459bF7C1409074D34Cf652C3b3fD262A6` |

The web backend calls `publishFinancialReport()` via the reporter private key configured in `web/.env` (`REPORTER_PRIVATE_KEY`).

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| `celo` | 42220 | `https://forno.celo.org` |
| `celo-sepolia` | 11142220 | `https://forno.celo-sepolia.celo-testnet.org/` |
