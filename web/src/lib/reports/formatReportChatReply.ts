import { APP_BASE_URL } from "@/lib/blockchain/constants";
import type { ReportCompletedResult } from "@/types/reportProgress";

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatReportChatReply(result: ReportCompletedResult): string {
  const wallet = shortAddress(result.walletAddress);
  const verifyUrl = `${APP_BASE_URL}/verify`;

  return [
    `Verified Financial Reputation Report generated for ${wallet}.`,
    "",
    `Report ID: ${result.reportId}`,
    `Verification code: ${result.verificationCode}`,
    `Financial health: ${result.financialHealthScore}/100`,
    `Reputation: ${result.reputationScore}/100`,
    `Loan capacity: ${result.loanCapacity}`,
    "",
    `Download: ${result.ipfsUrl}`,
    `Verify at: ${verifyUrl} (paste code ${result.reportId})`,
    `Onchain tx: ${result.explorerUrl}`
  ].join("\n");
}
