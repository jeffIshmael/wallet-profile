import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { assertPayment, getTierPriceUsdt } from "@/lib/agent/x402";
import { assertSufficientUsdtBalance } from "@/lib/agent/usdtBalance";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { insufficientBalanceError } from "@/lib/agent/apiErrors";
import { CELOSCAN_BASE_URL, getAppBaseUrl } from "@/lib/blockchain/constants";
import {
  isReporterConfigured,
  publishFinancialReportOnchain
} from "@/lib/blockchain/onchainReporter";
import { saveAnalysisRun } from "@/lib/db/analysis";
import { trackApiEvent } from "@/lib/db/events";
import { saveReport } from "@/lib/db/reports";
import { buildIpfsGatewayUrl, isPinataConfigured, pinReportPdfToIpfs } from "@/lib/ipfs/pinata";
import {
  buildOfficialReportFilename,
  buildOfficialReportFromWalletData
} from "@/lib/reports/sampleReportData";
import { buildOfficialReportPdfBytes } from "@/lib/reports/exportOfficialReportPdf";
import { generateReportId } from "@/lib/reports/reportId";
import type { Address } from "viem";

export async function POST(req: Request) {
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
          "Onchain reporter is not configured. Set REPORTER_PRIVATE_KEY and ONCHAIN_REPORTER_PROXY_ADDRESS.",
        code: "REPORTER_NOT_CONFIGURED"
      },
      { status: 503 }
    );
  }

  if (!isPinataConfigured()) {
    return Response.json(
      {
        error: "IPFS pinning is not configured. Set PINATA_JWT and PINATA_GATEWAY.",
        code: "PINATA_NOT_CONFIGURED"
      },
      { status: 503 }
    );
  }

  const reportPrice = getTierPriceUsdt("report");
  try {
    const balanceCheck = await assertSufficientUsdtBalance(buyerAddress, reportPrice);
    if (!balanceCheck.ok) {
      return insufficientBalanceError(balanceCheck.balance, reportPrice);
    }
  } catch (error) {
    console.warn("[report] USDT balance pre-check failed:", error);
  }

  const paymentBlock = await assertPayment(req, "report");
  if (paymentBlock) return paymentBlock;

  const started = Date.now();

  try {
    const walletData = await runDashboardAnalysis(walletAddress);
    const metrics = walletData.metrics;

    await saveAnalysisRun(walletAddress, walletData);

    const reportId = generateReportId();

    const reportInput = buildOfficialReportFromWalletData(
      walletData,
      { reportId },
      { statementPeriod: "6M" }
    );

    const filename = buildOfficialReportFilename(reportId, walletAddress);
    const pdfBytes = await buildOfficialReportPdfBytes(reportInput);
    const pinned = await pinReportPdfToIpfs(pdfBytes, filename);

    const onchain = await publishFinancialReportOnchain({
      wallet: walletAddress as Address,
      buyer: buyerAddress as Address,
      reputationScore: metrics.reputation.score,
      financialHealthScore: metrics.financialHealth.score,
      loanCapacity: metrics.loanCapacity.range,
      reportId,
      ipfsCid: pinned.cid
    });

    const saved = await saveReport({
      walletAddress,
      buyerAddress,
      onchainReportId: onchain.reportId,
      reportHash: pinned.cid,
      transactionHash: onchain.transactionHash,
      financialHealthScore: metrics.financialHealth.score,
      reputationScore: metrics.reputation.score,
      loanCapacity: metrics.loanCapacity.range,
      attestation: walletData.onfraAssessment.narrative
    });

    await trackApiEvent({
      endpoint: "report",
      status: "success",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: { reportId: onchain.reportId, ipfsCid: pinned.cid }
    });

    const ipfsUrl = buildIpfsGatewayUrl(pinned.cid);

    return Response.json({
      status: "completed" as const,
      reportId: onchain.reportId,
      onchainReportId: onchain.reportId,
      walletAddress: walletAddress.toLowerCase(),
      buyerAddress: buyerAddress.toLowerCase(),
      verificationCode: onchain.reportId,
      verificationEndpoint: `${getAppBaseUrl()}/api/agent/verify/${onchain.reportId}`,
      ipfsCid: pinned.cid,
      ipfsUrl,
      reportHash: pinned.cid,
      transactionHash: onchain.transactionHash,
      explorerUrl: `${CELOSCAN_BASE_URL}/tx/${onchain.transactionHash}`,
      reputationScore: metrics.reputation.score,
      financialHealthScore: metrics.financialHealth.score,
      loanCapacity: metrics.loanCapacity.range,
      attestation: walletData.onfraAssessment.narrative,
      createdAt: saved.createdAt
    });
  } catch (error) {
    await trackApiEvent({
      endpoint: "report",
      status: "error",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: {
        message: error instanceof Error ? error.message : "Report publish failed."
      }
    });
    console.error("[report] Failed to publish verified financial report:", error);
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
