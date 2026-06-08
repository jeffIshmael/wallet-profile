# Normal Contracts

Core Wallet Profile product contracts deployed on Celo — report attestation, verification, and payment flows.

## Contracts

| Contract | Description |
|----------|-------------|
| `Wallet ProfileAttestation` | Onchain storage for financial report hashes and verification codes |

## Development

Requires [Foundry](https://book.getfoundry.sh/getting-started/installation).

```bash
forge build
forge test
```

## Deploy (Celo Alfajores example)

```bash
forge script script/Deploy.s.sol --rpc-url celo_alfajores --broadcast
```
