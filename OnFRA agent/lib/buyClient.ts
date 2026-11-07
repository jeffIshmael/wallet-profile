// FILE: lib/buyClient.ts
// Buys one Chainstack Celo RPC request body (up to 2000 JSON-RPC calls, $0.01) through the Buy gateway.
// CLI mode: shells out to the `buy` CLI, which signs and pays from the wallet in its keychain. This works on a
// machine where `buy setup` was run (your laptop, a worker with the CLI). It will NOT work on serverless hosts.
// Never auto-retry a failed purchase: Buy documents that 500 provision_failed / settle_uncertain may have settled.
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROUTE = "https://gateway.usebuy.ai/chainstack/celo";
const PRICE_USD = 0.01;

export interface BuyPurchase {
  service: string; via: "buy"; route: string; price_usd: number; token: string; settlement_tx: string | null;
}

let spentToday = 0;
let spentDay = new Date().toISOString().slice(0, 10);

function checkBudget() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== spentDay) { spentDay = today; spentToday = 0; }
  const budget = Number(process.env.BUY_DAILY_BUDGET_USD ?? 1);
  if (spentToday + PRICE_USD > budget) throw new Error(`Buy daily budget of $${budget} reached`);
}

export const buyEnabled = () => process.env.BUY_ENABLED === "true";

export async function buyChainstackBatch(calls: unknown[]): Promise<{ results: any[]; purchase: BuyPurchase }> {
  if (!buyEnabled()) throw new Error("Buy purchases are disabled (set BUY_ENABLED=true)");
  checkBudget();
  const token = process.env.BUY_TOKEN ?? "USDT";
  const account = process.env.BUY_ACCOUNT;
  const args = [
    ...(account ? ["--account", account] : []),
    "--verbose", "curl", "--max-amount", String(PRICE_USD), "--token", token,
    "-X", "POST", "-H", "Content-Type: application/json", "--data", JSON.stringify(calls), ROUTE,
  ];
  let stdout = "", stderr = "";
  try {
    ({ stdout, stderr } = await run(process.env.BUY_BIN ?? "buy", args, { timeout: 90_000, maxBuffer: 20 * 1024 * 1024 }));
  } catch (e: any) {
    throw new Error(`Buy purchase failed: ${String(e?.stderr || e?.message || e).slice(0, 400)}`);
  }
  spentToday += PRICE_USD;
  let results: any[];
  try { results = JSON.parse(stdout); } catch { throw new Error(`Buy returned a non-JSON body: ${stdout.slice(0, 200)}`); }
  const hashes = stderr.match(/0x[a-fA-F0-9]{64}/g);
  return {
    results: Array.isArray(results) ? results : [results],
    purchase: { service: "Chainstack Celo RPC", via: "buy", route: "POST /chainstack/celo", price_usd: PRICE_USD, token, settlement_tx: hashes ? hashes[hashes.length - 1] : null },
  };
}
