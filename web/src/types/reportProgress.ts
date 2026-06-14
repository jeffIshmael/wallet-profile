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
