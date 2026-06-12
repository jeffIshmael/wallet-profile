import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatReportLoanCapacity } from "@/lib/formatLoanCapacity";
import { formatLocalDateTime, formatWalletAge, moneyPrecise } from "@/lib/format";
import type { OfficialReportInput } from "@/lib/reports/officialReportTypes";
import {
  buildOfficialReportFilename,
  buildSampleReportFilename,
  getSampleOfficialReport
} from "@/lib/reports/sampleReportData";
import {
  ensureSpace,
  getLastTableY,
  loadLogoDataUrl,
  REPORT_THEME,
  drawSectionTitle,
  standardTableStyles
} from "@/lib/reports/pdfShared";
import { analyzeStatement } from "@/lib/statements/statementAnalytics";
import {
  abbreviateCounterparty,
  formatLedgerDateTime,
  formatStatementPeriodLong,
  formatTokenLabel,
  formatUsd
} from "@/lib/statements/statementFormat";
import { PERIOD_LABELS } from "@/lib/statements/periodUtils";
import { formatReportWalletAddress, formatIpfsUri } from "@/lib/reports/sampleReportConstants";

function formatPdfDateTime(timestamp: string): string {
  const { datePart, timePart } = formatLocalDateTime(timestamp);
  return `${datePart} ${timePart}`;
}

function txDetails(tx: OfficialReportInput["statement"]["transactions"][number]): string {
  return `${tx.direction} ${formatTokenLabel(tx.token)}`;
}

