import type { WalletData } from "@/types/walletData";
import type { StatementPeriod } from "@/lib/statements/periodUtils";
import { getPeriodDateRange, PERIOD_MONTHS } from "@/lib/statements/periodUtils";
import { formatTokenLabel, monthKeyFromDate, abbreviateCounterparty } from "@/lib/statements/statementFormat";

export type StatementTransaction = WalletData["transactions"][number];

export type BehavioralLevel = "NORMAL" | "NOTABLE" | "FLAG";

export type BehavioralFinding = {
  level: BehavioralLevel;
  message: string;
};

export type TokenBreakdownRow = {
  token: string;
  incomingCount: number;
  incomingTotal: number;
  outgoingCount: number;
  outgoingTotal: number;
  net: number;
};

export type CounterpartyRow = {
  address: string;
  role: "Sender" | "Receiver" | "Mixed";
  interactions: number;
  totalSent: number;
  totalReceived: number;
};

export type MonthlyBreakdownRow = {
  month: string;
  incomingCount: number;
  incomingTotal: number;
  outgoingCount: number;
  outgoingTotal: number;
  net: number;
};

export type StatementAnalytics = {
  executiveSummary: string;
  periodDays: number;
  dominantToken: string;
  activeDays: number;
  uniqueCounterparties: number;
  tokenBreakdown: TokenBreakdownRow[];
  counterpartySummary: CounterpartyRow[];
  monthlyBreakdown: MonthlyBreakdownRow[];
  behavioralFlags: BehavioralFinding[];
};

function enumerateMonths(start: Date, end: Date): string[] {
  const months: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endMonth) {
    months.push(monthKeyFromDate(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildTokenBreakdown(transactions: StatementTransaction[]): TokenBreakdownRow[] {
  const map = new Map<string, TokenBreakdownRow>();

  for (const tx of transactions) {
    const token = formatTokenLabel(tx.token);
    const row = map.get(token) ?? {
      token,
      incomingCount: 0,
      incomingTotal: 0,
      outgoingCount: 0,
      outgoingTotal: 0,
      net: 0
    };

    if (tx.direction === "Incoming") {
      row.incomingCount += 1;
      row.incomingTotal += tx.amount;
    } else {
      row.outgoingCount += 1;
      row.outgoingTotal += tx.amount;
    }

    map.set(token, row);
  }

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      incomingTotal: roundUsd(row.incomingTotal),
      outgoingTotal: roundUsd(row.outgoingTotal),
      net: roundUsd(row.incomingTotal - row.outgoingTotal)
    }))
    .sort((a, b) => b.incomingTotal + b.outgoingTotal - (a.incomingTotal + a.outgoingTotal));
}

function buildCounterpartySummary(transactions: StatementTransaction[]): CounterpartyRow[] {
  const map = new Map<
    string,
    { interactions: number; received: number; sent: number; incoming: number; outgoing: number }
  >();

  for (const tx of transactions) {
    if (!tx.recipient) continue;
    const key = tx.recipient.toLowerCase();
    const row = map.get(key) ?? { interactions: 0, received: 0, sent: 0, incoming: 0, outgoing: 0 };
    row.interactions += 1;
    if (tx.direction === "Incoming") {
      row.received += tx.amount;
      row.incoming += 1;
    } else {
      row.sent += tx.amount;
      row.outgoing += 1;
    }
    map.set(key, row);
  }

  return Array.from(map.entries())
    .map(([address, row]) => {
      let role: CounterpartyRow["role"] = "Mixed";
      if (row.incoming > 0 && row.outgoing === 0) role = "Sender";
      else if (row.outgoing > 0 && row.incoming === 0) role = "Receiver";

      return {
        address,
        role,
        interactions: row.interactions,
        totalSent: roundUsd(row.sent),
        totalReceived: roundUsd(row.received)
      };
    })
    .sort((a, b) => b.interactions - a.interactions);
}

