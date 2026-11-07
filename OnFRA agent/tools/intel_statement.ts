// FILE: tools/intel_statement.ts
// generate_transaction_statement: builds a PDF or CSV, pins it to IPFS, returns the reference.
import crypto from "node:crypto";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ledgerFor, envelope, flowEntries, summarizeFlows, normalizeAddress, parsePeriod } from "../lib/ledger.js";
import { buildCsv, buildPdf } from "../lib/statementFiles.js";
import { pinToIpfs, verifyRetrievable, gatewayUrl, sha256Hex } from "../lib/ipfs.js";

export const generateTransactionStatement = tool(
  async ({ wallet_address, period, format, currency }) => {
    const w = normalizeAddress(wallet_address);
    parsePeriod(period); // fail fast on a bad period before doing any work
    const ledger = await ledgerFor(w, period);
    const f = summarizeFlows(flowEntries(ledger));
    const summary = { total_inflow: f.inflow, total_outflow: f.outflow, net_flow: f.net };
    const extra: string[] = [];
    if (currency.toUpperCase() !== "USD") extra.push(`Currency conversion to ${currency} is not supported yet; amounts are in USD.`);
    const env = envelope(ledger, [...extra, "The statement is pinned to public IPFS: anyone with the link can read it."]);
    const statementId = `STM-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

    const entries = ledger.entries; // includes swap legs and self transfers, flagged in the CSV
    const file = format === "csv"
      ? buildCsv(entries)
      : await buildPdf({ wallet: w, periodLabel: ledger.period.label, start: env.period.start, end: env.period.end, summary, entries, statementId, limitations: env.data_quality.limitations });
    const filename = `${statementId}.${format}`;
    const { cid } = await pinToIpfs(file, filename, format === "csv" ? "text/csv" : "application/pdf");
    if (!(await verifyRetrievable(cid))) throw new Error(`Statement was pinned (${cid}) but could not be retrieved from the gateway yet. Try again shortly.`);

    return JSON.stringify({
      ...env, statement_id: statementId, currency: "USD", summary,
      statement: { format, ipfs_cid: cid, uri: `ipfs://${cid}`, gateway_url: gatewayUrl(cid), access: "public", size_bytes: file.length, sha256: sha256Hex(file) },
      transaction_count: ledger.hashes.size,
    }, null, 2);
  },
  {
    name: "generate_transaction_statement",
    description: "Generates a downloadable transaction statement (PDF or CSV) for a wallet and period, pins it to IPFS and returns the CID and gateway link with a summary. The link is public.",
    schema: z.object({
      wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/), chain: z.enum(["celo"]).default("celo"),
      period: z.string().default("90d"), format: z.enum(["pdf", "csv"]).default("pdf"), currency: z.string().default("USD"),
    }),
  },
);
