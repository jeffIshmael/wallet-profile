import { runAnalysisChain } from "./chains/analysis_chain.js";
import { runChatAgent } from "./chains/chat_agent.js";
import { generateFullReport } from "./chains/report_chain.js";
import { fetchOnchainData } from "./tools/fetch_onchain_data.js";
import { fetchOnchainBalances as fetchWalletBalances } from "./tools/fetch_onchain_balances.js";
import {
  getActiveUserWallet,
  setActiveUserWallet,
  getUserBalance,
  topUpUser,
  InsufficientBalanceError,
} from "./middleware/x402_billing.js";

async function main() {
  console.log("================================================================================");
  console.log("             CHAINSCORE AI - ONCHAIN FINANCIAL REPUTATION AGENT                 ");
  console.log("================================================================================\n");

  const sampleUserWallet = "0x4821ced48Fb4456055c86E42587f61c1F39c6315";
  const sampleTargetWallet = "0x4821ced48Fb4456055c86E42587f61c1F39c6315";

  // Seeding the user wallet address
  setActiveUserWallet(sampleUserWallet);
  console.log(`[Setup] Active User Wallet Address: ${getActiveUserWallet()}`);
  console.log(`[Setup] Seeded Balance: ${getUserBalance(sampleUserWallet)} USDT\n`);

  console.log("--------------------------------------------------------------------------------");
  console.log("1. WALLET ANALYSIS CHAIN (Sequential Chain for Dashboard)");
  console.log("--------------------------------------------------------------------------------");
  try {
    const dashboard = await runAnalysisChain(sampleTargetWallet);
    console.log(`\nWallet Analysis Results for: ${dashboard.walletAddress}`);
    console.log(`- ENS Address:           ${dashboard.ens || "None"}`);
    console.log(`- Financial Health:      ${dashboard.financialHealthScore}%`);
    console.log(`- Reputation Score:      ${dashboard.reputationScore}/100 (${dashboard.reputationCategory})`);
    console.log(`- Risk Category:         ${dashboard.riskCategory}`);
    console.log(`- Income Profile:        ${dashboard.incomeLabel}`);
    console.log(`- Est. Monthly Inflow:   $${dashboard.incomeMetrics.monthlyIncomeEstimateUsd} USD`);
    console.log(`- Safe Loan Range:       ${dashboard.loanRange}`);
    console.log(`\n[AI Dashboard Summary]:`);
    console.log(dashboard.aiDashboardSummary);
    console.log("\n[AI Attestation Paragraph]:");
    console.log(dashboard.aiAttestation);
  } catch (error) {
    console.error("Error running wallet analysis:", error);
  }
  console.log("");

  console.log("--------------------------------------------------------------------------------");
  console.log("2. CHAT AGENT (ReAct Agent Executor with X402 Micropayments)");
  console.log("--------------------------------------------------------------------------------");
  try {
    // 0.05 USDT per query
    console.log(`User asks: "What's hurting my financial health?"`);
    let chatHistory: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      { role: "user", content: `What's hurting my financial health for ${sampleTargetWallet}?` }
    ];
    let response = await runChatAgent(chatHistory);
    console.log(`\n[Agent Response]:\n${response}\n`);

    console.log(`User asks: "Can I safely borrow 500 USD?"`);
    chatHistory.push({ role: "assistant", content: response });
    chatHistory.push({ role: "user", content: `Can I safely borrow 500 USD for ${sampleTargetWallet}?` });
    response = await runChatAgent(chatHistory);
    console.log(`\n[Agent Response]:\n${response}\n`);

    console.log(`User Wallet Balance after chat queries: ${getUserBalance(sampleUserWallet)} USDT`);
  } catch (error) {
    console.error("Error running chat agent:", error);
  }
  console.log("");

  console.log("--------------------------------------------------------------------------------");
  console.log("3. PREMIUM OFFICIAL REPORT GENERATION (X402 Billing Cost 0.1 USDT)");
  console.log("--------------------------------------------------------------------------------");
  try {
    const reportResult = await generateFullReport(sampleTargetWallet);
    console.log(`\nReport Compiled Successfully!`);
    console.log(`- Report ID: ${reportResult.reportId}`);
    console.log(`- Status:    ${reportResult.status}`);
    console.log(`- Location:  ${reportResult.filePath}`);
    console.log(`- Message:   ${reportResult.message}`);
    console.log(`\nRemaining User Wallet Balance: ${getUserBalance(sampleUserWallet)} USDT`);
  } catch (error) {
    console.error("Error generating premium report:", error);
  }
  console.log("");

  console.log("--------------------------------------------------------------------------------");
  console.log("4. TESTING INSUFFICIENT BALANCE REJECTION & TOP UP");
  console.log("--------------------------------------------------------------------------------");
  try {
    console.log(`Setting active user wallet to a new wallet with 0.00 USDT balance...`);
    const emptyWallet = "0x1111111111111111111111111111111111111111";
    setActiveUserWallet(emptyWallet);
    // Explicitly set balance to 0 (default seed is 1.0)
    topUpUser(emptyWallet, -getUserBalance(emptyWallet));
    console.log(`New Wallet: ${emptyWallet}`);
    console.log(`Balance:    ${getUserBalance(emptyWallet)} USDT`);

    console.log(`\nAttempting to ask a chat query costing 0.05 USDT...`);
    await runChatAgent([{ role: "user", content: "What is my reputation score?" }]);
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      console.log(`\n[Success] Caught Expected Error: ${error.message}`);
      
      console.log(`\nTopping up wallet by 0.50 USDT...`);
      topUpUser(getActiveUserWallet(), 0.50);
      console.log(`New Balance: ${getUserBalance(getActiveUserWallet())} USDT`);

      console.log(`\nRetrying chat query after top up...`);
      const response = await runChatAgent([{ role: "user", content: "What is my reputation score?" }]);
      console.log(`\n[Agent Response]:\n${response}`);
      console.log(`\nFinal Wallet Balance: ${getUserBalance(getActiveUserWallet())} USDT`);
    } else {
      console.error("Unexpected error:", error);
    }
  }
  console.log("\n================================================================================");
}

async function trialMain() {
  console.log("================================================================================");
  console.log("             CHAINSCORE AI - ONCHAIN FINANCIAL REPUTATION AGENT                 ");
  console.log("================================================================================\n");

  const sampleUserWallet = "0x4821ced48Fb4456055c86E42587f61c1F39c6315";
  const sampleTargetWallet = "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae";

  // Seeding the user wallet address
  setActiveUserWallet(sampleUserWallet);
  console.log(`[Setup] Active User Wallet Address: ${getActiveUserWallet()}`);
  // console.log(`[Setup] Seeded Balance: ${getUserBalance(sampleUserWallet)} USDT\n`);

  console.log("--------------------------------------------------------------------------------");
  console.log("1. WALLET ANALYSIS CHAIN (Sequential Chain for Dashboard)");
  console.log("--------------------------------------------------------------------------------");
  try {
    const rawDataJson = await fetchWalletBalances.invoke({ walletAddress: sampleUserWallet });
    console.log(rawDataJson);
    const rawData = JSON.parse(rawDataJson);
    console.log(rawData);
    console.log(`\nThe raw data Results for: ${rawData}`);
 
  } catch (error) {
    console.error("Error running wallet analysis:", error);
  }

  console.log("\n================================================================================");
}

main().catch(console.error);
