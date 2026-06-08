/** Shared chain, token, and x402 constants for Wallet Profile / OnFRA. */

export const CHAIN = "celo" as const;
export const CHAIN_ID = 42220;

/** Production deployment URL */
export const APP_BASE_URL = "https://wallet-profile-orpin.vercel.app";

export const AGENT_LOGO_PATH = "/agent_logo.png";

/** Celo mainnet ERC-8004 Identity Registry */
export const ERC8004_IDENTITY_REGISTRY =
  "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;

/** OnFRA agent ID on Celo mainnet Identity Registry */
export const ERC8004_AGENT_ID = 9219;

/** Celo Sepolia Identity Registry (testnet) */
export const ERC8004_IDENTITY_REGISTRY_SEPOLIA =
  "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;

export const USDC_CELO_MAINNET =
  "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as const;

export const USDT_CELO_MAINNET =
  "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as const;

export const PAYMENT_HEADER = "X-PAYMENT" as const;
export const PAYMENT_HEADER_ALIASES = ["PAYMENT-SIGNATURE", "x-payment"] as const;
export const AUTH_SCHEME = "x402" as const;

/** Micropayment pricing (USDT on Celo) */
export const PRICING = {
  externalWalletAnalysisUsdt: "0.05",
  chatQueryUsdt: "0.05",
  verifiedReportUsdt: "0.10",
  minimumUsdt: "0.01"
} as const;

export const ONFRA_DESCRIPTION =
  "OnFRA (OnChain Financial Reputation Agent) is an AI-powered financial intelligence agent that analyzes blockchain wallet activity to generate financial reputation insights, income stability assessments, portfolio risk analysis, and estimated loan capacity. The agent evaluates transaction history, cash flow patterns, wallet age, asset composition, and financial behavior to transform raw onchain data into lender-friendly financial intelligence. Outputs include Financial Health Scores, Wallet Reputation Scores, Income Stability classifications, Portfolio Risk Exposure analysis, AI-generated financial summaries, and borrowing capacity recommendations. OnFRA solves the proof-of-income problem for freelancers, remote workers, creators, DAO contributors, and crypto-native users whose earnings may not appear in traditional banking records. Users interact through the Wallet Profile platform to connect a wallet, view their financial profile, generate transaction statements, receive AI insights, purchase Verified Financial Reputation Reports, or query any wallet address directly. Initial release focuses on the Celo ecosystem; additional EVM chains planned.";

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return APP_BASE_URL;
}

export function getAgentLogoUrl(): string {
  return `${getAppBaseUrl()}${AGENT_LOGO_PATH}`;
}

export const AGENT = {
  name: "OnFRA — Wallet Profile Financial Intelligence Agent",
  shortName: "OnFRA",
  platform: "Wallet Profile",
  provider: "Wallet Profile",
  homepage: APP_BASE_URL,
  documentation: "https://github.com/jeffIshmael/wallet-profile",
  protocolVersion: "0.3.0",
  mcpVersion: "2026-06-08",
  appVersion: "1.0.0",
  category: "financial-reputation,proof-of-income,credit-scoring,microfinance",
  license: "MIT"
} as const;
