"use client";

import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import type { ReportRecord } from "@/types/reportRecord";

type ReportsState =
  | { status: "idle" | "loading" }
  | { status: "ready"; reports: ReportRecord[] }
  | { status: "error"; message: string };

function formatReportDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(iso));
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function MyReportsCard() {
  const { address } = useWalletAuth();
  const [state, setState] = useState<ReportsState>({ status: "idle" });

  useEffect(() => {
    if (!address) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;

    async function loadReports() {
      setState({ status: "loading" });
      try {
        const response = await fetch(`/api/agent/reports?address=${address}`);
        const payload = (await response.json()) as {
          reports?: ReportRecord[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load reports.");
        }

        if (!cancelled) {
          setState({ status: "ready", reports: payload.reports ?? [] });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Failed to load reports."
          });
        }
      }
    }

    void loadReports();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!address) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-void-surface p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-btc-orange" />
        <h3 className="font-space text-sm font-semibold text-white">Your Verified Reports</h3>
      </div>
      <p className="mt-1 text-xs text-stardust">
        Reports you purchased are pinned on IPFS and registered on Celo.
      </p>

      {state.status === "loading" && (
        <div className="mt-4 flex items-center gap-2 text-xs text-stardust">
          <Loader2 size={14} className="animate-spin text-btc-orange" />
          Loading reports...
        </div>
      )}

      {state.status === "error" && (
        <p className="mt-4 rounded-xl border border-btc-orange/30 bg-btc-orange/10 p-3 text-xs text-stardust">
          {state.message}
        </p>
      )}

      {state.status === "ready" && state.reports.length === 0 && (
        <p className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-stardust">
          No verified reports yet. Generate a Financial Passport to publish your first report.
        </p>
      )}

      {state.status === "ready" && state.reports.length > 0 && (
        <ul className="mt-4 space-y-2">
          {state.reports.map((report) => (
            <li
              key={report.id}
              className="rounded-xl border border-white/10 bg-black/30 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-btc-orange">{report.reportId}</p>
                  <p className="mt-1 text-[11px] text-stardust">
                    Wallet {shortAddress(report.walletAddress)} · {formatReportDate(report.createdAt)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-stardust/70">
                    IPFS: {report.ipfsCid.slice(0, 18)}...
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={report.ipfsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-stardust hover:text-white"
                  >
                    <Download size={12} />
                    Download PDF
                  </a>
                  <a
                    href={report.ipfsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-stardust hover:text-white"
                  >
                    <ExternalLink size={12} />
                    IPFS
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
