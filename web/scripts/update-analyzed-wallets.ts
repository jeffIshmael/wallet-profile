// Script to re-analyze all wallets in the database using the updated Celo public node + Blockscout explorer
// and update their records with real onchain data.
import { prisma } from "../src/lib/db/prisma";
import { runDashboardAnalysis } from "../src/lib/agent/onfraServer";
import { saveAnalysisRun } from "../src/lib/db/analysis";
import { getPlatformStats } from "../src/lib/db/stats";

async function main() {
  console.log("=================================================");
  console.log("   Updating All Analysed Wallets with Real Data  ");
  console.log("=================================================\n");

  const wallets = await prisma.wallet.findMany({
    orderBy: { createdAt: "asc" }
  });

  console.log(`Found ${wallets.length} wallets in database to refresh.\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const prefix = `[${i + 1}/${wallets.length}]`;
    console.log(`${prefix} Analyzing wallet: ${wallet.address}...`);

    const start = Date.now();
    try {
      const data = await runDashboardAnalysis(wallet.address, { force: true });
      const run = await saveAnalysisRun(wallet.address, data);
      const ms = Date.now() - start;

      const health = data.metrics?.financialHealth?.score ?? 0;
      const rep = data.metrics?.reputation?.score ?? 0;
      const txs = data.totalTransactions ?? data.transactions?.length ?? 0;
      const label = data.metrics?.incomeProfile?.label ?? "Unknown";

      console.log(
        `   ✅ ${prefix} Saved run ${run.id} in ${ms}ms -> Txs: ${txs}, Health: ${health}/100, Rep: ${rep}/100, Income: ${label}`
      );
      successCount++;
    } catch (err: any) {
      const ms = Date.now() - start;
      console.error(`   ❌ ${prefix} Failed (${ms}ms):`, err?.message || err);
      failCount++;
    }

    // Brief pause between wallets to respect RPC/Explorer rate limits
    if (i < wallets.length - 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  console.log("\n=================================================");
  console.log(`Finished: ${successCount} succeeded, ${failCount} failed.`);
  console.log("=================================================\n");

  console.log("Fetching updated platform stats from database...");
  const stats = await getPlatformStats();
  console.log("Updated Totals:", stats.totals);
  console.log("Updated Averages:", stats.averages);
  console.log("Recent Analyses count:", stats.recentAnalyses?.length);
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

