import { mockWallet } from "@/data/mockWallet";
import type { OfficialReportInput } from "@/lib/reports/officialReportTypes";
import {
  SAMPLE_IPFS_CID,
  SAMPLE_REPORT_ID,
  SAMPLE_WALLET_ADDRESS
} from "@/lib/reports/sampleReportConstants";
import type { StatementTransaction } from "@/lib/statements/statementAnalytics";
import { filterTransactionsByPeriod } from "@/lib/statements/periodUtils";
import type { WalletData } from "@/types/walletData";

/** Representative 6-month ledger used in the public sample report. */
const sample6MTransactions: StatementTransaction[] = [
  {
    timestamp: "2025-12-08T09:20:00.000Z",
    token: "USDC",
    amount: 420,
    amountToken: 420,
    direction: "Incoming",
    recipient: "0x8e770000000000000000000000000000002b19",
    hash: "0xabc001234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2025-12-18T14:05:00.000Z",
    token: "USDT",
    amount: 780,
    amountToken: 780,
    direction: "Outgoing",
    recipient: "0x2b910000000000000000000000000000004e88",
    hash: "0xabc002234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-01-05T11:30:00.000Z",
    token: "USDm",
    amount: 650,
    amountToken: 650,
    direction: "Incoming",
    recipient: "0x9c440000000000000000000000000000001a07",
    hash: "0xabc003234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-01-15T16:45:00.000Z",
    token: "USDC",
    amount: 700,
    amountToken: 700,
    direction: "Incoming",
    recipient: "0x8e770000000000000000000000000000002b19",
    hash: "0xabc004234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-01-22T08:10:00.000Z",
    token: "CELO",
    amount: 280,
    amountToken: 280,
    direction: "Outgoing",
    recipient: "0x1f660000000000000000000000000000007d44",
    hash: "0xabc005234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-02-03T13:22:00.000Z",
    token: "USDT",
    amount: 540,
    amountToken: 540,
    direction: "Incoming",
    recipient: "0x7a3f0000000000000000000000000000009c12",
    hash: "0xabc006234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-02-14T10:00:00.000Z",
    token: "USDC",
    amount: 560,
    amountToken: 560,
    direction: "Incoming",
    recipient: "0x8e770000000000000000000000000000002b19",
    hash: "0xabc007234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-02-20T17:35:00.000Z",
    token: "USDT",
    amount: 490,
    amountToken: 490,
    direction: "Outgoing",
    recipient: "0x5d120000000000000000000000000000008f33",
    hash: "0xabc008234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-03-02T09:48:00.000Z",
    token: "USDm",
    amount: 720,
    amountToken: 720,
    direction: "Incoming",
    recipient: "0x9c440000000000000000000000000000001a07",
    hash: "0xabc009234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-03-12T15:20:00.000Z",
    token: "USDC",
    amount: 730,
    amountToken: 730,
    direction: "Incoming",
    recipient: "0x8e770000000000000000000000000000002b19",
    hash: "0xabc010234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-03-19T11:05:00.000Z",
    token: "USDT",
    amount: 1100,
    amountToken: 1100,
    direction: "Outgoing",
    recipient: "0x2b910000000000000000000000000000004e88",
    hash: "0xabc011234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-04-04T08:30:00.000Z",
    token: "USDC",
    amount: 820,
    amountToken: 820,
    direction: "Incoming",
    recipient: "0x8e770000000000000000000000000000002b19",
    hash: "0xabc012234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-04-14T12:15:00.000Z",
    token: "USDm",
    amount: 780,
    amountToken: 780,
    direction: "Incoming",
    recipient: "0x9c440000000000000000000000000000001a07",
    hash: "0xabc013234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-04-22T18:40:00.000Z",
    token: "USDT",
    amount: 1170,
    amountToken: 1170,
    direction: "Outgoing",
    recipient: "0x5d120000000000000000000000000000008f33",
    hash: "0xabc014234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-05-10T10:25:00.000Z",
    token: "USDC",
    amount: 900,
    amountToken: 900,
    direction: "Incoming",
    recipient: "0x8e770000000000000000000000000000002b19",
    hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    timestamp: "2026-05-18T08:12:00.000Z",
    token: "CELO",
    amount: 240,
    amountToken: 240,
    direction: "Outgoing",
    recipient: "0x1f660000000000000000000000000000007d44",
    hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
  },
  {
    timestamp: "2026-05-20T16:30:00.000Z",
    token: "USDC",
    amount: 1250,
    amountToken: 1250,
    direction: "Incoming",
    recipient: "0x8e770000000000000000000000000000002b19",
    hash: "0xd4752aa1fde1f9584ab802a000b94ecde313a38044b3978ae45bd5a85de94bd3"
  },
  {
    timestamp: "2026-05-22T11:05:00.000Z",
    token: "USDT",
    amount: 95,
    amountToken: 95,
    direction: "Outgoing",
    recipient: "0x5d120000000000000000000000000000008f33",
    hash: "0x1a2b3c4d5e6f7890123456789012345678901234567890123456789012345678"
  },
  {
    timestamp: "2026-05-24T18:40:00.000Z",
    token: "USDm",
    amount: 650,
    amountToken: 650,
    direction: "Incoming",
    recipient: "0x9c440000000000000000000000000000001a07",
    hash: "0x3f8a2bc1d9e4f5678901234567890abcdef1234567890abcdef1234567890ab"
  },
  {
    timestamp: "2026-05-26T09:15:00.000Z",
    token: "USDC",
    amount: 180,
    amountToken: 180,
    direction: "Outgoing",
    recipient: "0x2b910000000000000000000000000000004e88",
    hash: "0xd4752aa1fde1f9584ab802a000b94ecde313a38044b3978ae45bd5a85de94bd3"
  },
  {
    timestamp: "2026-05-28T14:22:00.000Z",
    token: "USDT",
    amount: 420,
    amountToken: 420,
    direction: "Incoming",
    recipient: "0x7a3f0000000000000000000000000000009c12",
    hash: "0xaa647c82e0cc8f43f639672c58b5f246219bdb28b27ac793e8e87181f959d073"
  }
];

