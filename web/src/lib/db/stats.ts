import { prisma } from "@/lib/db/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS);
}

function lastNDayLabels(days: number) {
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    labels.push(d.toISOString().slice(0, 10));
  }
  return labels;
}

function buildDailyCounts<T extends { createdAt: Date }>(
  rows: T[],
  dayLabels: string[]
) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const day = row.createdAt.toISOString().slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return dayLabels.map((day) => ({ day, count: map.get(day) ?? 0 }));
}

function buildDailyApiUsage(
  rows: Array<{ endpoint: string; createdAt: Date }>,
  dayLabels: string[]
) {
  const map = new Map<string, { analyze: number; chat: number; report: number }>();

  for (const day of dayLabels) {
    map.set(day, { analyze: 0, chat: 0, report: 0 });
  }

  for (const row of rows) {
    const day = row.createdAt.toISOString().slice(0, 10);
    const bucket = map.get(day);
    if (!bucket) continue;

    if (row.endpoint === "analyze" || row.endpoint === "chat" || row.endpoint === "report") {
      bucket[row.endpoint] += 1;
    }
  }

  return dayLabels.map((day) => {
    const bucket = map.get(day) ?? { analyze: 0, chat: 0, report: 0 };
    return {
      day,
      analyze: bucket.analyze,
      chat: bucket.chat,
      report: bucket.report,
      total: bucket.analyze + bucket.chat + bucket.report
    };
  });
}

export async function getPlatformStats() {
  const since24h = daysAgo(1);
  const since7d = daysAgo(7);
  const since30d = daysAgo(30);
  const dayLabels = lastNDayLabels(7);

  const [
    totalWallets,
    totalAnalyses,
    totalReports,
    totalChatMessages,
    avgHealth,
    avgReputation,
    analyses7d,
    reports7d,
    chatMessages7d,
    apiEvents7d,
    analysesLast7d,
    apiEventsLast7d,
    endpointBreakdown,
    totalApiEvents,
    apiEvents24h,
    externalApiEvents
  ] = await Promise.all([
    prisma.wallet.count(),
    prisma.analysisRun.count(),
    prisma.report.count(),
    prisma.chatMessage.count(),
    prisma.analysisRun.aggregate({ _avg: { financialHealthScore: true } }),
    prisma.analysisRun.aggregate({ _avg: { reputationScore: true } }),
    prisma.analysisRun.count({ where: { createdAt: { gte: since7d } } }),
    prisma.report.count({ where: { createdAt: { gte: since7d } } }),
    prisma.chatMessage.count({ where: { createdAt: { gte: since7d } } }),
    prisma.apiEvent.count({ where: { createdAt: { gte: since7d } } }),
    prisma.analysisRun.findMany({
      where: { createdAt: { gte: since7d } },
      select: { createdAt: true }
    }),
    prisma.apiEvent.findMany({
      where: { createdAt: { gte: since7d } },
      select: { endpoint: true, createdAt: true }
    }),
    prisma.apiEvent.groupBy({
      by: ["endpoint"],
      where: { createdAt: { gte: since30d } },
      _count: { _all: true },
      orderBy: { _count: { endpoint: "desc" } }
    }),
    prisma.apiEvent.count(),
    prisma.apiEvent.count({ where: { createdAt: { gte: since24h } } }),
    prisma.apiEvent.count({
      where: {
        metadata: {
          path: ["isExternal"],
          equals: true
        }
      }
    })
  ]);

  const dailyAnalyses = buildDailyCounts(analysesLast7d, dayLabels);
  const dailyApiUsage = buildDailyApiUsage(apiEventsLast7d, dayLabels);

  return {
    totals: {
      wallets: totalWallets,
      analyses: totalAnalyses,
      reports: totalReports,
      chatMessages: totalChatMessages,
      apiEvents: totalApiEvents,
      externalApiEvents: externalApiEvents
    },
    today: {
      apiEvents: apiEvents24h
    },
    averages: {
      financialHealthScore: avgHealth._avg.financialHealthScore ?? 0,
      reputationScore: avgReputation._avg.reputationScore ?? 0
    },
    last7Days: {
      analyses: analyses7d,
      reports: reports7d,
      chatMessages: chatMessages7d,
      apiEvents: apiEvents7d
    },
    endpointUsage: endpointBreakdown.map((row) => ({
      endpoint: row.endpoint,
      count: row._count._all
    })),
    dailyAnalyses,
    dailyApiUsage
  };
}

export async function getWalletStats(walletAddress: string) {
  const address = walletAddress.toLowerCase();

  const [analysisCount, reportCount, chatMessageCount, latestAnalysis] = await Promise.all([
    prisma.analysisRun.count({ where: { walletAddress: address } }),
    prisma.report.count({ where: { walletAddress: address } }),
    prisma.chatMessage.count({
      where: { session: { walletAddress: address } }
    }),
    prisma.analysisRun.findFirst({
      where: { walletAddress: address },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    })
  ]);

  return {
    walletAddress: address,
    analysisCount,
    reportCount,
    chatMessageCount,
    lastAnalyzedAt: latestAnalysis?.createdAt.toISOString() ?? null
  };
}
