"use client";

import { Check, Copy, Download, ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePaidApiFetch } from "@/hooks/usePaidApiFetch";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useWalletData } from "@/hooks/useWalletData";
import { consumeReportProgressStream } from "@/lib/reports/consumeReportStream";
import { dispatchReportsUpdated } from "@/lib/reports/reportsEvents";
import { copyWithToast } from "@/lib/copyToClipboard";
import type { ReportCompletedResult, ReportProgressStep } from "@/types/reportProgress";

const STEP_ORDER: ReportProgressStep[] = ["payment", "analysis", "pdf", "ipfs", "onchain", "saving"];

type ProgressEntry = {
  step: ReportProgressStep | "x402";
  message: string;
  status: "active" | "done";
};

type PurchaseState =
  | { status: "idle" }
  | { status: "loading"; logs: ProgressEntry[] }
  | { status: "success"; result: ReportCompletedResult; logs: ProgressEntry[] }
  | { status: "error"; message: string; logs: ProgressEntry[] };

function upsertLog(logs: ProgressEntry[], entry: ProgressEntry): ProgressEntry[] {
  const idx = logs.findIndex((log) => log.step === entry.step);
  if (idx === -1) return [...logs, entry];
  const next = [...logs];
  next[idx] = entry;
  return next;
}

function markPreviousDone(logs: ProgressEntry[], currentStep: ReportProgressStep): ProgressEntry[] {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return logs.map((log) => {
    if (log.step === "x402") return log.status === "active" ? { ...log, status: "done" } : log;
    const stepIndex = STEP_ORDER.indexOf(log.step as ReportProgressStep);
    if (stepIndex !== -1 && stepIndex < currentIndex && log.status === "active") {
      return { ...log, status: "done" };
    }
    return log;
  });
}

export function AttestationModal({ onClose }: { onClose: () => void }) {
  const { walletData } = useWalletData();
  const { address } = useWalletAuth();
  const paidFetch = usePaidApiFetch();
  const [purchase, setPurchase] = useState<PurchaseState>({ status: "idle" });
  const purchaseStartedRef = useRef(false);

  useEffect(() => {
    const subjectWallet = walletData?.walletAddress;
    const buyer = address;
    if (!subjectWallet || !buyer) return;
    if (purchaseStartedRef.current) return;
    purchaseStartedRef.current = true;

    async function purchaseReport() {
      const initialLogs: ProgressEntry[] = [
        {
          step: "x402",
          message:
            process.env.NODE_ENV === "development"
              ? "Authorizing USDT payment via x402… (dev mode: simulated — balance won't change)"
              : "Authorizing USDT payment via x402…",
          status: "active"
        }
      ];
      setPurchase({ status: "loading", logs: initialLogs });

      try {
        const response = await paidFetch("/api/agent/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: subjectWallet,
            buyerAddress: buyer
          })
        });

        let logs = upsertLog(initialLogs, {
          step: "x402",
          message: "Payment authorized.",
          status: "done"
        });

        setPurchase({ status: "loading", logs });

        let result: ReportCompletedResult | null = null;

        await consumeReportProgressStream(response, (event) => {
          if (event.type === "status") {
            logs = markPreviousDone(logs, event.step);
            logs = upsertLog(logs, {
              step: event.step,
              message: event.message,
              status: "active"
            });
            setPurchase({ status: "loading", logs: [...logs] });
            return;
          }

          if (event.type === "done") {
            logs = STEP_ORDER.reduce<ProgressEntry[]>((acc, step) => {
              const existing = logs.find((log) => log.step === step);
              acc.push(
                existing
                  ? { ...existing, status: "done" }
                  : {
                      step,
                      message:
                        step === "payment"
                          ? "Payment received."
                          : step === "saving"
                            ? "Report saved to your account."
                            : "Complete.",
                      status: "done"
                    }
              );
              return acc;
            }, []);
            logs = upsertLog(logs, {
              step: "x402",
              message: "Payment authorized.",
              status: "done"
            });
            result = event.result;
            setPurchase({ status: "success", result: event.result, logs: [...logs] });
            dispatchReportsUpdated();
          }
        });

        if (!result) {
          throw new Error("Report completed without a result payload.");
        }
      } catch (error) {
        setPurchase((prev) => ({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to purchase verified report.",
          logs: prev.status === "loading" || prev.status === "error" ? prev.logs : initialLogs
        }));
      }
    }

    void purchaseReport();
  }, [address, paidFetch, walletData?.walletAddress]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!walletData) return null;

  const isLoading = purchase.status === "loading";

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-4 pt-14 sm:pt-20">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attestation-modal-title"
        className="relative z-10 max-h-[min(90dvh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-void-surface p-5 shadow-[0_0_40px_-10px_rgba(247,147,26,0.2)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="attestation-modal-title" className="font-space text-xl font-bold text-white">
              Verified Financial Passport
            </h2>
            {purchase.status === "success" ? (
              <p className="mt-2 text-xs text-emerald-400">Report successfully created.</p>
            ) : (
              <p className="mt-2 text-xs text-stardust">
                Follow the steps below. Your report will be saved to My Reports either way.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-stardust hover:text-btc-orange"
            aria-label="Close attestation modal"
          >
            <X size={17} />
          </button>
        </div>

        {!address && (
          <p className="mt-5 rounded-xl border border-btc-orange/30 bg-btc-orange/10 p-4 text-sm text-stardust">
            Connect your wallet to purchase and publish a verified report.
          </p>
        )}

        {(purchase.status === "loading" ||
          purchase.status === "success" ||
          purchase.status === "error") && (
          <ul className="mt-5 space-y-2 rounded-xl border border-white/10 bg-black/40 p-4">
            {purchase.logs.map((log) => (
              <li key={log.step} className="flex items-start gap-2.5 text-sm text-stardust">
                {log.status === "done" ? (
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                ) : (
                  <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin text-btc-orange" />
                )}
                <span className={log.status === "done" ? "text-white/90" : "text-white"}>
                  {log.message}
                </span>
              </li>
            ))}
          </ul>
        )}

        {purchase.status === "error" && (
          <p className="mt-4 rounded-xl border border-btc-orange/30 bg-btc-orange/10 p-4 text-sm text-stardust">
            {purchase.message}
          </p>
        )}

        {purchase.status === "success" && (
          <>
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs text-stardust">Verification code</p>
              <p className="mt-1 font-mono text-sm font-semibold text-emerald-300">
                {purchase.result.reportId}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={purchase.result.ipfsUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 rounded-full bg-btc-orange px-4 py-2 text-xs font-semibold text-white hover:bg-btc-orange/90"
              >
                <Download size={14} />
                Download PDF
              </a>
              <a
                href={purchase.result.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-btc-orange hover:underline"
              >
                View transaction on Celoscan
                <ExternalLink size={12} />
              </a>
            </div>
            <p className="mt-3 text-[11px] text-stardust/80">
              Open the PDF for the full AI lender assessment. This report is saved under My Reports — download anytime without paying again.
            </p>
          </>
        )}

        {!isLoading && (
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-stardust hover:text-white"
            >
              Close
            </button>
            {purchase.status === "success" && (
              <button
                type="button"
                onClick={() =>
                  void copyWithToast(purchase.result.reportId, "Verification code copied")
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-stardust hover:text-white"
              >
                <Copy size={15} />
                Copy Code
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
