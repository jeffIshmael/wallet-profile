// FILE: lib/statementFiles.ts
// Builds the statement files (CSV and PDF) from ledger entries.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { LedgerEntry } from "./ledger.js";

export interface StatementSummary { total_inflow: number; total_outflow: number; net_flow: number }
const iso = (ts: number) => new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19);
const csvCell = (v: string | number) => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export function buildCsv(entries: LedgerEntry[]): Buffer {
  const header = ["timestamp_utc", "tx_hash", "direction", "asset", "token_address", "amount", "amount_usd", "counterparty", "swap_leg"];
  const rows = entries.map((e) => [iso(e.timestamp), e.hash, e.direction, e.asset.symbol, e.asset.address ?? "native", e.amount, e.amountUsd ?? "", e.counterparty, e.isSwapLeg ? "yes" : "no"].map(csvCell).join(","));
  return Buffer.from([header.join(","), ...rows].join("\n") + "\n", "utf8");
}

// pdf-lib is pure JavaScript (fonts are built in), so it survives esbuild bundling and serverless hosts.
// Standard PDF fonts only encode Latin-1, so anything else (for example the symbol in "USD₮") becomes "?".
const safe = (s: string) => String(s).replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

export async function buildPdf(opts: { wallet: string; periodLabel: string; start: string; end: string; summary: StatementSummary; entries: LedgerEntry[]; statementId: string; limitations: string[] }): Promise<Buffer> {
  const MAX_ROWS = 400;
  const W = 595.28, H = 841.89, M = 40;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([W, H]);
  let y = H - M;
  const ink = rgb(0, 0, 0), grey = rgb(0.35, 0.35, 0.35);

  const put = (s: string, x: number, size = 9, f = font, color = ink) => page.drawText(safe(s), { x, y, size, font: f, color });
  const wrap = (s: string, size: number, maxW: number): string[] => {
    const out: string[] = []; let cur = "";
    for (const word of safe(s).split(/\s+/)) {
      const next = cur ? `${cur} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > maxW && cur) { out.push(cur); cur = word; } else cur = next;
    }
    if (cur) out.push(cur);
    return out;
  };
  const newPage = () => { page = doc.addPage([W, H]); y = H - M; };

  put("OnFRA Transaction Statement", M, 18, bold); y -= 18;
  put(`Statement ${opts.statementId}  |  Celo  |  Generated ${new Date().toISOString()}`, M, 8, font, grey); y -= 22;
  for (const l of [
    `Wallet: ${opts.wallet}`,
    `Period: ${opts.periodLabel} (${opts.start} to ${opts.end})`,
    `Total inflow:  $${opts.summary.total_inflow.toLocaleString()}`,
    `Total outflow: $${opts.summary.total_outflow.toLocaleString()}`,
    `Net flow:      $${opts.summary.net_flow.toLocaleString()}`,
    `Transactions:  ${new Set(opts.entries.map((e) => e.hash)).size}`,
  ]) { put(l, M, 10); y -= 14; }
  y -= 10;

  const cols = [{ t: "Date (UTC)", w: 80 }, { t: "Dir", w: 28 }, { t: "Asset", w: 48 }, { t: "Amount", w: 82 }, { t: "USD", w: 62 }, { t: "Counterparty", w: 100 }, { t: "Tx", w: 100 }];
  const header = () => { let x = M; for (const c of cols) { put(c.t, x, 8, bold); x += c.w; } y -= 13; };
  const short = (s: string) => (s.length > 14 ? `${s.slice(0, 8)}...${s.slice(-4)}` : s);
  header();
  for (const e of opts.entries.slice(0, MAX_ROWS)) {
    if (y < 70) { newPage(); header(); }
    const cells = [iso(e.timestamp), e.direction, e.asset.symbol.slice(0, 8), e.amount.toLocaleString("en-US", { maximumFractionDigits: 4 }), e.amountUsd === null ? "-" : e.amountUsd.toFixed(2), short(e.counterparty), short(e.hash)];
    let x = M;
    cols.forEach((c, i) => { put(cells[i], x, 7.5); x += c.w; });
    y -= 11;
  }
  if (opts.entries.length > MAX_ROWS) { y -= 6; put(`Showing the first ${MAX_ROWS} of ${opts.entries.length} movements. Request the CSV for the full list.`, M, 8, font, grey); y -= 12; }

  y -= 12;
  if (y < 90) newPage();
  put("Notes and limitations:", M, 8, bold); y -= 11;
  for (const l of opts.limitations) for (const part of wrap(`- ${l}`, 8, W - 2 * M)) { if (y < 50) newPage(); put(part, M, 8, font, grey); y -= 10; }

  return Buffer.from(await doc.save());
}
