import "dotenv/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatUpgrades from "@openzeppelin/hardhat-upgrades";
import { configVariable, defineConfig } from "hardhat/config";

function deployerAccounts(): string[] {
  const key = process.env.PRIVATE_KEY?.trim();
  return key ? [key] : [];
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin, hardhatUpgrades],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  },
  networks: {
    // Celo Mainnet
    celo: {
      type: "http",
      url: "https://forno.celo.org",
      accounts: deployerAccounts(),
      chainId: 42220
    },
    // Celo Sepolia Testnet
    "celo-sepolia": {
      type: "http",
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: deployerAccounts(),
      chainId: 11142220,
    },
    // Local development
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  chainDescriptors: {
    42220: {
      name: "Celo",
      blockExplorers: {
        etherscan: {
          name: "Celoscan",
          url: "https://celoscan.io",
          apiUrl: "https://api.etherscan.io/v2/api?chainid=42220",
        },
      },
    },
    11142220: {
      name: "Celo Sepolia",
      blockExplorers: {
        etherscan: {
          name: "Celo Sepolia Scan",
          url: "https://sepolia.celoscan.io/",
          apiUrl: "https://api.etherscan.io/v2/api?chainid=11142220",
        },
      },
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
  },
});
