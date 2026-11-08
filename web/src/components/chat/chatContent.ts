
export const AGENT_CHAT_NAME = "OnFRA Agent";

export const MOCKUP_EXTERNAL_WALLET =
  "0xe3B6DE2bAc405cd0106C063e3215f641F7C6A057" as const;

export const MOCKUP_EXTERNAL_WALLET_SHORT = "0xe3B6...A057" as const;

export const MOCKUP_EXTERNAL_QUERY_PRICE = "0.01 USDT" as const;

export const AGENT_CHAT_PRICING_NOTICE =
  "Querying an external wallet costs 0.01 USDT. For example: What's the monthly income of 0xe3B6...A057?";

export const AGENT_CHAT_SUGGESTIONS = [
  "Which token did I receive the most this month?",
  "How does this month's income compare to last month?",
  "Which token did I spend the most this month?",
  "Summarize my wallet activity for the past 30 days.",
  "Generate my transaction statement for the past 3 months.",
  `What's the monthly income of "${MOCKUP_EXTERNAL_WALLET_SHORT}"?`
] as const;

export const AGENT_CHAT_CAPABILITIES_CLAUDE = [
  {
    icon: "📊",
    text: "Understand your income, spending, and wallet activity"
  },
  {
    icon: "📈",
    text: "Compare cash flow and track financial activity over time"
  },
  {
    icon: "🔍",
    text: "Analyze wallet activity and explore external addresses"
  },
  {
    icon: "📝",
    text: "Generate organized transaction statements and reports"
  }
] as const;

export const AGENT_CHAT_PRICING = [
  { action: "Your connected wallet", price: "Free", highlight: true },
  { action: "External wallet query", price: "0.01 USDT", highlight: false },
  { action: "Full wallet report", price: "0.1 USDT", highlight: false }
] as const;

export type MockupMessage = {
  role: "user" | "ai";
  text: string;
};

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

/**
 * Scripted demo:
 * Questions about your connected wallet are free.
 * External wallet queries trigger x402 payment approval.
 */
export const PHONE_MOCKUP_SCRIPT: readonly MockupScriptStep[] = [
  {
    type: "user",
    text: "How much did I receive and spend this month?"
  },
  {
    type: "ai",
    text: "Here's your wallet activity for this month: I've organized your incoming and outgoing transactions, identified your most received and spent tokens, and summarized your overall cash flow."
  },
  {
    type: "user",
    text: "How does my income compare to last month?"
  },
  {
    type: "ai",
    text: "Your income summary is ready. I've compared incoming transactions across both months, highlighted the difference in total value, and identified the tokens contributing most to your income."
  },
  {
    type: "user",
    text: `What's the monthly income of "${MOCKUP_EXTERNAL_WALLET_SHORT}"?`
  },
  {
    type: "payment",
    wallet: MOCKUP_EXTERNAL_WALLET,
    walletShort: MOCKUP_EXTERNAL_WALLET_SHORT,
    amount: MOCKUP_EXTERNAL_QUERY_PRICE,
    answer: `Here's the monthly income summary for ${MOCKUP_EXTERNAL_WALLET_SHORT}. I've analyzed its incoming transactions, identified the tokens received, and organized the results into a clear financial summary.`
  }
];
