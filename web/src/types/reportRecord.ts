export type ReportRecord = {
  id: string;
  onchainReportId: string;
  reportId: string;
  verificationCode: string;
  ipfsCid: string;
  ipfsUrl: string;
  reportHash: string;
  transactionHash: string;
  walletAddress: string;
  buyerAddress: string;
  financialHealthScore: number;
  reputationScore: number;
  loanCapacity: string;
  attestation: string;
  createdAt: string;
};