function drawReportHeader(
  doc: jsPDF,
  input: OfficialReportInput,
  logoDataUrl: string | null,
  margin: number,
  pageWidth: number
): number {
  doc.setFillColor(REPORT_THEME.bg[0], REPORT_THEME.bg[1], REPORT_THEME.bg[2]);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setFillColor(REPORT_THEME.accent[0], REPORT_THEME.accent[1], REPORT_THEME.accent[2]);
  doc.rect(0, 40, pageWidth, 1.2, "F");

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin, 8, 10, 10);
  }

  const textX = logoDataUrl ? margin + 13 : margin;
  doc.setTextColor(REPORT_THEME.text[0], REPORT_THEME.text[1], REPORT_THEME.text[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("WalletAnalyst", textX, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(REPORT_THEME.textMuted[0], REPORT_THEME.textMuted[1], REPORT_THEME.textMuted[2]);
  doc.text("Official Financial Passport · Celo Mainnet", textX, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(REPORT_THEME.gold[0], REPORT_THEME.gold[1], REPORT_THEME.gold[2]);
  doc.text("VERIFIED BY OnFRA", pageWidth - margin, 13, { align: "right" });

  let y = 48;

  if (input.isSample) {
    doc.setFillColor(245, 166, 35);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(26, 26, 26);
    doc.text("SAMPLE REPORT — FOR DEMONSTRATION PURPOSES ONLY", pageWidth / 2, y + 5.2, { align: "center" });
    y += 12;
  }

  doc.setTextColor(REPORT_THEME.body[0], REPORT_THEME.body[1], REPORT_THEME.body[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Financial Passport Report", margin, y);
  y += 8;

  doc.setDrawColor(REPORT_THEME.border[0], REPORT_THEME.border[1], REPORT_THEME.border[2]);
  doc.setFillColor(REPORT_THEME.surface[0], REPORT_THEME.surface[1], REPORT_THEME.surface[2]);
  const verificationBoxHeight = input.ipfsCid ? 22 : 17;
  doc.roundedRect(margin, y, pageWidth - margin * 2, verificationBoxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 80);
  doc.text(`Report ID: ${input.reportId}`, margin + 4, y + 6);
  doc.text(`Verification Code: ${input.verificationCode}`, margin + 4, y + 11);
  if (input.ipfsCid) {
    doc.text(`IPFS CID: ${input.ipfsCid}`, margin + 4, y + 16);
  }
  doc.setFont("helvetica", "bold");
  doc.setTextColor(REPORT_THEME.accent[0], REPORT_THEME.accent[1], REPORT_THEME.accent[2]);
  doc.text("Verify at walletanalyst.xyz/verify", pageWidth - margin - 4, y + 11, { align: "right" });

  y += verificationBoxHeight + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 80);
  doc.text(`Wallet Address: ${formatReportWalletAddress(input.walletAddress, input.isSample)}`, margin, y);
  y += 5;
  if (input.ens) {
    doc.text(`ENS: ${input.ens}`, margin, y);
    y += 5;
  }
  doc.text(`Report Generated: ${formatLedgerDateTime(input.generatedAt)}`, margin, y);
  y += 5;
  doc.text(`Wallet Age: ${formatWalletAge(input.walletAgeMonths)} · Total Transactions: ${input.totalTransactions.toLocaleString()}`, margin, y);

  return y + 10;
}

function drawScoreCards(doc: jsPDF, input: OfficialReportInput, y: number, margin: number, pageWidth: number): number {
  y = drawSectionTitle(doc, "Credit & Reputation Scores", y, margin, pageWidth);

  const scores = [
    { label: "Financial Health", value: `${input.metrics.financialHealth.score}/100` },
    { label: "Reputation Score", value: `${input.metrics.reputation.score}/100` },
    { label: "Income Stability", value: `${input.metrics.incomeProfile.score}/100` }
  ];

  const colW = (pageWidth - margin * 2) / 3;
  doc.setFillColor(REPORT_THEME.surface[0], REPORT_THEME.surface[1], REPORT_THEME.surface[2]);
  doc.setDrawColor(REPORT_THEME.border[0], REPORT_THEME.border[1], REPORT_THEME.border[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, "FD");

  scores.forEach((score, i) => {
    const x = margin + colW * i + colW / 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 110);
    doc.text(score.label.toUpperCase(), x, y + 7, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(REPORT_THEME.accent[0], REPORT_THEME.accent[1], REPORT_THEME.accent[2]);
    doc.text(score.value, x, y + 16, { align: "center" });
  });

  y += 28;

  const meta = [
    { label: "Est. Loan Capacity", value: formatReportLoanCapacity(input.metrics.loanCapacity), highlight: true },
    { label: "Income Profile", value: input.metrics.incomeProfile.label, highlight: false },
    { label: "Risk Category", value: `${input.metrics.risk.category} Risk`, highlight: false }
  ];

  doc.setFillColor(255, 248, 235);
  doc.setDrawColor(REPORT_THEME.gold[0], REPORT_THEME.gold[1], REPORT_THEME.gold[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, "FD");
  meta.forEach((item, i) => {
    const x = margin + colW * i + colW / 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(item.highlight ? 5.5 : 6);
    doc.setTextColor(120, 90, 40);
    doc.text(item.label.toUpperCase(), x, y + 4.5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(item.highlight ? 7.5 : 8.5);
    doc.setTextColor(REPORT_THEME.body[0], REPORT_THEME.body[1], REPORT_THEME.body[2]);
    const valueLines = doc.splitTextToSize(item.value, colW - 4);
    doc.text(valueLines, x, y + 9, { align: "center" });
  });

  return y + 20;
}

function drawProofOfIncome(doc: jsPDF, input: OfficialReportInput, y: number, margin: number, pageWidth: number): number {
  y = drawSectionTitle(doc, "Proof of Income (6 Months)", y, margin, pageWidth);

  const income = input.metrics.incomeProfile;
  const flow = input.cashFlow;
  const metrics = [
    { label: "Est. Monthly Income", value: formatUsd(income.monthlyEstimateUsd), color: REPORT_THEME.incoming },
    { label: "Weekly Consistency", value: `${income.weeklyConsistency}%`, color: REPORT_THEME.body },
    {
      label: "Recurring Income",
      value: income.recurringSenderPatterns ? "Detected" : "Not detected",
      color: income.recurringSenderPatterns ? REPORT_THEME.incoming : REPORT_THEME.outgoing
    },
    { label: "6M Total Inflow", value: formatUsd(flow.inflows), color: REPORT_THEME.incoming },
    { label: "6M Total Outflow", value: formatUsd(flow.outflows), color: REPORT_THEME.outgoing },
    {
      label: "6M Net Flow",
      value: `${flow.net >= 0 ? "+" : ""}${formatUsd(flow.net)}`,
      color: flow.net >= 0 ? REPORT_THEME.incoming : REPORT_THEME.outgoing
    }
  ];

  const cols = 3;
  const rowH = 16;
  doc.setFillColor(REPORT_THEME.surface[0], REPORT_THEME.surface[1], REPORT_THEME.surface[2]);
  doc.setDrawColor(REPORT_THEME.border[0], REPORT_THEME.border[1], REPORT_THEME.border[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, rowH * 2 + 4, 2, 2, "FD");

  const colW = (pageWidth - margin * 2) / cols;
  metrics.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = margin + colW * col + colW / 2;
    const baseY = y + 5 + row * rowH;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 110);
    doc.text(item.label.toUpperCase(), x, baseY, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.value, x, baseY + 5.5, { align: "center" });
  });

  y += rowH * 2 + 10;

  autoTable(doc, {
    startY: y,
    head: [["Month", "Inflow (USD)", "Outflow (USD)", "Net (USD)"]],
    body: input.cashFlow.monthly.map((row) => [
      row.month,
      formatUsd(row.in),
      formatUsd(row.out),
      `${row.in - row.out >= 0 ? "+" : ""}${formatUsd(row.in - row.out)}`
    ]),
    margin: { left: margin, right: margin },
    ...standardTableStyles(),
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right", fontStyle: "bold" }
    }
  });

  return getLastTableY(doc) + 8;
}

function drawHealthAndPortfolio(doc: jsPDF, input: OfficialReportInput, y: number, margin: number, pageWidth: number): number {
  y = ensureSpace(doc, y, 40, margin);
  y = drawSectionTitle(doc, "Financial Health Breakdown", y, margin, pageWidth);

  const b = input.metrics.financialHealth.breakdown;
  autoTable(doc, {
    startY: y,
    head: [["Factor", "Score"]],
    body: [
      ["Income Stability", `${b.incomeStability}/100`],
      ["Savings Discipline", `${b.savingsDiscipline}/100`],
      ["Portfolio Risk", `${b.portfolioRisk}/100`],
      ["Spending Discipline", `${b.spendingDiscipline}/100`],
      ["Wallet Maturity", `${b.walletMaturity}/100`],
      ["Debt / Risk Signals", `${b.debtRiskSignals}/100`]
    ],
    margin: { left: margin, right: margin },
    ...standardTableStyles(),
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } }
  });

  y = getLastTableY(doc) + 3;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 110);
  doc.text(
    "Debt / Risk Signals reflects onchain borrowing activity, DeFi lending exposure, and volatile-asset concentration. Higher scores indicate fewer debt-related red flags.",
    margin,
    y,
    { maxWidth: pageWidth - margin * 2 }
  );

  y += 8;
  y = ensureSpace(doc, y, 30, margin);
  y = drawSectionTitle(doc, "Portfolio & Risk Profile", y, margin, pageWidth);

  autoTable(doc, {
    startY: y,
    head: [["Asset Class", "Allocation", "USD Value"]],
    body: [
      ["Stablecoins", `${input.metrics.risk.allocation.stablecoin}%`, moneyPrecise(input.portfolio.stablecoinBalance)],
      ["Volatile Assets", `${input.metrics.risk.allocation.volatile}%`, moneyPrecise(input.portfolio.volatileBalance)],
      ["DeFi Exposure", `${input.metrics.risk.allocation.defi}%`, moneyPrecise(input.portfolio.defiExposure)],
      ["NFT Exposure", `${input.metrics.risk.allocation.nft}%`, moneyPrecise(input.portfolio.nftExposure)],
      ["Total Portfolio", "100%", moneyPrecise(input.portfolio.totalValueUsd)]
    ],
    margin: { left: margin, right: margin },
    ...standardTableStyles(),
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right", fontStyle: "bold" } }
  });

  return getLastTableY(doc) + 8;
}

function drawStatementSection(doc: jsPDF, input: OfficialReportInput, y: number, margin: number, pageWidth: number): number {
  y = ensureSpace(doc, y, 40, margin);
  y = drawSectionTitle(
    doc,
    `Attached Transaction Statement (${PERIOD_LABELS[input.statementPeriod]})`,
    y,
    margin,
    pageWidth
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 80);
  doc.text(`Statement Period: ${formatStatementPeriodLong(input.statementPeriod)}`, margin, y);
  y += 6;

  const sorted = [...input.statement.transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const analytics = analyzeStatement(sorted, input.statementPeriod, input.statement.summary);

  const metrics = [
    { label: "Total Paid In", value: formatUsd(input.statement.summary.inbound), color: REPORT_THEME.incoming },
    { label: "Total Paid Out", value: formatUsd(input.statement.summary.outbound), color: REPORT_THEME.outgoing },
    {
      label: "Net Flow",
      value: `${input.statement.summary.net >= 0 ? "+" : ""}${formatUsd(input.statement.summary.net)}`,
      color: input.statement.summary.net >= 0 ? REPORT_THEME.incoming : REPORT_THEME.outgoing
    },
    { label: "Transactions", value: String(input.statement.summary.transactionCount), color: REPORT_THEME.body },
    { label: "Statement Period", value: PERIOD_LABELS[input.statementPeriod], color: REPORT_THEME.body },
    { label: "Dominant Token", value: analytics.dominantToken, color: REPORT_THEME.body }
  ];

  const cols = 3;
  const rowH = 16;
  doc.setFillColor(REPORT_THEME.surface[0], REPORT_THEME.surface[1], REPORT_THEME.surface[2]);
  doc.setDrawColor(REPORT_THEME.border[0], REPORT_THEME.border[1], REPORT_THEME.border[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, rowH * 2 + 4, 2, 2, "FD");
  const colW = (pageWidth - margin * 2) / cols;
  metrics.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = margin + colW * col + colW / 2;
    const baseY = y + 5 + row * rowH;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 110);
    doc.text(item.label.toUpperCase(), x, baseY, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.value, x, baseY + 5.5, { align: "center" });
  });

  y += rowH * 2 + 8;

  const ledgerRows = sorted.map((tx) => {
    const paidIn = tx.direction === "Incoming" ? formatUsd(tx.amount) : "";
    const paidOut = tx.direction === "Outgoing" ? formatUsd(tx.amount) : "";
    return [
      formatPdfDateTime(tx.timestamp),
      txDetails(tx),
      tx.recipient ? abbreviateCounterparty(tx.recipient) : "—",
      paidIn,
      paidOut,
      tx.hash
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Completion Time", "Details", "Recipient", "Paid In", "Paid Out", "Tx Hash"]],
    body: ledgerRows.length ? ledgerRows : [["—", "No transactions in this period", "—", "—", "—", "—"]],
    margin: { left: margin, right: margin },
    ...standardTableStyles(),
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 24 },
      2: { cellWidth: 26, fontStyle: "bold" },
      3: { cellWidth: 18, halign: "right", textColor: [0, 130, 100] as [number, number, number] },
      4: { cellWidth: 18, halign: "right", textColor: [180, 90, 0] as [number, number, number] },
      5: { cellWidth: "auto", fontSize: 5.5 }
    }
  });

  return getLastTableY(doc) + 8;
}