function summarizeTransactions(transactions: StatementTransaction[]) {
  let inbound = 0;
  let outbound = 0;
  for (const tx of transactions) {
    if (tx.direction === "Incoming") inbound += tx.amount;
    else outbound += tx.amount;
  }
  return {
    inbound: Math.round(inbound * 100) / 100,
    outbound: Math.round(outbound * 100) / 100,
    net: Math.round((inbound - outbound) * 100) / 100,
    transactionCount: transactions.length
  };
}

export function buildOfficialReportFromWalletData(
  data: WalletData,
  reportMeta: {
    reportId: string;
    ipfsCid?: string;
  },
  options?: { isSample?: boolean; statementPeriod?: OfficialReportInput["statementPeriod"] }
): OfficialReportInput {
  const statementPeriod = options?.statementPeriod ?? "6M";
  const periodTx = filterTransactionsByPeriod(data.transactions, statementPeriod);
  const summary =
    periodTx.length > 0
      ? summarizeTransactions(periodTx)
      : {
          inbound: data.incomeByPeriod[statementPeriod].inbound,
          outbound: data.incomeByPeriod[statementPeriod].outbound,
          net: data.incomeByPeriod[statementPeriod].net,
          transactionCount: periodTx.length
        };

  return {
    isSample: options?.isSample,
    reportId: reportMeta.reportId,
    verificationCode: reportMeta.reportId,
    ipfsCid: reportMeta.ipfsCid ?? "",
    generatedAt: new Date().toISOString(),
    walletAddress: data.walletAddress,
    ens: data.ens,
    walletAgeMonths: data.walletAgeMonths,
    walletAgeDays: data.walletAgeDays,
    totalTransactions: data.totalTransactions,
    portfolio: data.portfolio,
    tokens: data.tokens,
    metrics: data.metrics,
    monthlyIncomeHistory: data.monthlyIncomeHistory,
    monthlyIncomeStats: data.monthlyIncomeStats,
    cashFlow: data.cashFlow,
    onfraAssessment: data.onfraAssessment,
    statementPeriod,
    statement: {
      summary,
      transactions: periodTx.length > 0 ? periodTx : data.transactions
    }
  };
}

export function getSampleOfficialReport(): OfficialReportInput {
  const summary = summarizeTransactions(sample6MTransactions);

  return {
    isSample: true,
    reportId: SAMPLE_REPORT_ID,
    verificationCode: SAMPLE_REPORT_ID,
    ipfsCid: SAMPLE_IPFS_CID,
    generatedAt: new Date().toISOString(),
    walletAddress: SAMPLE_WALLET_ADDRESS,
    ens: mockWallet.ens,
    walletAgeMonths: mockWallet.walletAgeMonths,
    walletAgeDays: mockWallet.walletAgeDays,
    totalTransactions: mockWallet.totalTransactions,
    portfolio: mockWallet.portfolio,
    tokens: [...mockWallet.tokens],
    metrics: mockWallet.metrics,
    monthlyIncomeHistory: [...mockWallet.monthlyIncomeHistory],
    monthlyIncomeStats: mockWallet.monthlyIncomeStats,
    cashFlow: {
      ...mockWallet.cashFlow,
      monthly: mockWallet.cashFlow.monthly.map((m) => ({ ...m }))
    },
    onfraAssessment: {
      ...mockWallet.onfraAssessment,
      strengths: [...mockWallet.onfraAssessment.strengths],
      watchItems: [...mockWallet.onfraAssessment.watchItems]
    },
    statementPeriod: "6M",
    statement: {
      summary: {
        inbound: mockWallet.incomeByPeriod["6M"].inbound,
        outbound: mockWallet.incomeByPeriod["6M"].outbound,
        net: mockWallet.incomeByPeriod["6M"].net,
        transactionCount: summary.transactionCount
      },
      transactions: sample6MTransactions
    }
  };
}

export function buildSampleReportFilename(): string {
  return "Chainalyse_Sample_Financial_Passport.pdf";
}

export function buildOfficialReportFilename(reportId: string, walletAddress: string): string {
  const short = walletAddress.slice(2, 10);
  return `Chainalyse_Report_${reportId}_${short}.pdf`;
}
