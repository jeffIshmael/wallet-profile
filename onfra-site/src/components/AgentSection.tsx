"use client";

import { useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Coins,
  Copy,
  FileText,
  GitCompare,
  PieChart,
  Search,
  Terminal,
  TrendingUp,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/cn";

const INSTALL_COMMAND = "npx skills add jeffIshmael/onfra-skill";

type Tool = {
  id: string;
  title: string;
  badge?: string;
  /** TODO: placeholder prices (USDT per call, settled over x402). Replace with real values. */
  price: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  inputs: string[];
  output: string;
};

const TOOLS: Tool[] = [
  {
    id: "analyze_wallet",
    title: "Analyze Wallet",
    badge: "Flagship",
    price: "0.05",
    icon: Wallet,
    description:
      "A full financial profile of a wallet: age, activity, inflows and outflows, dominant tokens and plain-language insights.",
    inputs: ["wallet_address", "chain", "period?"],
    output: `{
  "wallet_address": "0x...",
  "chain": "celo",
  "analysis_period": "90d",
  "wallet_overview": {
    "wallet_age_days": 420,
    "total_transactions": 850,
    "active_days": 67,
    "unique_counterparties": 34
  },
  "financial_summary": {
    "total_received_usd": 5200.50,
    "total_sent_usd": 3850.25,
    "net_flow_usd": 1350.25
  },
  "token_overview": {
    "dominant_token": "USDC",
    "dominant_token_share": 72.5
  },
  "insights": [
    "USDC accounts for most of the wallet's volume."
  ],
  "data_quality": { "complete": true, "limitations": [] }
}`
  },
  {
    id: "get_cash_flow_summary",
    title: "Cash Flow Summary",
    price: "0.02",
    icon: TrendingUp,
    description:
      "Total inflow, outflow and net flow for a period, with transaction counts, daily averages and the overall trend.",
    inputs: ["wallet_address", "chain", "period", "currency?"],
    output: `{
  "period": "30d",
  "currency": "USD",
  "cash_flow": {
    "total_inflow": 2500.00,
    "total_outflow": 1800.00,
    "net_flow": 700.00
  },
  "transaction_counts": { "incoming": 35, "outgoing": 22 },
  "averages": { "daily_inflow": 83.33, "daily_outflow": 60.00 },
  "trend": "positive",
  "insights": [
    "The wallet received $700 more than it sent."
  ]
}`
  },
  {
    id: "get_token_balances",
    title: "Token Balances",
    price: "0.01",
    icon: Coins,
    description:
      "Current holdings, normalized across tokens, with spam filtering and optional USD valuations.",
    inputs: ["wallet_address", "chain", "include_spam?", "include_prices?"],
    output: `{
  "chain": "celo",
  "total_value_usd": 1250,
  "tokens": [
    {
      "symbol": "USDC",
      "balance": "1000",
      "price_usd": 1,
      "value_usd": 1000
    },
    {
      "symbol": "CELO",
      "balance": "100",
      "price_usd": 2.5,
      "value_usd": 250
    }
  ]
}`
  },
  {
    id: "get_token_breakdown",
    title: "Token Breakdown",
    price: "0.02",
    icon: PieChart,
    description:
      "How activity is spread across tokens by balance, received, sent or total volume, with each token's share.",
    inputs: ["wallet_address", "chain", "period?", "metric?"],
    output: `{
  "period": "90d",
  "metric": "volume",
  "tokens": [
    {
      "symbol": "USDC",
      "received_usd": 3500,
      "sent_usd": 2200,
      "total_volume_usd": 5700,
      "share_percent": 72.5
    }
  ],
  "dominant_token": { "symbol": "USDC", "share_percent": 72.5 }
}`
  },
  {
    id: "generate_transaction_statement",
    title: "Transaction Statement",
    price: "0.10",
    icon: FileText,
    description:
      "Builds a PDF or CSV statement for a period and returns a reference to it, so your agent never has to handle hundreds of rows.",
    inputs: ["wallet_address", "chain", "period", "format?", "currency?"],
    output: `{
  "statement_id": "stmt_12345",
  "period": { "start": "2026-09-01", "end": "2026-09-30" },
  "summary": {
    "total_inflow": 2500.00,
    "total_outflow": 1800.00,
    "net_flow": 700.00
  },
  "statement": {
    "format": "pdf",
    "ipfs_cid": "bafy...",
    "uri": "ipfs://bafy..."
  },
  "transaction_count": 57,
  "generated_at": "2026-10-31T12:00:00Z"
}`
  },
  {
    id: "compare_periods",
    title: "Compare Periods",
    price: "0.03",
    icon: GitCompare,
    description:
      "Puts two equivalent time windows side by side and reports the change in inflow, outflow, net flow and activity.",
    inputs: ["wallet_address", "chain", "current_period", "previous_period", "metrics?"],
    output: `{
  "comparison": {
    "current_period": "2026-10",
    "previous_period": "2026-09"
  },
  "metrics": {
    "inflow": { "current": 2500, "previous": 1800, "change_percent": 38.89 },
    "outflow": { "current": 1800, "previous": 1500, "change_percent": 20 },
    "net_flow": { "current": 700, "previous": 300, "change_percent": 133.33 }
  },
  "insights": [
    "Incoming value increased by 38.89%."
  ]
}`
  },
  {
    id: "explain_transaction",
    title: "Explain Transaction",
    price: "0.01",
    icon: Search,
    description:
      "Turns a transaction hash into plain language: what happened, the type, the amounts, and how confident OnFRA is.",
    inputs: ["transaction_hash", "chain", "wallet_address?"],
    output: `{
  "status": "success",
  "transaction_type": "token_transfer",
  "summary": "The wallet sent 150 USDC to another address.",
  "details": {
    "token": "USDC",
    "amount": 150,
    "gas_fee": { "amount": 0.002, "token": "CELO" }
  },
  "classification": {
    "category": "outgoing_payment",
    "confidence": 0.96
  },
  "warnings": []
}`
  },
  {
    id: "get_spending_breakdown",
    title: "Spending Breakdown",
    price: "0.03",
    icon: PieChart,
    description:
      "Shows where money went, grouped by token, counterparty, protocol or category, with an unknown bucket where the purpose is unclear.",
    inputs: ["wallet_address", "chain", "period", "group_by?"],
    output: `{
  "period": "30d",
  "total_spending_usd": 1800,
  "breakdown": [
    { "category": "DeFi", "amount_usd": 900, "share_percent": 50 },
    { "category": "Transfers", "amount_usd": 600, "share_percent": 33.33 },
    { "category": "Other", "amount_usd": 300, "share_percent": 16.67 }
  ]
}`
  }
];

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable; the command is still selectable */
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-2xl border border-[#2a2733] bg-[#111017] text-left shadow-xl shadow-[#564870]/20">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/60">
          <Terminal className="h-3.5 w-3.5" />
          <span>Install the OnFRA skill</span>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy install command"
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b7aedb]"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="overflow-x-auto px-5 py-4 font-mono text-sm text-emerald-300">
        <span className="select-none text-white/40">$ </span>
        <span className="select-all whitespace-nowrap">{INSTALL_COMMAND}</span>
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false);
  const Icon = tool.icon;
  const panelId = `${tool.id}-output`;

  return (
    <article
      className={cn(
        "flex flex-col rounded-3xl border bg-white p-6 text-left transition-shadow",
        tool.badge ? "border-[#564870] shadow-lg shadow-[#564870]/10" : "border-[#d4cee1] shadow-sm",
        open && "shadow-lg shadow-[#564870]/10"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebe8f3] text-[#564870]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-end">
          <span className="rounded-full bg-[#f3f1f8] px-3 py-1 text-xs font-bold text-[#43385a]">
            {tool.price} USDT
          </span>
          <span className="mt-1 text-[10px] font-medium text-[#6f6b7a]">per call</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold text-[#111017]">{tool.title}</h3>
        {tool.badge && (
          <span className="rounded-full bg-[#564870] px-2.5 py-0.5 text-[10px] font-bold text-white">
            {tool.badge}
          </span>
        )}
      </div>
      <p className="mt-1 font-mono text-[11px] text-[#564870]">{tool.id}</p>
      <p className="mt-3 text-xs leading-6 text-[#5f5c67]">{tool.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tool.inputs.map((input) => (
          <span
            key={input}
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[10px]",
              input.endsWith("?")
                ? "border border-dashed border-[#c9c2dc] text-[#6f6b7a]"
                : "bg-[#ebe8f3] text-[#43385a]"
            )}
          >
            {input}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="mt-5 flex items-center justify-between rounded-full border border-[#d4cee1] px-4 py-2 text-xs font-bold text-[#111017] transition hover:border-[#b7aedb] hover:bg-[#f3f1f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#564870]"
      >
        <span>{open ? "Hide output" : "See example output"}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <pre
            tabIndex={open ? 0 : -1}
            className="mt-3 max-h-80 overflow-auto rounded-2xl bg-[#111017] p-4 font-mono text-[11px] leading-5 text-emerald-300"
          >
            <code>{tool.output}</code>
          </pre>
        </div>
      </div>
    </article>
  );
}

export function AgentSection() {
  return (
    <section id="for-agents" className="section-light scroll-mt-24 border-t border-[#d4cee1]/70 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="label-accent">For Agents</p>
          <h2 className="headline mx-auto mt-3 max-w-2xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
            Give your agent financial intelligence, not raw transactions.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#5f5c67]">
            Install the OnFRA skill and your agent can analyze wallets, break down spending and generate statements.
            Every tool returns structured JSON, and you pay per call over x402 on Celo.
          </p>
        </div>

        <InstallCommand />

        <div className="mt-16 flex items-center gap-2 text-xs font-bold text-[#43385a]">
          <Bot className="h-4 w-4" />
          <span>Tools your agent gets</span>
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-6 text-[#6f6b7a]">
          Counterparty ranking and wallet activity tools are coming next. Figures in example outputs are illustrative.
        </p>
      </div>
    </section>
  );
}