import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  concat,
  http,
  type Address,
  type Hex
} from "viem";
import { toDataSuffix } from "@celo/attribution-tags";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { onchainReporterAbi } from "@/lib/blockchain/abi/onchainReporter";
import { ONCHAIN_REPORTER_PROXY } from "@/lib/blockchain/constants";
import { isValidReportId, normalizeReportId } from "@/lib/reports/reportId";

export type OnchainAttestation = {
  wallet: Address;
  buyer: Address;
  reputationScore: number;
  financialHealthScore: number;
  loanCapacity: string;
  reportHash: string;
  publishedAt: number;
};

export type PublishReportInput = {
  wallet: Address;
  buyer: Address;
  reputationScore: number;
  financialHealthScore: number;
  loanCapacity: string;
  reportId: string;
  /** IPFS CID of the pinned report PDF. */
  ipfsCid: string;
};

export type PublishReportResult = {
  reportId: string;
  reportHash: string;
  transactionHash: Hex;
};

function getCeloRpcUrl(): string {
  return process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function isReporterConfigured(): boolean {
  return Boolean(process.env.REPORTER_PRIVATE_KEY?.trim() && ONCHAIN_REPORTER_PROXY);
}

function getReporterAccount() {
  const privateKey = process.env.REPORTER_PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error("REPORTER_PRIVATE_KEY is not configured.");
  }

  const normalized = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  return privateKeyToAccount(normalized as Hex);
}

export function getOnchainReporterPublicClient() {
  return createPublicClient({
    chain: celo,
    transport: http(getCeloRpcUrl())
  });
}

function getOnchainReporterWalletClient() {
  const account = getReporterAccount();
  return createWalletClient({
    account,
    chain: celo,
    transport: http(getCeloRpcUrl())
  });
}

export async function publishFinancialReportOnchain(
  input: PublishReportInput
): Promise<PublishReportResult> {
  if (!ONCHAIN_REPORTER_PROXY) {
    throw new Error("ONCHAIN_REPORTER_PROXY_ADDRESS is not configured.");
  }

  const reportId = normalizeReportId(input.reportId);
  if (!isValidReportId(reportId)) {
    throw new Error("reportId must match REP-XXXXXXXXXX (10 uppercase A-Z / 0-9).");
  }

  const reportHash = input.ipfsCid.trim();
  if (!reportHash) {
    throw new Error("ipfsCid is required to publish a financial report.");
  }

  const walletClient = getOnchainReporterWalletClient();
  const publicClient = getOnchainReporterPublicClient();

  const callData = encodeFunctionData({
    abi: onchainReporterAbi,
    functionName: "publishFinancialReport",
    args: [
      input.wallet,
      input.buyer,
      clampScore(input.reputationScore),
      clampScore(input.financialHealthScore),
      input.loanCapacity,
      reportId,
      reportHash
    ]
  });

  const attributionTag = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG || "onfra";
  const taggedData = concat([callData, toDataSuffix(attributionTag)]);

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    to: ONCHAIN_REPORTER_PROXY,
    data: taggedData
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return {
    reportId,
    reportHash,
    transactionHash: hash
  };
}

export async function verifyOnchainReportById(
  reportId: string
): Promise<{ exists: boolean; attestation?: OnchainAttestation }> {
  if (!ONCHAIN_REPORTER_PROXY || !isValidReportId(reportId)) {
    return { exists: false };
  }

  const normalized = normalizeReportId(reportId);
  const publicClient = getOnchainReporterPublicClient();
  const [exists, attestation] = await publicClient.readContract({
    address: ONCHAIN_REPORTER_PROXY,
    abi: onchainReporterAbi,
    functionName: "verifyReport",
    args: [normalized]
  });

  if (!exists || attestation.wallet === "0x0000000000000000000000000000000000000000") {
    return { exists: false };
  }

  return {
    exists: true,
    attestation: {
      wallet: attestation.wallet,
      buyer: attestation.buyer,
      reputationScore: Number(attestation.reputationScore),
      financialHealthScore: Number(attestation.financialHealthScore),
      loanCapacity: attestation.loanCapacity,
      reportHash: attestation.reportHash,
      publishedAt: Number(attestation.publishedAt)
    }
  };
}

export async function verifyOnchainReportByHash(
  reportHash: string
): Promise<{ exists: boolean; reportId?: string; attestation?: OnchainAttestation }> {
  if (!ONCHAIN_REPORTER_PROXY || !reportHash.trim()) {
    return { exists: false };
  }

  const publicClient = getOnchainReporterPublicClient();
  const [exists, reportId, attestation] = await publicClient.readContract({
    address: ONCHAIN_REPORTER_PROXY,
    abi: onchainReporterAbi,
    functionName: "verifyReportByHash",
    args: [reportHash.replace(/^ipfs:\/\//i, "")]
  });

  if (!exists || attestation.wallet === "0x0000000000000000000000000000000000000000") {
    return { exists: false };
  }

  return {
    exists: true,
    reportId,
    attestation: {
      wallet: attestation.wallet,
      buyer: attestation.buyer,
      reputationScore: Number(attestation.reputationScore),
      financialHealthScore: Number(attestation.financialHealthScore),
      loanCapacity: attestation.loanCapacity,
      reportHash: attestation.reportHash,
      publishedAt: Number(attestation.publishedAt)
    }
  };
}
