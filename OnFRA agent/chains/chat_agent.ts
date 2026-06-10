import { createAgent } from "langchain";
import { ChatGoogle } from "@langchain/google";
import { fetchWalletTransactions, fetchWalletProtocols, fetchOnchainData } from "../tools/fetch_onchain_data.js";
import { fetchOnchainBalances as fetchWalletBalances } from "../tools/fetch_onchain_balances.js";
import { computeFinancialHealth } from "../tools/compute_financial_health.js";
import { computeReputationScore } from "../tools/compute_reputation_score.js";
import { riskExposure } from "../tools/risk_exposure.js";
import { incomeStability } from "../tools/income_stability.js";
import { loanCapacity } from "../tools/loan_capacity.js";
import { wrapWithX402, deductUser, getUserBalance, getActiveUserWallet, InsufficientBalanceError } from "../middleware/x402_billing.js";
import { SYSTEM_PROMPT } from "../prompts/system_prompt.js";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// Wrap all tools with X402 microbilling (costing 0.05 USDT per query)
const BILLING_COST = 0.05;

const tools = [
  wrapWithX402(fetchWalletBalances, BILLING_COST),
  wrapWithX402(fetchWalletTransactions, BILLING_COST),
  wrapWithX402(fetchWalletProtocols, BILLING_COST),
  wrapWithX402(computeFinancialHealth, BILLING_COST),
  wrapWithX402(computeReputationScore, BILLING_COST),
  wrapWithX402(riskExposure, BILLING_COST),
  wrapWithX402(incomeStability, BILLING_COST),
  wrapWithX402(loanCapacity, BILLING_COST),
];

export function getChatAgent(apiKey?: string) {
  const actualApiKey = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!actualApiKey) {
    console.warn("[ChatAgent] No GOOGLE_API_KEY or GEMINI_API_KEY found. Chat Agent will run in mock simulation mode.");
    return null;
  }

  const model = new ChatGoogle({
    model: "gemini-1.5-flash",
    apiKey: actualApiKey,
    temperature: 0.3,
  });

  return createAgent({
    model,
    tools,
    systemPrompt: SYSTEM_PROMPT,
  });
}

export async function runChatAgent(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  apiKey?: string
): Promise<string> {
  const agent = getChatAgent(apiKey);
  
  // Format history to LangChain messages
  const messages = history.map(h => {
    if (h.role === "assistant") return new AIMessage(h.content);
    if (h.role === "system") return new SystemMessage(h.content);
    return new HumanMessage(h.content);
  });

  if (!agent) {
    // Return a mock chat simulation if no API key is set
    console.log("[ChatAgent] Simulating chat response (mock mode)...");
    const lastUserQuery = history.filter(h => h.role === "user").pop()?.content || "";
    
    // Simulate what the agent would do
    // 1. Run fetchOnchainData mock
    // 2. Formulate response based on user query keywords
    let response = "";
    const lowerQuery = lastUserQuery.toLowerCase();
    
    // Default mock address
    const mockAddress = "0x742d35cc6634c0532925a3b844bc454e4438f44e";
    const addressMatch = lastUserQuery.match(/0x[a-fA-F0-9]{40}/);
    const targetAddress = addressMatch ? addressMatch[0] : mockAddress;

    // Charge user for query
    const userWallet = getActiveUserWallet();
    console.log(`[X402 Billing] Attempting to charge ${BILLING_COST} USDT from wallet ${userWallet} for mock chat query...`);
    const success = deductUser(userWallet, BILLING_COST);
    if (!success) {
      const bal = getUserBalance(userWallet);
      throw new InsufficientBalanceError(
        `Insufficient balance. Chat query costs ${BILLING_COST} USDT. Your balance is ${bal} USDT. Please top up.`
      );
    }
    console.log(`[X402 Billing] Successfully charged ${BILLING_COST} USDT. Remaining balance: ${getUserBalance(userWallet)} USDT.`);

    // Run tools for billing check side effects
    await fetchOnchainData.invoke({ walletAddress: targetAddress });

    if (lowerQuery.includes("spend") || lowerQuery.includes("loan") || lowerQuery.includes("borrow")) {
      const capJson = await loanCapacity.invoke({ walletAddress: targetAddress });
      const cap = JSON.parse(capJson);
      response = `According to our loan capacity analysis for ${targetAddress}, your safe borrowing range is estimated at ${cap.safeLoanRange} with a ${cap.confidence} confidence level. Spending or borrowing beyond this may stress your liquidity ratios.`;
    } else if (lowerQuery.includes("health") || lowerQuery.includes("score")) {
      const healthJson = await computeFinancialHealth.invoke({ walletAddress: targetAddress });
      const health = JSON.parse(healthJson);
      response = `Your wallet's financial health score is currently ${health.financialHealthScore}%. This is supported by an income stability rating of ${health.breakdown.incomeStability}/100 and savings discipline of ${health.breakdown.savingsDiscipline}/100. Let me know if you'd like suggestions on how to improve this.`;
    } else if (lowerQuery.includes("reputation") || lowerQuery.includes("trust")) {
      const repJson = await computeReputationScore.invoke({ walletAddress: targetAddress });
      const rep = JSON.parse(repJson);
      response = `The wallet reputation score for ${targetAddress} is ${rep.reputationScore}/100, placing it in the "${rep.trustCategory}" category. ${rep.rationale}`;
    } else {
      response = `Hello! I am Wallet Profile AI, your onchain financial reputation analyst. I can inspect wallets and tell you about their financial health, loan capacity, and trust ratings. Try asking "What is the financial health for my wallet?" or "Can I trust ${mockAddress}?".`;
    }

    return response;
  }

  // Run the actual ReAct Agent
  const result = await agent.invoke({ messages });
  const finalMessage = result.messages[result.messages.length - 1];
  return String((finalMessage as { content?: unknown }).content ?? "");
}
