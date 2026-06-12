# Contracts

Solidity contracts and onchain tooling for Chainalyse, split into two packages:

| Package | Stack | Purpose |
|---------|-------|---------|
| [`smart-contract/`](./smart-contract/) | Hardhat 3 + OpenZeppelin UUPS | **OnchainReporter** — upgradeable financial attestation registry on Celo |
| [`erc8004-agent/`](./erc8004-agent/) | Node.js scripts | **ERC-8004 registration** — register and update OnFRA agent metadata on Celo |

## OnchainReporter (`smart-contract/`)

The core product contract. Authorized reporters (backend relayer) call `publishFinancialReport()` after payment verification to store:

- Wallet subject and buyer addresses
- Reputation and financial health scores (0–100)
- Loan capacity label
- Report content hash

Anyone can verify attestations via `verifyReport(reportId)` or `verifyReportByHash(reportHash)`.

**Deployed on Celo mainnet:**

- Proxy: `0x50a8Fc322497e2EAc5489A64ce162E07Fb85E6AB`
- Deployment record: `smart-contract/deployments/celo.json`

```bash
cd smart-contract
npm install
cp .env.example .env   # PRIVATE_KEY, ETHERSCAN_API_KEY

# Run Solidity tests
npx hardhat test solidity

# Deploy (first time)
npx hardhat run scripts/deploy.ts --network celo

# Upgrade implementation
npx hardhat run scripts/upgrade.ts --network celo
```

## ERC-8004 agent registration (`erc8004-agent/`)

Scripts to register OnFRA on the Celo Identity Registry and update its `agentURI` (IPFS metadata).

OnFRA is registered as agent **#9219** on Celo mainnet. Discovery manifests are served by the web app under `/.well-known/`.

```bash
cd erc8004-agent
npm install
# Set AGENT_IPFS_URI and PRIVATE_KEY in .env
npm run register    # first-time registration
npm run set-uri     # update metadata URI
```

See [`erc8004-agent/README.md`](./erc8004-agent/README.md) for the full registration checklist.