function buildMonthlyBreakdown(
  transactions: StatementTransaction[],
  period: StatementPeriod
): MonthlyBreakdownRow[] {
  const { start, end } = getPeriodDateRange(period);
  const months = enumerateMonths(start, end);
  const map = new Map<string, MonthlyBreakdownRow>();

  for (const month of months) {
    map.set(month, {
      month,
      incomingCount: 0,
      incomingTotal: 0,
      outgoingCount: 0,
      outgoingTotal: 0,
      net: 0
    });
  }

  for (const tx of transactions) {
    const key = monthKeyFromDate(new Date(tx.timestamp));
    const row = map.get(key);
    if (!row) continue;

    if (tx.direction === "Incoming") {
      row.incomingCount += 1;
      row.incomingTotal += tx.amount;
    } else {
      row.outgoingCount += 1;
      row.outgoingTotal += tx.amount;
    }
  }

  return months.map((month) => {
    const row = map.get(month)!;
    return {
      ...row,
      incomingTotal: roundUsd(row.incomingTotal),
      outgoingTotal: roundUsd(row.outgoingTotal),
      net: roundUsd(row.incomingTotal - row.outgoingTotal)
    };
  });
}

function detectBehavioralFlags(
  transactions: StatementTransaction[],
  summary: { inbound: number; outbound: number; net: number },
  counterpartySummary: CounterpartyRow[]
): BehavioralFinding[] {
  const flags: BehavioralFinding[] = [];
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const hashCounts = new Map<string, number>();
  for (const tx of sorted) {
    hashCounts.set(tx.hash, (hashCounts.get(tx.hash) ?? 0) + 1);
  }
  const duplicateHashes = [...hashCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateHashes.length) {
    flags.push({
      level: "NOTABLE",
      message: `Duplicate transaction detected: ${duplicateHashes.length} hash(es) appear more than once (e.g. ${duplicateHashes[0][0].slice(0, 10)}...). May be a display artifact or double-indexing.`
    });
  }

  const zeroValue = sorted.filter((tx) => tx.amount === 0);
  if (zeroValue.length) {
    flags.push({
      level: "NOTABLE",
      message: `${zeroValue.length} zero-value transaction(s) recorded in this period.`
    });
  }

  if (summary.inbound > 0) {
    const topSender = counterpartySummary.find((c) => c.totalReceived > 0);
    if (topSender && topSender.totalReceived / summary.inbound >= 0.8) {
      flags.push({
        level: "NOTABLE",
        message: `Concentrated counterparty: ~${Math.round((topSender.totalReceived / summary.inbound) * 100)}% of incoming volume originates from ${topSender.address.slice(0, 6)}...${topSender.address.slice(-4)}.`
      });
    }
  }

  const smallInflows = sorted.filter((tx) => tx.direction === "Incoming" && tx.amount < summary.inbound * 0.05);
  const largeOutflows = sorted.filter((tx) => tx.direction === "Outgoing" && tx.amount > summary.outbound * 0.4);
  if (smallInflows.length >= 3 && largeOutflows.length >= 1) {
    flags.push({
      level: "NORMAL",
      message: "Consolidation pattern: multiple smaller inflows followed by larger outflows — typical relay or payroll behaviour."
    });
  }

  if (sorted.length >= 2) {
    for (const outTx of sorted) {
      if (outTx.direction !== "Outgoing" || !outTx.recipient) continue;
      const counterpart = outTx.recipient.toLowerCase();
      const outTime = new Date(outTx.timestamp).getTime();
      const roundTrip = sorted.find(
        (inTx) =>
          inTx.direction === "Incoming" &&
          inTx.recipient?.toLowerCase() === counterpart &&
          Math.abs(new Date(inTx.timestamp).getTime() - outTime) <= 24 * 60 * 60 * 1000
      );
      if (roundTrip) {
        flags.push({
          level: "NOTABLE",
          message: `Round-trip pattern: funds moved with ${abbreviateCounterparty(counterpart)} and returned within 24 hours.`
        });
        break;
      }
    }
  }

  if (sorted.length >= 2) {
    let maxGapDays = 0;
    let gapStart = "";
    for (let i = 1; i < sorted.length; i++) {
      const gapMs = new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime();
      const gapDays = Math.floor(gapMs / (1000 * 60 * 60 * 24));
      if (gapDays > maxGapDays) {
        maxGapDays = gapDays;
        gapStart = sorted[i - 1].timestamp;
      }
    }
    if (maxGapDays >= 14) {
      flags.push({
        level: "NOTABLE",
        message: `Dormant period: no activity for ${maxGapDays} days after ${new Date(gapStart).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.`
      });
    }
  }

  flags.push({
    level: summary.net >= 0 ? "NORMAL" : "NOTABLE",
    message:
      summary.net >= 0
        ? `Net flow positive: wallet retains a ${summary.net >= 0 ? "positive" : "negative"} balance over the period (${summary.net >= 0 ? "+" : ""}$${summary.net.toFixed(2)}).`
        : `Net flow negative: wallet sent more than it received over the period (−$${Math.abs(summary.net).toFixed(2)}).`
  });

  if (!flags.some((f) => f.level === "NORMAL" && f.message.includes("Consolidation"))) {
    flags.push({
      level: "NORMAL",
      message: "No suspicious spikes or irregular volume patterns were detected."
    });
  }

  return flags;
}

