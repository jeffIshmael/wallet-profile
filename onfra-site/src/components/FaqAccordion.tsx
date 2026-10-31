"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Do I need to connect my wallet?",
    answer:
      "Not necessarily. You can start by entering any supported public Celo wallet address to explore its public activity. Connecting your wallet in the OnFRA App allows you to access account-specific features, request verified reports, and save statements."
  },
  {
    question: "What does OnFRA analyze?",
    answer:
      "OnFRA analyzes publicly available transaction activity on supported networks (currently Celo Mainnet). It reviews incoming and outgoing cash flows, recurring inflow consistency, wallet longevity, token transfers (CELO, cUSD, cEUR, USDT, USDC), and contract interaction patterns."
  },
  {
    question: "Can I use OnFRA to prove my income?",
    answer:
      "OnFRA organizes your onchain activity and estimates income patterns from supported wallet data. You can use the resulting transaction statements and financial reports to explain your onchain earnings, but formal acceptance by a lender, landlord, or financial institution is determined by that specific counterparty."
  },
  {
    question: "Does an OnFRA report guarantee a loan?",
    answer:
      "No. OnFRA is an independent onchain financial reputation and intelligence platform, not a lender or credit broker. Lenders and DeFi protocols make their own underwriting decisions using their own criteria."
  },
  {
    question: "Is my wallet activity private?",
    answer:
      "Public blockchain transactions are naturally transparent and viewable on public network explorers. OnFRA analyzes this publicly accessible data. We do not require personal identity documents (like SSNs or government IDs) to run basic wallet analysis."
  },
  {
    question: "Which networks are supported?",
    answer:
      "OnFRA currently analyzes wallets on Celo Mainnet, with full support for native CELO and major stablecoins including USDT, USDC, and cUSD."
  },
  {
    question: "Can an organization or AI agent use OnFRA?",
    answer:
      "Yes! OnFRA provides financial reporting capabilities for DAOs and treasury teams, and programmatic access for autonomous AI agents via REST APIs, Model Context Protocol (MCP), and x402 machine micropayments."
  }
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-purple-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="divide-y divide-purple-100/80">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900 transition hover:text-purple-600 sm:text-base"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-purple-600 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="mt-3 pr-6 text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7 animate-fade-in">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
