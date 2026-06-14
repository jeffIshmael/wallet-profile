import type { StatementTransaction } from "@/lib/statements/statementAnalytics";
import type { StatementPeriod } from "@/lib/statements/periodUtils";
import type { WalletData } from "@/types/walletData";

export type OfficialReportInput = {
  isSample?: boolean;
  reportId: string;
  verificationCode: string;
  /** IPFS CID of the pinned report PDF — registered onchain as reportHash. */
  ipfsCid: string;
  generatedAt: string;
  walletAddress: string;
  ens: string | null;
  walletAgeMonths: number;
  walletAgeDays?: number;
  totalTransactions: number;
  portfolio: WalletData["portfolio"];
  tokens: WalletData["tokens"];
  metrics: WalletData["metrics"];
  monthlyIncomeHistory: number[];
  monthlyIncomeStats: WalletData["monthlyIncomeStats"];
  cashFlow: WalletData["cashFlow"];
  onfraAssessment: WalletData["onfraAssessment"];
  attestationParagraph: string;
  statementPeriod: StatementPeriod;
  statement: {
    summary: {
      inbound: number;
      outbound: number;
      net: number;
      transactionCount: number;
    };
    transactions: StatementTransaction[];
  };
};
