import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { assertPayment, getTierPriceUsdt } from "@/lib/agent/x402";
import { assertSufficientUsdtBalance } from "@/lib/agent/usdtBalance";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { insufficientBalanceError } from "@/lib/agent/apiErrors";
import { getCachedWalletData, getLatestWalletData, saveAnalysisRun } from "@/lib/db/analysis";
import { trackApiEvent } from "@/lib/db/events";
import { isPinataConfigured, pinReportPdfToIpfs, buildIpfsGatewayUrl } from "@/lib/ipfs/pinata";
import { buildStatementPdfBytes, buildStatementFilename, StatementExportInput } from "@/lib/statements/exportStatementPdf";
import { filterTransactionsByPeriod, type StatementPeriod } from "@/lib/statements/periodUtils";

export async function POST(req: Request) {
  const body = parseJsonBody<{
    walletAddress?: string;
    callerAddress?: string;
    period?: string;
    force?: boolean;
  }>(await req.json().catch(() => null));
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  const callerAddress = body.callerAddress?.trim() || walletAddress;
  if (!isEvmAddress(callerAddress)) {
    return badRequest("callerAddress must be a valid 0x-prefixed EVM address.");
  }

  // Normalize period
  let rawPeriod = (body.period?.trim() || "3M").toUpperCase();
  if (rawPeriod === "3 MONTHS" || rawPeriod === "3 MONTH" || rawPeriod === "3") rawPeriod = "3M";
  if (rawPeriod === "6 MONTHS" || rawPeriod === "6 MONTH" || rawPeriod === "6") rawPeriod = "6M";
  if (rawPeriod === "12 MONTHS" || rawPeriod === "12 MONTH" || rawPeriod === "1Y" || rawPeriod === "1 YEAR" || rawPeriod === "12") rawPeriod = "12M";
  if (rawPeriod === "1 MONTH" || rawPeriod === "1") rawPeriod = "1M";

  if (!["1M", "3M", "6M", "12M"].includes(rawPeriod)) {
    return badRequest("period must be one of: 3M, 6M, 12M (or 3 months, 6 months, 1 year).");
  }
  const period = rawPeriod as StatementPeriod;

  if (!isPinataConfigured()) {
    return Response.json(
      {
        error: "IPFS pinning is not configured. Set PINATA_JWT and PINATA_GATEWAY.",
        code: "PINATA_NOT_CONFIGURED"
      },
      { status: 503 }
    );
  }

  const isOwnWallet = walletAddress.toLowerCase() === callerAddress.toLowerCase();
  const priceUsdt = getTierPriceUsdt("external");

  if (!isOwnWallet) {
    try {
      const balanceCheck = await assertSufficientUsdtBalance(callerAddress, priceUsdt);
      if (!balanceCheck.ok) {
        return insufficientBalanceError(balanceCheck.balance, priceUsdt);
      }
    } catch (error) {
      console.warn("[statement] USDT balance pre-check failed:", error);
    }
  }

  const paymentBlock = await assertPayment(req, "external", {
    skipPayment: false,
    skipReason: "own-wallet statement"
  });
  if (paymentBlock) return paymentBlock;

  const logPrefix = `[statement ${walletAddress.slice(0, 10)}…]`;
  const started = Date.now();

  try {
    let walletData = !body.force ? await getCachedWalletData(walletAddress) : null;
    if (!walletData) {
      const latest = await getLatestWalletData(walletAddress);
      if (latest) {
        walletData = latest.walletData;
      } else {
        walletData = await runDashboardAnalysis(walletAddress);
        await saveAnalysisRun(walletAddress, walletData);
      }
    }

    const filteredTxs = filterTransactionsByPeriod(walletData.transactions, period);
    let inbound = 0;
    let outbound = 0;
    for (const tx of filteredTxs) {
      if (tx.direction === "Incoming") inbound += tx.amount;
      else outbound += tx.amount;
    }
    const summary = {
      inbound,
      outbound,
      net: inbound - outbound,
      transactionCount: filteredTxs.length
    };

    const statementInput: StatementExportInput = {
      walletAddress,
      ens: walletData.ens ?? null,
      period,
      summary,
      transactions: filteredTxs
    };

    const filename = buildStatementFilename(walletAddress, period);
    const pdfBytes = await buildStatementPdfBytes(statementInput);

    const pinned = await pinReportPdfToIpfs(pdfBytes, filename);
    const ipfsUrl = buildIpfsGatewayUrl(pinned.cid);

    await trackApiEvent({
      endpoint: "statement",
      status: "success",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: { period, ipfsCid: pinned.cid }
    });

    return Response.json({
      walletAddress: walletAddress.toLowerCase(),
      period,
      inboundUsd: inbound,
      outboundUsd: outbound,
      netFlowUsd: inbound - outbound,
      transactionCount: filteredTxs.length,
      ipfsCid: pinned.cid,
      ipfsUrl,
      filename
    });
  } catch (error) {
    await trackApiEvent({
      endpoint: "statement",
      status: "error",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: {
        message: error instanceof Error ? error.message : "Statement generation failed."
      }
    });
    console.error(`${logPrefix} Statement failed after ${Date.now() - started}ms:`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Statement generation failed.", code: "AGENT_ERROR" },
      { status: 500 }
    );
  }
}
