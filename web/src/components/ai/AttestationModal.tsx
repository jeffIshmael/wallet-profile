"use client";

import { Copy, ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePaidApiFetch } from "@/hooks/usePaidApiFetch";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useWalletData } from "@/hooks/useWalletData";
import { CELOSCAN_BASE_URL } from "@/lib/blockchain/constants";

type ReportPurchaseResult = {
  reportId: string;
  reportHash: string;
  transactionHash: string;
  attestation: string;
  explorerUrl: string;
};

type PurchaseState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ReportPurchaseResult }
  | { status: "error"; message: string };

export function AttestationModal({ onClose }: { onClose: () => void }) {
  const { walletData } = useWalletData();
  const { address } = useWalletAuth();
  const paidFetch = usePaidApiFetch();
  const [purchase, setPurchase] = useState<PurchaseState>({ status: "idle" });

  useEffect(() => {
    const subjectWallet = walletData?.walletAddress;
    const buyer = address;
    if (!subjectWallet || !buyer) return;

    let cancelled = false;

    async function purchaseReport() {
      setPurchase({ status: "loading" });

      try {
        const response = await paidFetch("/api/agent/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: subjectWallet,
            buyerAddress: buyer
          })
        });

        const payload = (await response.json()) as ReportPurchaseResult & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Failed to purchase verified report.");
        }

        if (!cancelled) {
          setPurchase({
            status: "success",
            result: {
              reportId: payload.reportId,
              reportHash: payload.reportHash,
              transactionHash: payload.transactionHash,
              attestation: payload.attestation,
              explorerUrl: payload.explorerUrl || `${CELOSCAN_BASE_URL}/tx/${payload.transactionHash}`
            }
          });
        }
      } catch (error) {
        if (!cancelled) {
          setPurchase({
            status: "error",
            message: error instanceof Error ? error.message : "Failed to purchase verified report."
          });
        }
      }
    }

    void purchaseReport();
    return () => {
      cancelled = true;
    };
  }, [address, paidFetch, walletData?.walletAddress]);

  if (!walletData) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-void-surface p-5 shadow-[0_0_40px_-10px_rgba(247,147,26,0.2)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-space text-xl font-bold text-white">Verified Financial Passport</h2>
            {purchase.status === "success" ? (
              <p className="mt-2 font-mono text-xs text-stardust">
                Verification code:{" "}
                <span className="text-btc-orange">{purchase.result.reportId}</span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-stardust">
                Publishing your attestation on Celo after payment verification.
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

        {purchase.status === "loading" && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-stardust">
            <Loader2 size={18} className="animate-spin text-btc-orange" />
            Running analysis and publishing onchain attestation...
          </div>
        )}

        {purchase.status === "error" && (
          <p className="mt-5 rounded-xl border border-btc-orange/30 bg-btc-orange/10 p-4 text-sm text-stardust">
            {purchase.message}
          </p>
        )}

        {purchase.status === "success" && (
          <>
            <p className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-stardust">
              {purchase.result.attestation}
            </p>
            <p className="mt-3 font-mono text-[10px] text-stardust/80">
              Onchain hash: {purchase.result.reportHash}
            </p>
            <a
              href={purchase.result.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-btc-orange hover:underline"
            >
              View transaction on Celoscan
              <ExternalLink size={12} />
            </a>
          </>
        )}

        {purchase.status !== "loading" && (
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
                onClick={() => navigator.clipboard?.writeText(purchase.result.reportId)}
                className="inline-flex items-center gap-2 rounded-full bg-btc-orange px-4 py-2 text-sm font-medium text-white hover:bg-btc-orange/90"
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
}
