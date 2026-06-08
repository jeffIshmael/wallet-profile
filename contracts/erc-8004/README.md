# ERC-8004 Contracts

Agent identity and registration contracts for **OnFRA** (Onchain Financial Reputation Agent), following the [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) agent standard.

## Contracts

| Contract | Description |
|----------|-------------|
| `Wallet ProfileAgentRegistry` | Agent registration and `agentURI` anchoring |

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
