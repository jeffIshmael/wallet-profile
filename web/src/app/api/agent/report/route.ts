import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { assertPayment, getTierPriceUsdt } from "@/lib/agent/x402";
import { assertSufficientUsdtBalance } from "@/lib/agent/usdtBalance";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { insufficientBalanceError } from "@/lib/agent/apiErrors";
import { CELOSCAN_BASE_URL } from "@/lib/blockchain/constants";
import {
  isReporterConfigured,
  publishFinancialReportOnchain
} from "@/lib/blockchain/onchainReporter";
import { getCachedWalletData, getLatestWalletData, saveAnalysisRun } from "@/lib/db/analysis";
import { trackApiEvent } from "@/lib/db/events";
import { saveReport } from "@/lib/db/reports";
import { buildIpfsGatewayUrl, isPinataConfigured, pinReportPdfToIpfs } from "@/lib/ipfs/pinata";
import {
  buildOfficialReportFilename,
  buildOfficialReportFromWalletData
} from "@/lib/reports/sampleReportData";
import { buildOfficialReportPdfBytes } from "@/lib/reports/exportOfficialReportPdf";
import { generateReportId } from "@/lib/reports/reportId";
import type { ReportProgressEvent } from "@/types/reportProgress";
import type { Address } from "viem";

export async function POST(req: Request) {
  const body = parseJsonBody<{ walletAddress?: string; buyerAddress?: string; callerAddress?: string }>(
    await req.json().catch(() => null)
  );
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  // Only trust buyerAddress/callerAddress from the official dashboard to prevent agent spoofing
  const isDashboard = req.headers.get("x-onfra-dashboard") === "true";
  const buyerAddress =
    (isDashboard ? (body.buyerAddress?.trim() || body.callerAddress?.trim()) : undefined) ||
    walletAddress;

  if (isDashboard && (!buyerAddress || !isEvmAddress(buyerAddress))) {
    return badRequest("buyerAddress or callerAddress is required for dashboard report requests.");
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

  const isOwnWallet = walletAddress.toLowerCase() === buyerAddress.toLowerCase();
  const logPrefix = `[report ${walletAddress.slice(0, 10)}…]`;
  console.log(
    `${logPrefix} Request received. buyer=${buyerAddress.slice(0, 10)}… ownWallet=${isOwnWallet}`
  );

  const reportPrice = getTierPriceUsdt("report");
  const balanceCheckStarted = Date.now();
  try {
    const balanceCheck = await assertSufficientUsdtBalance(buyerAddress, reportPrice);
    console.log(
      `${logPrefix} USDT balance pre-check done in ${Date.now() - balanceCheckStarted}ms (ok=${balanceCheck.ok})`
    );
    if (!balanceCheck.ok) {
      return insufficientBalanceError(balanceCheck.balance, reportPrice);
    }
  } catch (error) {
    console.warn(`${logPrefix} USDT balance pre-check failed:`, error);
  }

  const paymentStarted = Date.now();
  const paymentBlock = await assertPayment(req, "report");
  if (paymentBlock) {
    console.log(
      `${logPrefix} Payment required (402) returned after ${Date.now() - paymentStarted}ms — awaiting signed retry.`
    );
    return paymentBlock;
  }
  console.log(`${logPrefix} Payment settled in ${Date.now() - paymentStarted}ms.`);

  const started = Date.now();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: ReportProgressEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        emit({ type: "status", step: "payment", message: "Payment received." });

        let walletData = await getCachedWalletData(walletAddress);
        if (walletData) {
          console.log(`${logPrefix} Using fresh cached wallet analysis (skipped re-analysis).`);
          emit({ type: "status", step: "analysis", message: "Using your saved wallet analysis." });
        } else {
          const latest = await getLatestWalletData(walletAddress);
          if (latest) {
            walletData = latest.walletData;
            console.log(
              `${logPrefix} Using latest saved analysis from ${latest.createdAt.toISOString()} (fromCache=${latest.fromCache}) — skipped re-analysis.`
            );
            emit({ type: "status", step: "analysis", message: "Using your saved wallet analysis." });
          } else {
            console.log(`${logPrefix} No saved analysis found. Running dashboard analysis…`);
            emit({ type: "status", step: "analysis", message: "Analyzing wallet data…" });
            const analysisStarted = Date.now();
            walletData = await runDashboardAnalysis(walletAddress);
            console.log(`${logPrefix} Dashboard analysis done in ${Date.now() - analysisStarted}ms.`);
            await saveAnalysisRun(walletAddress, walletData);
            emit({ type: "status", step: "analysis", message: "Wallet analysis complete." });
          }
        }
        const metrics = walletData.metrics;

        const reportId = generateReportId();
        emit({ type: "status", step: "pdf", message: "Creating report PDF…" });

        const reportInput = buildOfficialReportFromWalletData(
          walletData,
          { reportId },
          { statementPeriod: "6M" }
        );

        const filename = buildOfficialReportFilename(reportId, walletAddress);
        const pdfStarted = Date.now();
        const pdfBytes = await buildOfficialReportPdfBytes(reportInput);
        console.log(
          `${logPrefix} PDF built in ${Date.now() - pdfStarted}ms (${pdfBytes.length} bytes).`
        );
        emit({ type: "status", step: "pdf", message: "Report PDF created." });

        emit({ type: "status", step: "ipfs", message: "Pinning report to IPFS…" });
        const pinStarted = Date.now();
        const pinned = await pinReportPdfToIpfs(pdfBytes, filename);
        console.log(`${logPrefix} Pinned to IPFS in ${Date.now() - pinStarted}ms (cid=${pinned.cid}).`);
        emit({ type: "status", step: "ipfs", message: "Report pinned to IPFS." });

        emit({ type: "status", step: "onchain", message: "Registering report onchain…" });
        const onchainStarted = Date.now();
        const onchain = await publishFinancialReportOnchain({
          wallet: walletAddress as Address,
          buyer: buyerAddress as Address,
          reputationScore: metrics.reputation.score,
          financialHealthScore: metrics.financialHealth.score,
          loanCapacity: metrics.loanCapacity.range,
          reportId,
          ipfsCid: pinned.cid
        });
        console.log(
          `${logPrefix} Published onchain in ${Date.now() - onchainStarted}ms (tx=${onchain.transactionHash}).`
        );
        emit({ type: "status", step: "onchain", message: "Report registered onchain." });

        emit({ type: "status", step: "saving", message: "Saving report to your account…" });
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

        console.log(
          `${logPrefix} Report completed in ${Date.now() - started}ms (reportId=${onchain.reportId}).`
        );

        const ipfsUrl = buildIpfsGatewayUrl(pinned.cid);

        emit({
          type: "done",
          result: {
            reportId: onchain.reportId,
            onchainReportId: onchain.reportId,
            verificationCode: onchain.reportId,
            ipfsCid: pinned.cid,
            ipfsUrl,
            reportHash: pinned.cid,
            transactionHash: onchain.transactionHash,
            explorerUrl: `${CELOSCAN_BASE_URL}/tx/${onchain.transactionHash}`,
            reputationScore: metrics.reputation.score,
            financialHealthScore: metrics.financialHealth.score,
            loanCapacity: metrics.loanCapacity.range,
            attestation: walletData.onfraAssessment.narrative,
            walletAddress: walletAddress.toLowerCase(),
            buyerAddress: buyerAddress.toLowerCase(),
            createdAt: saved.createdAt
          }
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
        console.error(
          `${logPrefix} Failed to publish verified financial report after ${Date.now() - started}ms:`,
          error
        );
        emit({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to publish verified financial report onchain."
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache"
    }
  });
}