function drawLenderAssessment(doc: jsPDF, input: OfficialReportInput, y: number, margin: number, pageWidth: number): number {
  y = ensureSpace(doc, y, 40, margin);
  y = drawSectionTitle(doc, "AI Lender Assessment", y, margin, pageWidth);

  const narrativeLines = doc.splitTextToSize(input.onfraAssessment.narrative, pageWidth - margin * 2 - 6);
  const boxHeight = Math.max(16, narrativeLines.length * 4.2 + 8);
  doc.setFillColor(REPORT_THEME.surface[0], REPORT_THEME.surface[1], REPORT_THEME.surface[2]);
  doc.setDrawColor(REPORT_THEME.border[0], REPORT_THEME.border[1], REPORT_THEME.border[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, boxHeight, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(REPORT_THEME.body[0], REPORT_THEME.body[1], REPORT_THEME.body[2]);
  doc.text(narrativeLines, margin + 3, y + 6);
  y += boxHeight + 6;

  const strengths = input.onfraAssessment.strengths.map((s) => `• ${s}`).join("\n");
  const watch = input.onfraAssessment.watchItems.map((s) => `• ${s}`).join("\n");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Strengths", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(strengths, (pageWidth - margin * 2) / 2 - 4), margin, y + 4);

  doc.setFont("helvetica", "bold");
  doc.text("Watch Items", margin + (pageWidth - margin * 2) / 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    doc.splitTextToSize(watch, (pageWidth - margin * 2) / 2 - 4),
    margin + (pageWidth - margin * 2) / 2,
    y + 4
  );

  return y + 22;
}

function drawReportFooter(doc: jsPDF, input: OfficialReportInput, margin: number, pageWidth: number) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setDrawColor(REPORT_THEME.accent[0], REPORT_THEME.accent[1], REPORT_THEME.accent[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(110, 110, 120);
    doc.text(
      "This report is generated from verified onchain transfer events on Celo Mainnet and published by WalletAnalyst.",
      margin,
      footerY
    );
    doc.setFont("helvetica", "normal");
    const footerMeta = input.ipfsCid
      ? `Verification Code: ${input.verificationCode} · IPFS: ${formatIpfsUri(input.ipfsCid)} · walletanalyst.xyz/verify`
      : `Verification Code: ${input.verificationCode} · walletanalyst.xyz/verify`;
    doc.text(footerMeta, margin, footerY + 3.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(REPORT_THEME.accent[0], REPORT_THEME.accent[1], REPORT_THEME.accent[2]);
    doc.text("WalletAnalyst", pageWidth - margin, footerY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 120);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY + 3.5, { align: "right" });
  }
}

export async function buildOfficialReportPdfBytes(input: OfficialReportInput): Promise<Uint8Array> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const logoDataUrl = await loadLogoDataUrl();

  let y = drawReportHeader(doc, input, logoDataUrl, margin, pageWidth);
  y = drawScoreCards(doc, input, y, margin, pageWidth);
  y = drawProofOfIncome(doc, input, y, margin, pageWidth);
  y = drawHealthAndPortfolio(doc, input, y, margin, pageWidth);
  y = drawStatementSection(doc, input, y, margin, pageWidth);
  y = drawLenderAssessment(doc, input, y, margin, pageWidth);

  drawReportFooter(doc, input, margin, pageWidth);

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}

export async function exportOfficialReportPdf(input: OfficialReportInput): Promise<void> {
  const bytes = await buildOfficialReportPdfBytes(input);
  const filename = input.isSample
    ? buildSampleReportFilename()
    : buildOfficialReportFilename(input.reportId, input.walletAddress);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportSampleOfficialReportPdf(): Promise<void> {
  await exportOfficialReportPdf(getSampleOfficialReport());
}
