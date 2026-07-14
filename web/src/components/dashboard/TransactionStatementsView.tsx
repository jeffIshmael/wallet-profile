"use client";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Search
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useWalletData } from "@/hooks/useWalletData";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import {
  formatLocalDateTime,
  formatTxAmountToken,
  formatTxAmountUsd,
  moneyPrecise,
  truncateAddress
} from "@/lib/format";
import { exportStatementPdf } from "@/lib/statements/exportStatementPdf";
import {
  aggregateTokenFlowsForPeriod,
  filterTransactionsByPeriod,
  formatStatementPeriodRange,
  PERIOD_LABELS,
  type StatementPeriod
} from "@/lib/statements/periodUtils";

type Period = StatementPeriod;
type SortKey = "timestamp" | "amount" | "token";
type SortDir = "asc" | "desc";
type DirectionFilter = "All" | "Incoming" | "Outgoing";
type TokenFilter = "All" | "USDT" | "USDC" | "USDm" | "CELO";

const periods: { key: Period; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "12M", label: "12M" }
];

const periodDescriptions: Record<Period, string> = PERIOD_LABELS;

const TOKEN_COLORS: Record<string, string> = {
  USDT: "#26a17b",
  USDC: "#2775ca",
  USDm: "#f5a623",
  CELO: "#B8B0C8"
};

function TokenIcon({ token }: { token: string }) {
  const color = TOKEN_COLORS[token] ?? "#64748b";
  return (
    <span
      className="mr-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
      style={{ background: color }}
    >
      {token.slice(0, 1)}
    </span>
  );
}

