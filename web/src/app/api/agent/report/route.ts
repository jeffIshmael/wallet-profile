import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { assertPayment } from "@/lib/agent/x402";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { CELOSCAN_BASE_URL, getAppBaseUrl } from "@/lib/blockchain/constants";
import {
  isReporterConfigured,
  publishFinancialReportOnchain
} from "@/lib/blockchain/onchainReporter";
import type { Address } from "viem";

export async function POST(req: Request) {
  const paymentBlock = assertPayment(req, "report");
  if (paymentBlock) return paymentBlock;

  const body = parseJsonBody<{ walletAddress?: string; buyerAddress?: string }>(
    await req.json().catch(() => null)
  );
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  const buyerAddress = body.buyerAddress?.trim();
  if (!buyerAddress || !isEvmAddress(buyerAddress)) {
    return badRequest("buyerAddress must be a valid 0x-prefixed EVM address.");
  }

  if (!isReporterConfigured()) {
    return Response.json(
      {
        error:
          "Onchain reporter is not configured. Set REPORTER_PRIVATE_KEY and ONCHAIN_REPORTER_PROXY_ADDRESS."
      },
      { status: 503 }
    );
  }

  try {
    const walletData = await runDashboardAnalysis(walletAddress);
    const metrics = walletData.metrics;

    const onchain = await publishFinancialReportOnchain({
      wallet: walletAddress as Address,
      buyer: buyerAddress as Address,
      reputationScore: metrics.reputation.score,
      financialHealthScore: metrics.financialHealth.score,
      loanCapacity: metrics.loanCapacity.range,
      attestationParagraph: walletData.attestation.paragraph
    });

    const reportId = `REP-${onchain.reportId.toString()}`;

    return Response.json({
      status: "completed" as const,
      reportId,
      onchainReportId: onchain.reportId.toString(),
      walletAddress: walletAddress.toLowerCase(),
      buyerAddress: buyerAddress.toLowerCase(),
      verificationCode: reportId,
      verificationEndpoint: `${getAppBaseUrl()}/api/agent/verify/${reportId}`,
      reportHash: onchain.reportHash,
      transactionHash: onchain.transactionHash,
      explorerUrl: `${CELOSCAN_BASE_URL}/tx/${onchain.transactionHash}`,
      reputationScore: metrics.reputation.score,
      financialHealthScore: metrics.financialHealth.score,
      loanCapacity: metrics.loanCapacity.range,
      attestation: walletData.attestation.paragraph,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("[report] Failed to publish onchain attestation:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to publish verified financial report onchain."
      },
      { status: 500 }
    );
  }
}
