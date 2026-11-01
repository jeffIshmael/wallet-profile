"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useWalletData } from "@/hooks/useWalletData";
import { copyWithToast } from "@/lib/copyToClipboard";
import {
  formatLocalDateTime,
  formatTxAmountToken,
  formatTxAmountUsd,
  moneyPrecise
} from "@/lib/format";
import { exportStatementPdf } from "@/lib/statements/exportStatementPdf";
import {
  filterTransactionsByPeriod,
  formatStatementPeriodRange,
  PERIOD_LABELS,
  type StatementPeriod
} from "@/lib/statements/periodUtils";

type TokenFilter = "All" | "USDT" | "USDC" | "USDm" | "CELO";

const PERIODS: { key: StatementPeriod; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "12M", label: "1Y" }
];

const PAGE_STEP = 10;

function SummaryCard({
  label,
  value,
  note,
  tone = "text-white",
  icon
}: {
  label: string;
  value: string;
  note?: string;
  tone?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-void-surface p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-stardust">{label}</span>
        {icon}
      </div>
      <p className={`mt-1.5 truncate font-mono text-base font-bold sm:text-lg ${tone}`}>{value}</p>
      {note && <p className="mt-0.5 truncate text-[10px] text-stardust">{note}</p>}
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyText,
  explorerHref,
  mono = false
}: {
  label: string;
  value: string;
  copyText?: string;
  explorerHref?: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-stardust">{label}</dt>
      <dd className="mt-0.5 flex items-start gap-2">
        <span className={`min-w-0 flex-1 break-all text-xs text-white ${mono ? "font-mono" : ""}`}>{value}</span>
        {copyText && (
          <button
            type="button"
            onClick={() => void copyWithToast(copyText, `${label} copied`)}
            className="mt-0.5 shrink-0 text-stardust transition hover:text-btc-orange"
            aria-label={`Copy ${label.toLowerCase()}`}
          >
            <Copy size={13} />
          </button>
        )}
        {explorerHref && (
          <a
            href={explorerHref}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 shrink-0 text-stardust transition hover:text-btc-orange"
            aria-label="Open in explorer"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </dd>
    </div>
  );
}

export function TransactionStatementsView() {
  const { miniPay } = useWalletAuth();
  const { walletData } = useWalletData();
  const [period, setPeriod] = useState<StatementPeriod>("3M");
  const [token, setToken] = useState<TokenFilter>("All");
  const [shown, setShown] = useState(PAGE_STEP);
  const [expandedHash, setExpandedHash] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    function onDown(e: MouseEvent) {
      if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [exportOpen]);

  const rows = useMemo(() => {
    if (!walletData) return [];
    const inPeriod = filterTransactionsByPeriod(walletData.transactions, period);
    const byToken = token === "All" ? inPeriod : inPeriod.filter((tx) => tx.token === token);
    return [...byToken].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [walletData, period, token]);

  if (!walletData) return null;

  const periodSummary = walletData.incomeByPeriod[period];
  // "All tokens" uses the stored period summary; a single token is summed from its rows
  const totals =
    token === "All"
      ? { inbound: periodSummary.inbound, outbound: periodSummary.outbound, net: periodSummary.net }
      : rows.reduce(
          (acc, tx) => {
            const amount = Number(tx.amount) || 0;
            if (tx.direction === "Incoming") acc.inbound += amount;
            else acc.outbound += amount;
            acc.net = acc.inbound - acc.outbound;
            return acc;
          },
          { inbound: 0, outbound: 0, net: 0 }
        );
  const netPositive = totals.net >= 0;
  const tokens: TokenFilter[] = ["All", "USDT", "USDC", "USDm", ...(miniPay ? [] : (["CELO"] as const))];
  const visible = rows.slice(0, shown);

  function resetList() {
    setShown(PAGE_STEP);
    setExpandedHash(null);
  }

  function exportPdf() {
    if (!walletData) return;
    void exportStatementPdf({
      walletAddress: walletData.walletAddress,
      ens: walletData.ens,
      period,
      summary: {
        inbound: totals.inbound,
        outbound: totals.outbound,
        net: totals.net,
        transactionCount: rows.length
      },
      transactions: rows
    });
    setExportOpen(false);
  }

  function exportCsv() {
    const header = "Timestamp,Token,Amount,Direction,Recipient,Hash\n";
    const body = rows
      .map((tx) => [tx.timestamp, tx.token, tx.amount, tx.direction, tx.recipient, tx.hash].join(","))
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onfra-statements-${period}-${token}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  const exportDisabled = rows.length === 0;

  return (
    <div className="mx-auto w-full max-w-5xl pb-6">
      {/* Title + export */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-space text-2xl font-semibold text-white sm:text-3xl">Transaction statements</h1>
          <p className="mt-1 text-sm text-stardust">View and export your transaction records.</p>
        </div>

        <div ref={exportRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setExportOpen((open) => !open)}
            disabled={exportDisabled}
            aria-expanded={exportOpen}
            title={exportDisabled ? "No transactions in this selection to export" : undefined}
            className="report-btn-primary inline-flex items-center gap-1.5 rounded-xl bg-btc-orange px-3.5 py-2.5 text-xs font-bold text-void transition hover:bg-btc-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={14} />
            Export
            <ChevronDown size={13} className={`transition ${exportOpen ? "rotate-180" : ""}`} />
          </button>
          {exportOpen && (
            <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-void-surface shadow-xl">
              <button
                type="button"
                onClick={exportPdf}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-white/5"
              >
                <FileText size={14} className="text-btc-orange" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-white/5"
              >
                <FileSpreadsheet size={14} className="text-btc-orange" />
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Token + timeframe */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="statement-token" className="sr-only">
            Token
          </label>
          <select
            id="statement-token"
            value={token}
            onChange={(e) => {
              setToken(e.target.value as TokenFilter);
              resetList();
            }}
            className="w-full rounded-xl border border-white/10 bg-void-surface px-3 py-2.5 text-xs font-semibold text-white focus:border-btc-orange/40 focus:outline-none sm:w-44"
          >
            {tokens.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All tokens" : item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1.5" role="tablist" aria-label="Timeframe">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={period === key}
              onClick={() => {
                setPeriod(key);
                resetList();
              }}
              className={
                period === key
                  ? "flex-1 rounded-full bg-btc-orange px-4 py-2 text-xs font-bold text-void sm:flex-none"
                  : "flex-1 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-stardust transition hover:text-white sm:flex-none"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[11px] text-stardust">
        {PERIOD_LABELS[period]} · {formatStatementPeriodRange(period)}
      </p>

      {/* Summary */}
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <SummaryCard
          label="Received"
          value={moneyPrecise(totals.inbound)}
          tone="text-white"
          note={
            token === "All"
              ? `${periodSummary.trendPct >= 0 ? "▲" : "▼"} ${Math.abs(periodSummary.trendPct)}% vs previous`
              : undefined
          }
          icon={<ArrowDownLeft size={14} className="text-teal" />}
        />
        <SummaryCard
          label="Sent"
          value={moneyPrecise(totals.outbound)}
          icon={<ArrowUpRight size={14} className="text-btc-orange" />}
        />
        <SummaryCard
          label="Net flow"
          value={`${netPositive ? "+" : "−"}${moneyPrecise(Math.abs(totals.net))}`}
          tone={netPositive ? "text-teal" : "text-danger"}
        />
        <SummaryCard label="Transactions" value={String(rows.length)} />
      </div>

      {/* Transactions */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-void-surface">
        <div className="hidden grid-cols-[1.3fr_1fr_1.2fr_0.8fr_0.9fr_1.5rem] gap-3 border-b border-white/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-stardust md:grid">
          <span>Date</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Token</span>
          <span>Status</span>
          <span />
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-semibold text-white">No transactions found</p>
            <p className="mt-1 text-xs text-stardust">for this wallet in the selected period</p>
            {period !== "12M" && (
              <button
                type="button"
                onClick={() => {
                  setPeriod("12M");
                  resetList();
                }}
                className="mt-4 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-btc-orange transition hover:bg-btc-orange/10"
              >
                Try a longer period
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {visible.map((tx) => {
              const incoming = tx.direction === "Incoming";
              const expanded = expandedHash === tx.hash;
              const { datePart, timePart } = formatLocalDateTime(tx.timestamp);
              const amountClass = incoming ? "text-teal" : "text-white";
              const sign = incoming ? "+" : "−";

              return (
                <li key={tx.hash}>
                  <button
                    type="button"
                    onClick={() => setExpandedHash(expanded ? null : tx.hash)}
                    aria-expanded={expanded}
                    className="w-full px-4 py-3 text-left transition hover:bg-white/[0.03]"
                  >
                    {/* Phone */}
                    <div className="flex items-center gap-3 md:hidden">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                          incoming ? "bg-teal/15 text-teal" : "bg-btc-orange/15 text-btc-orange"
                        }`}
                      >
                        {incoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{incoming ? "Received" : "Sent"}</p>
                        <p className="truncate text-[11px] text-stardust">
                          {datePart} · {timePart}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm font-semibold ${amountClass}`}>
                          {sign}
                          {formatTxAmountUsd(tx.amount)}
                        </p>
                        <p className="text-[11px] text-stardust">{tx.token}</p>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`shrink-0 text-stardust transition ${expanded ? "rotate-180" : ""}`}
                      />
                    </div>

                    {/* Tablet and desktop */}
                    <div className="hidden grid-cols-[1.3fr_1fr_1.2fr_0.8fr_0.9fr_1.5rem] items-center gap-3 md:grid">
                      <div>
                        <p className="text-xs font-semibold text-white">{datePart}</p>
                        <p className="text-[11px] text-stardust">{timePart}</p>
                      </div>
                      <span className="flex items-center gap-2 text-xs font-semibold text-white">
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full ${
                            incoming ? "bg-teal/15 text-teal" : "bg-btc-orange/15 text-btc-orange"
                          }`}
                        >
                          {incoming ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                        </span>
                        {incoming ? "Received" : "Sent"}
                      </span>
                      <span className={`font-mono text-sm font-semibold ${amountClass}`}>
                        {sign}
                        {formatTxAmountUsd(tx.amount)}
                      </span>
                      <span className="text-xs font-semibold text-white">{tx.token}</span>
                      <span className="w-fit rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-semibold text-success">
                        Confirmed
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-stardust transition ${expanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-white/5 bg-black/20 px-4 py-3">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <DetailRow
                          label="Transaction hash"
                          value={tx.hash}
                          mono
                          copyText={tx.hash}
                          explorerHref={`https://celoscan.io/tx/${tx.hash}`}
                        />
                        <DetailRow
                          label="Recipient"
                          value={tx.recipient || "—"}
                          mono
                          copyText={tx.recipient || undefined}
                        />
                        <DetailRow label="Amount" value={formatTxAmountToken(tx.amountToken, tx.token)} />
                        <DetailRow label="USD value" value={formatTxAmountUsd(tx.amount)} />
                        <DetailRow label="Network" value="Celo Mainnet" />
                        <DetailRow label="Time" value={`${datePart} ${timePart}`} />
                      </dl>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {rows.length > shown && (
          <div className="border-t border-white/10 p-3 text-center">
            <button
              type="button"
              onClick={() => setShown((count) => count + PAGE_STEP)}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-btc-orange/40"
            >
              Show more ({rows.length - shown} left)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

type TransactionStatementsPageProps = {
  chatOpen?: boolean;
  onChatOpenChange?: (open: boolean) => void;
};

export function TransactionStatementsPage({ chatOpen, onChatOpenChange }: TransactionStatementsPageProps) {
  return (
    <DashboardShell chatOpen={chatOpen} onChatOpenChange={onChatOpenChange} scrollable hideChatFab>
      <TransactionStatementsView />
    </DashboardShell>
  );
}