# Contracts

Solidity smart contracts for Wallet Profile, split by concern:

| Package | Purpose |
|---------|---------|
| [`erc-8004/`](./erc-8004/) | [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) agent identity — OnFRA agent registration, reputation URI, and trust signals |
| [`normal/`](./normal/) | Core product contracts — report attestation, x402 payments, verification registry |

Each subdirectory is an independent Foundry project with its own `foundry.toml`, `src/`, `test/`, and `script/` folders.

### First-time Foundry setup

Install [Foundry](https://book.getfoundry.sh/getting-started/installation), then in each package:

```bash
cd contracts/erc-8004   # or contracts/normal
forge install foundry-rs/forge-std --no-git
forge build
forge test
```
