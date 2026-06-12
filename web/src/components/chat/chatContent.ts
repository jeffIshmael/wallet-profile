export const AGENT_CHAT_NAME = "OnFRA agent";

export const MOCKUP_EXTERNAL_WALLET = "0xe3B6DE2bAc405cd0106C063e3215f641F7C6A057" as const;
export const MOCKUP_EXTERNAL_WALLET_SHORT = "0xe3B6...A057" as const;
export const MOCKUP_EXTERNAL_QUERY_PRICE = "0.01 USDT" as const;

export const AGENT_CHAT_PRICING_NOTICE =
  "Questions about your own wallet are free. Looking up another wallet costs 0.01 USDT. A full verified report is 0.1 USDT for any wallet.";

export const AGENT_CHAT_SUGGESTIONS = [
  "Why is my financial health low?",
  "How do I improve my loan capacity?",
  "Which token do I receive or spend more?",
  "Who are you and how can you help me?",
  `What's the monthly income of "${MOCKUP_EXTERNAL_WALLET_SHORT}"?`
] as const;

export const AGENT_CHAT_CAPABILITIES_CLAUDE = [
  { icon: "📉", text: "Understand why your financial health score is where it is" },
  { icon: "📈", text: "Get clear steps to improve loan limits and capacity" },
  { icon: "🔍", text: "Look up any wallet before you send funds or credit" },
  { icon: "📝", text: "Turn onchain activity into lender-ready explanations" }
] as const;

export const AGENT_CHAT_PRICING = [
  { action: "Your own wallet", price: "Free", highlight: true },
  { action: "External wallet query", price: "0.01 USDT", highlight: false },
  { action: "Full wallet report", price: "0.1 USDT", highlight: false }
] as const;

export type MockupMessage = { role: "user" | "ai"; text: string };

export type MockupScriptStep =
  | { type: "user"; text: string }
  | { type: "ai"; text: string }
  | {
      type: "payment";
      wallet: string;
      walletShort: string;
      amount: string;
      answer: string;
    };

/** Scripted demo: own-wallet questions are free, external lookup triggers x402 approval. */
export const PHONE_MOCKUP_SCRIPT: readonly MockupScriptStep[] = [
  { type: "user", text: "Why is my financial health so low?" },
  {
    type: "ai",
    text: "Your score is mainly dragged down by a thin savings buffer, uneven monthly inflows, and heavier exposure to volatile assets than most healthy wallets."
  },
  { type: "user", text: "What do I do to raise my loan limit to $2,000?" },
  {
    type: "ai",
    text: "Build a 90-day record of steady inflows, keep a larger stablecoin buffer, and reduce concentrated risk. Lenders usually reward that pattern with higher capacity."
  },
  {
    type: "user",
    text: `What's the est. loan capacity for "${MOCKUP_EXTERNAL_WALLET_SHORT}"?`
  },
  {
    type: "payment",
    wallet: MOCKUP_EXTERNAL_WALLET,
    walletShort: MOCKUP_EXTERNAL_WALLET_SHORT,
    amount: MOCKUP_EXTERNAL_QUERY_PRICE,
    answer: `Estimated loan capacity for ${MOCKUP_EXTERNAL_WALLET_SHORT} is $1,400–$1,850, based on six months of stablecoin inflows and moderate portfolio risk.`
  }
];
