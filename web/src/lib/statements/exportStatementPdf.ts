import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { analyzeStatement, type StatementTransaction } from "@/lib/statements/statementAnalytics";
import {
  abbreviateCounterparty,
  formatLedgerDateTime,
  formatStatementPeriodLong,
  formatTokenLabel,
  formatUsd
} from "@/lib/statements/statementFormat";
import { getPeriodDateRange, maskWalletAddress, PERIOD_LABELS, type StatementPeriod } from "@/lib/statements/periodUtils";
import { formatLocalDateTime } from "@/lib/format";

export type StatementExportInput = {
  walletAddress: string;
  ens: string | null;
  period: StatementPeriod;
  summary: {
    inbound: number;
    outbound: number;
    net: number;
    transactionCount: number;
  };
  transactions: StatementTransaction[];
};

const THEME = {
  bg: [26, 26, 26] as const,
  accent: [245, 166, 35] as const,
  text: [255, 255, 255] as const,
  textMuted: [190, 190, 200] as const,
  incoming: [0, 180, 140] as const,
  outgoing: [220, 90, 50] as const,
  body: [40, 40, 48] as const,
  surface: [248, 249, 252] as const,
  border: [225, 228, 235] as const
};

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo_dark.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function formatGeneratedAt(): string {
  return formatLedgerDateTime(new Date().toISOString());
}

function formatPdfDateTime(timestamp: string): string {
  const { datePart, timePart } = formatLocalDateTime(timestamp);
  return `${datePart} ${timePart}`;
}

function txDetails(tx: StatementTransaction): string {
  return `${tx.direction} ${formatTokenLabel(tx.token)}`;
}

function ensureSpace(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 22) {
    doc.addPage();
    return margin;
  }
  return y;
}