function buildExecutiveSummary(
  transactions: StatementTransaction[],
  summary: { inbound: number; outbound: number; net: number },
  analytics: Pick<StatementAnalytics, "dominantToken" | "activeDays" | "behavioralFlags">
): string {
  const count = transactions.length;
  const activity =
    count >= 20 ? "active" : count >= 5 ? "moderately active" : count > 0 ? "low-volume" : "inactive";
  const flow =
    summary.net > 0
      ? "primarily a net receiver of funds"
      : summary.net < 0
        ? "primarily a net sender of funds"
        : "balanced inflow and outflow";

  const patternNote = analytics.behavioralFlags.find((f) =>
    f.message.toLowerCase().includes("consolidation")
  );
  const concentrationNote = analytics.behavioralFlags.find((f) =>
    f.message.toLowerCase().includes("concentrated")
  );

  let text = `This wallet shows ${activity} over the statement period, ${flow}, with ${formatTokenLabel(analytics.dominantToken)} as the dominant token across ${analytics.activeDays} active day(s).`;

  if (patternNote) {
    text += ` ${patternNote.message.split(":")[1]?.trim() ?? "A consolidation-style flow pattern was observed."}`;
  } else if (concentrationNote) {
    text += ` Incoming activity is concentrated among a small set of counterparties.`;
  } else if (count === 0) {
    text = "No onchain transfer activity was recorded for this wallet during the selected statement period.";
  } else {
    text += " Transaction patterns appear consistent with routine wallet usage.";
  }

  return text;
}

export function analyzeStatement(
  transactions: StatementTransaction[],
  period: StatementPeriod,
  summary: { inbound: number; outbound: number; net: number }
): StatementAnalytics {
  const { start, end } = getPeriodDateRange(period);
  const periodDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const activeDays = new Set(
    transactions.map((tx) => new Date(tx.timestamp).toDateString())
  ).size;

  const tokenBreakdown = buildTokenBreakdown(transactions);
  const dominantToken = tokenBreakdown[0]?.token ?? "—";

  const counterpartySummary = buildCounterpartySummary(transactions);
  const monthlyBreakdown = buildMonthlyBreakdown(transactions, period);
  const behavioralFlags = detectBehavioralFlags(transactions, summary, counterpartySummary);

  const base = {
    periodDays,
    dominantToken,
    activeDays,
    uniqueCounterparties: counterpartySummary.length,
    tokenBreakdown,
    counterpartySummary,
    monthlyBreakdown,
    behavioralFlags
  };

  return {
    ...base,
    executiveSummary: buildExecutiveSummary(transactions, summary, base)
  };
}

export function getStatementPeriodDays(period: StatementPeriod): number {
  return PERIOD_MONTHS[period] * 30;
}