export function TransactionStatementsView() {
  const { miniPay } = useWalletAuth();
  const { walletData } = useWalletData();
  const [period, setPeriod] = useState<Period>("3M");
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("All");
  const [tokenFilter, setTokenFilter] = useState<TokenFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedHash, setExpandedHash] = useState<string | null>(null);

  const periodTransactions = useMemo(() => {
    if (!walletData) return [];
    return filterTransactionsByPeriod(walletData.transactions, period);
  }, [walletData, period]);

  const periodTokenFlows = useMemo(() => {
    if (!walletData) return [];
    return aggregateTokenFlowsForPeriod(walletData.transactions, period);
  }, [walletData, period]);

  const filtered = useMemo(() => {
    if (!walletData) return [];
    const q = search.trim().toLowerCase();
    let rows = [...periodTransactions];

    if (directionFilter !== "All") {
      rows = rows.filter((tx) => tx.direction === directionFilter);
    }
    if (tokenFilter !== "All") {
      rows = rows.filter((tx) => tx.token === tokenFilter);
    }
    if (q) {
      rows = rows.filter(
        (tx) =>
          tx.token.toLowerCase().includes(q) ||
          tx.recipient.toLowerCase().includes(q) ||
          tx.hash.toLowerCase().includes(q) ||
          String(tx.amount).includes(q)
      );
    }

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "timestamp") cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = a.token.localeCompare(b.token);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [walletData, periodTransactions, search, directionFilter, tokenFilter, sortKey, sortDir]);

  if (!walletData) return null;

  const data = walletData;
  const current = data.incomeByPeriod[period];
  const savingsRate = current.inbound > 0 ? ((current.net / current.inbound) * 100).toFixed(1) : "0";
  const monthlyFlow = data.statementMonthlyFlow[period] ?? [];

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportPdf() {
    void exportStatementPdf({
      walletAddress: data.walletAddress,
      ens: data.ens,
      period,
      summary: {
        inbound: current.inbound,
        outbound: current.outbound,
        net: current.net,
        transactionCount: periodTransactions.length
      },
      transactions: periodTransactions
    });
  }

  function exportCsv() {
    const header = "Timestamp,Token,Amount,Direction,Recipient,Hash\n";
    const body = periodTransactions
      .map((tx) =>
        [tx.timestamp, tx.token, tx.amount, tx.direction, tx.recipient, tx.hash].join(",")
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onfra-statements-${period}-${formatStatementPeriodRange(period).replace(/\//g, "-").replace(/ /g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-3">
      <Card compact>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeader
            compact
            title="Transaction Statements"
            help={{
              meaning: "A bank-style statement of all verified onchain transactions.",
              calculation: "Aggregated from indexed transfer events across supported Celo tokens.",
              lenderRelevance: "Lenders use transaction statements to verify income sources and spending patterns."
            }}
          />
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={exportCsv}
                disabled={periodTransactions.length === 0}
                title={periodTransactions.length === 0 ? "No transactions in this period to export" : undefined}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-stardust hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={12} />
                Export CSV
              </button>
              <button
                type="button"
                onClick={exportPdf}
                disabled={periodTransactions.length === 0}
                title={periodTransactions.length === 0 ? "No transactions in this period to export" : undefined}
                className="inline-flex items-center gap-1 rounded-lg border border-btc-orange/30 bg-btc-orange/10 px-2.5 py-1.5 text-[10px] font-semibold text-btc-orange hover:bg-btc-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={12} />
                Export PDF
              </button>
            </div>
            <p className="text-[9px] text-stardust">
              {periodDescriptions[period]} · {formatStatementPeriodRange(period)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {periods.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPeriod(key);
                  setPage(1);
                }}
                className={
                  period === key
                    ? "rounded-full bg-btc-orange px-2.5 py-1 text-[10px] font-bold text-white"
                    : "rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-stardust hover:text-white"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[160px] flex-1 sm:max-w-xs">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stardust" />
            <input
              type="search"
              placeholder="Search txns..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/30 py-1.5 pl-8 pr-2 text-[11px] text-white placeholder:text-stardust focus:border-btc-orange/40 focus:outline-none"
            />
          </div>

          <select
            value={directionFilter}
            onChange={(e) => {
              setDirectionFilter(e.target.value as DirectionFilter);
              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] font-semibold text-stardust"
          >
            <option value="All">All directions</option>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
          </select>

          <select
            value={tokenFilter}
            onChange={(e) => {
              setTokenFilter(e.target.value as TokenFilter);
              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] font-semibold text-stardust"
          >
            <option value="All">All tokens</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
            <option value="USDm">USDm</option>
            {!miniPay && <option value="CELO">CELO</option>}
          </select>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stardust">Total Inflow</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">{moneyPrecise(current.inbound)}</p>
              <p className={`text-[10px] font-semibold ${current.trendPct >= 0 ? "text-teal" : "text-danger"}`}>
                {current.trendPct >= 0 ? "▲" : "▼"} {Math.abs(current.trendPct)}% vs previous {period}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stardust">Total Outflow</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">{moneyPrecise(current.outbound)}</p>
              <p className="text-[10px] font-semibold text-stardust">Spending across {period}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stardust">Net Flow</p>
              <p className={`mt-1 font-mono text-lg font-bold ${current.net >= 0 ? "text-teal" : "text-danger"}`}>
                +{moneyPrecise(current.net)}
              </p>
              <p className="text-[10px] text-stardust">
                {savingsRate}% savings rate · {current.net >= 0 ? "Healthy" : "Deficit"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[480px] text-left text-[10px]">
            <thead>
              <tr className="border-b border-white/10 text-stardust">
                <th className="px-3 py-2 font-semibold uppercase tracking-wide">By Token</th>
                {periodTokenFlows.map(({ symbol }) => (
                  <th key={symbol} className="px-3 py-2 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setTokenFilter(symbol as TokenFilter);
                        setPage(1);
                      }}
                      className="hover:text-btc-orange"
                      style={{ color: TOKEN_COLORS[symbol] }}
                    >
                      {symbol}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2 text-stardust">Inflow</td>
                {periodTokenFlows.map(({ symbol, inflow }) => (
                  <td key={symbol} className="px-3 py-2 font-mono font-semibold text-white">
                    {inflow > 0 ? moneyPrecise(inflow) : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 text-stardust">Outflow</td>
                {periodTokenFlows.map(({ symbol, outflow }) => (
                  <td key={symbol} className="px-3 py-2 font-mono font-semibold text-white">
                    {outflow > 0 ? moneyPrecise(outflow) : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card compact>
        <SectionHeader
          compact
          title="Cash Flow Overview"
          help={{
            meaning: "Monthly inflow and outflow for the selected statement period.",
            calculation: "Aggregated transfer volumes grouped by calendar month.",
            lenderRelevance: "Cash flow patterns help lenders assess surplus and repayment capacity."
          }}
        />
        <div className="mt-2 h-[180px]">
          {/* @ts-expect-error ResponsiveContainer type incompatibility between React 18 and Next.js */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...monthlyFlow]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                tick={{ fill: "#64748b", fontSize: 9 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  background: "#0f1115",
                  fontSize: 11
                }}
                formatter={(value, name) => [moneyPrecise(Number(value)), name === "inflow" ? "Inflow" : "Outflow"]}
              />
              <Bar dataKey="inflow" fill="#00d4aa" radius={[3, 3, 0, 0]} />
              <Bar dataKey="outflow" fill="#f5a623" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-[10px] text-stardust">Teal = Inflow · Amber = Outflow</p>
      </Card>

      <Card compact className="min-h-[420px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-sora text-sm font-bold text-white">Transactions</h3>
          <span className="text-[10px] text-stardust">{filtered.length} transactions</span>
        </div>

        <div className="mt-2 overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-stardust">
                <th className="py-1.5 pr-2">
                  <button type="button" onClick={() => toggleSort("timestamp")} className="hover:text-white">
                    Timestamp {sortKey === "timestamp" && (sortDir === "desc" ? "↓" : "↑")}
                  </button>
                </th>
                <th className="py-1.5 pr-2">
                  <button type="button" onClick={() => toggleSort("token")} className="hover:text-white">
                    Token {sortKey === "token" && (sortDir === "desc" ? "↓" : "↑")}
                  </button>
                </th>
                <th className="py-1.5 pr-2">
                  <button type="button" onClick={() => toggleSort("amount")} className="hover:text-white">
                    Amount {sortKey === "amount" && (sortDir === "desc" ? "↓" : "↑")}
                  </button>
                </th>
                <th className="py-1.5 pr-2">Direction</th>
                <th className="py-1.5 pr-2">Recipient</th>
                <th className="py-1.5">Hash</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-2xl">📭</p>
                    <p className="mt-2 text-sm font-semibold text-white">No transactions found</p>
                    <p className="mt-1 text-[11px] text-stardust">for this wallet in the selected period</p>
                    <button
                      type="button"
                      onClick={() => setPeriod("12M")}
                      className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-semibold text-btc-orange hover:bg-btc-orange/10"
                    >
                      Try a longer period
                    </button>
                  </td>
                </tr>
              ) : (
                paged.map((tx) => {
                  const incoming = tx.direction === "Incoming";
                  const expanded = expandedHash === tx.hash;
                  const { datePart, timePart } = formatLocalDateTime(tx.timestamp);

                  return (
                    <Fragment key={tx.hash}>
                      <tr
                        key={tx.hash}
                        onClick={() => setExpandedHash(expanded ? null : tx.hash)}
                        className={`cursor-pointer transition hover:bg-white/[0.03] ${expanded ? "bg-white/[0.02]" : ""}`}
                        style={{ borderLeft: `3px solid ${incoming ? "#00d4aa" : "#f5a623"}` }}
                      >
                        <td className="py-2 pr-2 pl-1.5">
                          <p className="text-[10px] font-semibold text-white">{datePart}</p>
                          <p className="text-[9px] text-stardust">{timePart}</p>
                        </td>
                        <td className="py-2 pr-2 font-bold text-white">
                          <TokenIcon token={tx.token} />
                          {tx.token}
                        </td>
                        <td className={`py-2 pr-2 font-mono font-semibold ${incoming ? "text-teal" : "text-btc-orange"}`}>
                          {incoming ? "+" : "−"}
                          {formatTxAmountUsd(tx.amount)}{" "}
                          {incoming ? <ArrowUp size={10} className="inline" /> : <ArrowDown size={10} className="inline" />}
                        </td>
                        <td className="py-2 pr-2">
                          <StatusBadge tone={incoming ? "green" : "red"} className="min-w-[90px] justify-center">
                            {tx.direction}
                          </StatusBadge>
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] text-stardust">
                              {tx.recipient ? truncateAddress(tx.recipient, 6, 4) : "—"}
                            </span>
                            {tx.recipient ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard?.writeText(tx.recipient);
                                }}
                                className="text-stardust hover:text-btc-orange"
                                aria-label="Copy recipient"
                              >
                                <Copy size={11} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-1">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] text-stardust">{truncateAddress(tx.hash, 6, 4)}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard?.writeText(tx.hash);
                              }}
                              className="text-stardust hover:text-btc-orange"
                              aria-label="Copy transaction hash"
                            >
                              <Copy size={11} />
                            </button>
                            <a
                              href={`https://celoscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-stardust hover:text-btc-orange"
                              aria-label="Open in explorer"
                            >
                              <ExternalLink size={11} />
                            </a>
                            <ChevronDown
                              size={12}
                              className={`text-stardust transition ${expanded ? "rotate-180" : ""}`}
                            />
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${tx.hash}-detail`} className="bg-black/30">
                          <td colSpan={6} className="px-4 py-3 text-[10px] text-stardust">
                            <div className="grid gap-1 sm:grid-cols-2">
                              <p>
                                <span className="text-white">Full Hash:</span> {tx.hash}
                              </p>
                              <p>
                                <span className="text-white">Recipient:</span> {tx.recipient || "—"}
                              </p>
                              <p>
                                <span className="text-white">Amount:</span>{" "}
                                {formatTxAmountToken(tx.amountToken, tx.token)}
                              </p>
                              <p>
                                <span className="text-white">USD Value:</span> {formatTxAmountUsd(tx.amount)}
                              </p>
                              <p>
                                <span className="text-white">Network:</span> Celo Mainnet
                              </p>
                              <p>
                                <span className="text-white">Time:</span> {datePart} {timePart}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {paged.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-stardust disabled:opacity-40 hover:text-white"
              >
                <ChevronLeft size={12} />
                Prev
              </button>
              <span className="text-[10px] text-stardust">
                Page {page} of {totalPages} (showing {paged.length} of {filtered.length})
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-stardust disabled:opacity-40 hover:text-white"
              >
                Next
                <ChevronRight size={12} />
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-semibold text-stardust"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        )}
      </Card>
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