function drawHeader(
  doc: jsPDF,
  input: StatementExportInput,
  logoDataUrl: string | null,
  margin: number,
  pageWidth: number
): number {
  doc.setFillColor(THEME.bg[0], THEME.bg[1], THEME.bg[2]);
  doc.rect(0, 0, pageWidth, 38, "F");
  doc.setFillColor(THEME.accent[0], THEME.accent[1], THEME.accent[2]);
  doc.rect(0, 38, pageWidth, 1.2, "F");

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin, 8, 10, 10);
  }

  const textX = logoDataUrl ? margin + 13 : margin;
  doc.setTextColor(THEME.text[0], THEME.text[1], THEME.text[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("WalletAnalyst", textX, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(THEME.textMuted[0], THEME.textMuted[1], THEME.textMuted[2]);
  doc.text("Onchain Transaction Statement · Celo Mainnet", textX, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(THEME.accent[0], THEME.accent[1], THEME.accent[2]);
  doc.text("VERIFIED ONCHAIN ACTIVITY", pageWidth - margin, 13, { align: "right" });

  let y = 46;
  doc.setTextColor(THEME.body[0], THEME.body[1], THEME.body[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Account Statement", margin, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 80);
  doc.text(`Wallet Address: ${input.walletAddress}`, margin, y);
  y += 5;
  if (input.ens) {
    doc.text(`ENS: ${input.ens}`, margin, y);
    y += 5;
  }
  doc.text(`Statement Period: ${formatStatementPeriodLong(input.period)}`, margin, y);
  y += 5;
  doc.text(`Generated: ${formatGeneratedAt()}`, margin, y);

  return y + 10;
}

function drawSummaryMetrics(
  doc: jsPDF,
  input: StatementExportInput,
  analytics: ReturnType<typeof analyzeStatement>,
  y: number,
  margin: number,
  pageWidth: number
): number {
  const metrics = [
    { label: "Total Paid In", value: formatUsd(input.summary.inbound), color: THEME.incoming },
    { label: "Total Paid Out", value: formatUsd(input.summary.outbound), color: THEME.outgoing },
    {
      label: "Net Flow",
      value: `${input.summary.net >= 0 ? "+" : ""}${formatUsd(input.summary.net)}`,
      color: input.summary.net >= 0 ? THEME.incoming : THEME.outgoing
    },
    { label: "Transactions", value: String(input.summary.transactionCount), color: THEME.body },
    { label: "Statement Period", value: PERIOD_LABELS[input.period], color: THEME.body },
    { label: "Dominant Token", value: analytics.dominantToken, color: THEME.body }
  ];

  const cols = 3;
  const rowH = 18;
  const boxHeight = rowH * 2 + 4;

  doc.setDrawColor(THEME.border[0], THEME.border[1], THEME.border[2]);
  doc.setFillColor(THEME.surface[0], THEME.surface[1], THEME.surface[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, boxHeight, 2, 2, "FD");

  const colW = (pageWidth - margin * 2) / cols;

  metrics.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = margin + colW * col + colW / 2;
    const baseY = y + 6 + row * rowH;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 110);
    doc.text(item.label.toUpperCase(), x, baseY, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.value, x, baseY + 6, { align: "center" });
  });

  return y + boxHeight + 8;
}

function drawExecutiveSummary(doc: jsPDF, summary: string, y: number, margin: number, pageWidth: number): number {
  y = ensureSpace(doc, y, 30, margin);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(THEME.body[0], THEME.body[1], THEME.body[2]);
  doc.text("Executive Summary", margin, y);
  doc.setDrawColor(THEME.accent[0], THEME.accent[1], THEME.accent[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  y += 7;

  const lines = doc.splitTextToSize(summary, pageWidth - margin * 2 - 6);
  const boxHeight = Math.max(18, lines.length * 4.5 + 8);

  y = ensureSpace(doc, y, boxHeight + 4, margin);
  doc.setFillColor(THEME.surface[0], THEME.surface[1], THEME.surface[2]);
  doc.setDrawColor(THEME.border[0], THEME.border[1], THEME.border[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, boxHeight, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(THEME.body[0], THEME.body[1], THEME.body[2]);
  doc.text(lines, margin + 3, y + 6);

  return y + boxHeight + 8;
}

function drawFooter(doc: jsPDF, margin: number, pageWidth: number) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 8;
    doc.setDrawColor(THEME.accent[0], THEME.accent[1], THEME.accent[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(110, 110, 120);
    doc.text(
      "This statement is generated from verified onchain transfer events on Celo Mainnet.",
      margin,
      footerY
    );
    doc.setFont("helvetica", "normal");
    doc.text("Transaction data can be independently verified on celoscan.io.", margin, footerY + 3.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(THEME.accent[0], THEME.accent[1], THEME.accent[2]);
    doc.text("WalletAnalyst", pageWidth - margin, footerY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 120);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY + 3.5, { align: "right" });
  }
}

export function buildStatementFilename(walletAddress: string, period: StatementPeriod): string {
  const { start, end } = getPeriodDateRange(period);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const masked = maskWalletAddress(walletAddress);
  return `WalletAnalyst_Statement_${fmt(end)}_to_${fmt(start)}_${masked}.pdf`;
}

export async function exportStatementPdf(input: StatementExportInput): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const logoDataUrl = await loadLogoDataUrl();

  const sorted = [...input.transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const analytics = analyzeStatement(sorted, input.period, input.summary);

  let y = drawHeader(doc, input, logoDataUrl, margin, pageWidth);
  y = drawSummaryMetrics(doc, input, analytics, y, margin, pageWidth);

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
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      textColor: [40, 40, 48] as [number, number, number],
      lineColor: [225, 228, 235] as [number, number, number],
      lineWidth: 0.2,
      overflow: "linebreak" as const
    },
    headStyles: {
      fillColor: [26, 26, 26] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold" as const,
      fontSize: 7
    },
    alternateRowStyles: { fillColor: [252, 253, 255] as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 24 },
      2: { cellWidth: 26, fontStyle: "bold" },
      3: { cellWidth: 18, halign: "right", textColor: [0, 130, 100] as [number, number, number] },
      4: { cellWidth: 18, halign: "right", textColor: [180, 90, 0] as [number, number, number] },
      5: { cellWidth: "auto", fontSize: 5.5, fontStyle: "normal" }
    }
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  drawExecutiveSummary(doc, analytics.executiveSummary, y, margin, pageWidth);

  drawFooter(doc, margin, pageWidth);
  doc.save(buildStatementFilename(input.walletAddress, input.period));
}
