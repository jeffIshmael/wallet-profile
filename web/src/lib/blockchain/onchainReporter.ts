import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  encodePacked,
  http,
  keccak256,
  type Address,
  type Hex
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { onchainReporterAbi } from "@/lib/blockchain/abi/onchainReporter";
import { ONCHAIN_REPORTER_PROXY } from "@/lib/blockchain/constants";

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
  attestationParagraph: string;
};

export type PublishReportResult = {
  reportId: bigint;
  reportHash: string;
  transactionHash: Hex;
};

function getCeloRpcUrl(): string {
  return process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildReportHash(
  wallet: Address,
  buyer: Address,
  attestationParagraph: string,
  issuedAtMs = Date.now()
): string {
  const digest = keccak256(
    encodePacked(
      ["address", "address", "string", "uint256"],
      [wallet, buyer, attestationParagraph, BigInt(issuedAtMs)]
    )
  );
  return digest;
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

  const reportHash = buildReportHash(
    input.wallet,
    input.buyer,
    input.attestationParagraph
  );

  const walletClient = getOnchainReporterWalletClient();
  const publicClient = getOnchainReporterPublicClient();

  const hash = await walletClient.writeContract({
    address: ONCHAIN_REPORTER_PROXY,
    abi: onchainReporterAbi,
    functionName: "publishFinancialReport",
    args: [
      input.wallet,
      input.buyer,
      clampScore(input.reputationScore),
      clampScore(input.financialHealthScore),
      input.loanCapacity,
      reportHash
    ]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  let reportId: bigint | undefined;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== ONCHAIN_REPORTER_PROXY.toLowerCase()) continue;

    try {
      const decoded = decodeEventLog({
        abi: onchainReporterAbi,
        data: log.data,
        topics: log.topics
      });

      if (decoded.eventName === "FinancialReportPublished") {
        reportId = decoded.args.reportId;
        break;
      }
    } catch {
      // Not a FinancialReportPublished log from this contract.
    }
  }

  if (reportId === undefined) {
    throw new Error("FinancialReportPublished event not found in transaction receipt.");
  }

  return {
    reportId,
    reportHash,
    transactionHash: hash
  };
}

export async function verifyOnchainReportById(
  reportId: bigint
): Promise<{ exists: boolean; attestation?: OnchainAttestation }> {
  if (!ONCHAIN_REPORTER_PROXY) {
    return { exists: false };
  }

  const publicClient = getOnchainReporterPublicClient();
  const [exists, attestation] = await publicClient.readContract({
    address: ONCHAIN_REPORTER_PROXY,
    abi: onchainReporterAbi,
    functionName: "verifyReport",
    args: [reportId]
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
): Promise<{ exists: boolean; reportId?: bigint; attestation?: OnchainAttestation }> {
  if (!ONCHAIN_REPORTER_PROXY || !reportHash.trim()) {
    return { exists: false };
  }

  const publicClient = getOnchainReporterPublicClient();
  const [exists, reportId, attestation] = await publicClient.readContract({
    address: ONCHAIN_REPORTER_PROXY,
    abi: onchainReporterAbi,
    functionName: "verifyReportByHash",
    args: [reportHash]
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
