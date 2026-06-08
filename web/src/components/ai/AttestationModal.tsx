"use client";

import { Copy, X } from "lucide-react";
import { mockWallet } from "@/data/mockWallet";

export function AttestationModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-void-surface p-5 shadow-[0_0_40px_-10px_rgba(247,147,26,0.2)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-space text-xl font-bold text-white">Verified Financial Passport</h2>
            <p className="mt-2 font-mono text-xs text-stardust">
              Verification code: <span className="text-btc-orange">{mockWallet.verificationCode}</span>
            </p>
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
        <p className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-stardust">
          {mockWallet.attestation.paragraph}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-stardust hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(mockWallet.verificationCode)}
            className="inline-flex items-center gap-2 rounded-full bg-btc-orange px-4 py-2 text-sm font-medium text-white hover:bg-btc-orange/90"
          >
            <Copy size={15} />
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
}
