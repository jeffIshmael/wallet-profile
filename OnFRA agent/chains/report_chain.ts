import { runAnalysisChain } from "./analysis_chain.js";
import { reportCompiler } from "../tools/report_compiler.js";
import { pdfRenderer } from "../tools/pdf_renderer.js";
import { deductUser, getActiveUserWallet, getUserBalance, InsufficientBalanceError } from "../middleware/x402_billing.js";

export interface ReportChainResult {
  status: string;
  message: string;
  filePath: string;
  reportId: string;
}

const REPORT_COST_USDT = 0.10;

export async function generateFullReport(walletAddress: string, apiKey?: string): Promise<ReportChainResult> {
  const userWallet = getActiveUserWallet();
  console.log(`[ReportChain] Attempting to charge ${REPORT_COST_USDT} USDT from user wallet ${userWallet} for full PDF report...`);

  // 1. Charge X402 Fee
  const charged = deductUser(userWallet, REPORT_COST_USDT);
  if (!charged) {
    const bal = getUserBalance(userWallet);
    throw new InsufficientBalanceError(
      `Insufficient balance to purchase report. Costs ${REPORT_COST_USDT} USDT. Your balance is ${bal} USDT. Please top up.`
    );
  }

  console.log(`[ReportChain] Successfully charged ${REPORT_COST_USDT} USDT. Compiling report for target wallet: ${walletAddress}...`);

  // 2. Run sequential analysis chain (cache-enabled)
  const analysis = await runAnalysisChain(walletAddress);

  // 3. Compile report sections
  const compiledReportJson = await reportCompiler.invoke({
    walletAddress,
    onchainDataJson: analysis.rawJson || "{}",
    financialHealthJson: analysis.healthJson || "{}",
    reputationJson: analysis.reputationJson || "{}",
    riskExposureJson: analysis.riskJson || "{}",
    incomeStabilityJson: analysis.incomeJson || "{}",
    loanCapacityJson: analysis.loanJson || "{}",
    aiSummary: analysis.aiAttestation, // use formal attestation paragraph
  });

  // 4. Render PDF (txt mock)
  const renderResultJson = await pdfRenderer.invoke({
    reportJson: compiledReportJson,
  });

  const renderResult = JSON.parse(renderResultJson);

  return {
    status: renderResult.status,
    message: renderResult.message,
    filePath: renderResult.filePath,
    reportId: renderResult.reportId,
  };
}
