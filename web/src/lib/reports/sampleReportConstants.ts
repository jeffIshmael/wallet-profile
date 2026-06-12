/** Public demo wallet — address is shortened in sample PDFs only. */
export const SAMPLE_WALLET_ADDRESS = "0xe3B6DE2bAc405cd0106C063e3215f641F7C6A057";

export const SAMPLE_REPORT_ID = "REP-SAMPLE0001";

/** Demo IPFS CID — in production this is the CID returned after pinning the report PDF. */
export const SAMPLE_IPFS_CID = "bafybei7sample0001chainalysefinancialpassport";

export function formatSampleWalletAddress(address: string = SAMPLE_WALLET_ADDRESS): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatReportWalletAddress(address: string, isSample?: boolean): string {
  if (isSample) return formatSampleWalletAddress(address);
  return address;
}

export function formatIpfsUri(cid: string): string {
  return cid.startsWith("ipfs://") ? cid : `ipfs://${cid}`;
}
