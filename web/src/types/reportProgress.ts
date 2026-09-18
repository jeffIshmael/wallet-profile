export type ReportProgressStep =
  | "payment"
  | "analysis"
  | "pdf"
  | "ipfs"
  | "onchain"
  | "saving";

export type ReportCompletedResult = {
  reportId: string;
  onchainReportId: string;
  verificationCode: string;
  ipfsCid: string;
  ipfsUrl: string;
  reportHash: string;
  transactionHash: string;
  explorerUrl: string;
  /** USDT settlement for the 0.10 report purchase (when available). */
  paymentSettlement?: {
    method: string;
    priceUsdt: string;
    txHash?: string;
    explorerUrl?: string;
    attributionTag?: string;
  };
  reputationScore: number;
  financialHealthScore: number;
  loanCapacity: string;
  attestation: string;
  walletAddress: string;
  buyerAddress: string;
  createdAt: string;
};

export type ReportProgressEvent =
  | { type: "status"; step: ReportProgressStep; message: string }
  | { type: "done"; result: ReportCompletedResult }
  | { type: "error"; message: string };
