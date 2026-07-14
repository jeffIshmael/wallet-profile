import { NextRequest, NextResponse } from "next/server";
import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getCachedWalletData, getLatestWalletData, saveAnalysisRun } from "@/lib/db/analysis";
import { isPinataConfigured, pinReportPdfToIpfs, buildIpfsGatewayUrl } from "@/lib/ipfs/pinata";
import { buildStatementPdfBytes, buildStatementFilename, StatementExportInput } from "@/lib/statements/exportStatementPdf";
import { filterTransactionsByPeriod, type StatementPeriod } from "@/lib/statements/periodUtils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("walletAddress")?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress query param must be a valid 0x-prefixed EVM address.");
  }

  // Normalize period
  let rawPeriod = (searchParams.get("period")?.trim() || "3M").toUpperCase();
  if (rawPeriod === "3 MONTHS" || rawPeriod === "3 MONTH" || rawPeriod === "3") rawPeriod = "3M";
  if (rawPeriod === "6 MONTHS" || rawPeriod === "6 MONTH" || rawPeriod === "6") rawPeriod = "6M";
  if (rawPeriod === "12 MONTHS" || rawPeriod === "12 MONTH" || rawPeriod === "1Y" || rawPeriod === "1 YEAR" || rawPeriod === "12") rawPeriod = "12M";

  if (!["1M", "3M", "6M", "12M"].includes(rawPeriod)) {
    return badRequest("period must be one of: 3M, 6M, 12M.");
  }
  const period = rawPeriod as StatementPeriod;

  if (!isPinataConfigured()) {
    return NextResponse.json(
      { error: "IPFS pinning is not configured." },
      { status: 503 }
    );
  }

  try {
    let walletData = await getCachedWalletData(walletAddress);
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

    return NextResponse.redirect(ipfsUrl);
  } catch (error) {
    console.error("[statement/generate] Failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate statement." },
      { status: 500 }
    );
  }
}
