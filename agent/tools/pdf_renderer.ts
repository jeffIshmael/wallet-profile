import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const pdfRenderer = tool(
  async ({ reportJson }) => {
    const report = JSON.parse(reportJson);
    const { reportId, timestamp, identity, threeMonthStatement, financialSummary, financialHealth, incomeAnalysis, loanSuitability, riskAssessment, aiSummary, verification } = report;

    // Create a text-based "PDF mock" output file
    const docContent = `
================================================================================
                     CHAINSCORE AI - FINANCIAL REPORT
================================================================================
Report ID: ${reportId}
Timestamp: ${timestamp}
--------------------------------------------------------------------------------
1. IDENTITY & BLOCKCHAIN INTERACTION
   - Wallet Address:     ${identity.walletAddress}
   - Connected ENS:      ${identity.ens}
   - Active Chains:      ${identity.activeChains.join(", ")}
   - Wallet Age:         ${identity.walletAgeMonths} months

2. FINANCIAL SUMMARY
   - Portfolio Value:    $${financialSummary.portfolioValue.toLocaleString()} USD
   - Stablecoin Balance: $${financialSummary.stablecoinHoldings.toLocaleString()} USD
   - Total Inflow:       $${financialSummary.totalInflow.toLocaleString()} USD
   - Total Outflow:      $${financialSummary.totalOutflow.toLocaleString()} USD
   - Avg Monthly Inflow: $${financialSummary.averageMonthlyInflow.toLocaleString()} USD
   - Protocols Used:     ${financialSummary.activeProtocolsCount}

2.1 3-MONTH CASH FLOW STATEMENT (LIPA MDOGO MDOGO COMPLIANCE)
   - 3-Month Total Inflow:   $${(threeMonthStatement?.totalInflowUsd || 0).toLocaleString()} USD
   - 3-Month Total Outflow:  $${(threeMonthStatement?.totalOutflowUsd || 0).toLocaleString()} USD
   - Net Cash Flow:          $${(threeMonthStatement?.netFlowUsd || 0).toLocaleString()} USD
   - Transaction Count:      ${threeMonthStatement?.transactionCount || 0} transactions
   - Micro-repayment Status: ${incomeAnalysis.funLabel === "Stable Earner" || incomeAnalysis.funLabel === "Whale Activity" ? "Highly Eligible" : incomeAnalysis.funLabel === "Growing Wallet" || incomeAnalysis.funLabel === "Seasonal Earner" ? "Eligible" : "Needs Review"}

3. FINANCIAL HEALTH SCORES
   - Financial Health:   ${financialHealth.financialHealthScore}% / 100%
   - Wallet Reputation:  ${financialHealth.reputationScore} / 100
   - Portfolio Risk:     ${financialHealth.riskCategory}
   - Income Stability:   ${financialHealth.stabilityScore} / 100

4. INCOME & CASHFLOW ANALYSIS
   - Monthly Inflow Est: $${incomeAnalysis.estimatedMonthlyEarnings.toLocaleString()} USD
   - Inflow Consistency: ${incomeAnalysis.consistencyAnalysis}
   - Income Profile:     ${incomeAnalysis.funLabel}
   - Recurring Inflows:  ${incomeAnalysis.recurringInflows ? "Yes (Detected)" : "No (Irregular)"}

5. LOAN SUITABILITY & CAPABILITY
   - Safe Borrowing Cap: ${loanSuitability.estimatedSafeBorrowingCapacity}
   - Scoring Confidence: ${loanSuitability.confidenceLevel}

6. RISK ASSESSMENT
   - Volatile Assets:    ${riskAssessment.volatilityExposure}
   - DeFi Allocation:    ${riskAssessment.defiExposure}
   - Suspicious Activity:${riskAssessment.suspiciousDrains}

--------------------------------------------------------------------------------
7. AI FINANCIAL COMMENTARY & ATTESTATION
${aiSummary}

--------------------------------------------------------------------------------
8. CRYPTOGRAPHIC VERIFICATION
   - ERC-804 Agent ID:   ${verification.erc804AgentIdentity}
   - Verification Hash:  ${verification.reportHash}
   - Verification API:   ${verification.verificationEndpoint}
================================================================================
    `;

    // Ensure we create a reports directory in the current directory or workspace
    const reportDir = path.join(process.cwd(), "reports");
    await fs.mkdir(reportDir, { recursive: true });
    
    const filePath = path.join(reportDir, `${reportId}.txt`);
    await fs.writeFile(filePath, docContent, "utf8");

    const result = {
      status: "success",
      message: `PDF generated successfully (Mock TXT format).`,
      filePath,
      reportId,
    };

    return JSON.stringify(result, null, 2);
  },
  {
    name: "pdf_renderer",
    description: "Compiles a completed report JSON into a downloadable report file. Returns status and filepath.",
    schema: z.object({
      reportJson: z.string().describe("The compiled JSON string of the report from report_compiler"),
    }),
  }
);
