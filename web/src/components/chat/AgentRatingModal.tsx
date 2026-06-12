"use client";

import { Loader2, Star, X } from "lucide-react";
import { useState } from "react";

type AgentRatingModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (stars: number) => Promise<void>;
};

export function AgentRatingModal({ open, onClose, onSubmit }: AgentRatingModalProps) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const active = hovered || stars;

  async function handleSubmit() {
    if (stars < 1 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(stars);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit rating.";
      if (message.includes("User rejected") || message.includes("rejected the request")) {
        setError("Transaction cancelled.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-labelledby="rating-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-void-surface p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="rating-title" className="font-sora text-base font-bold text-white">
              Rate Wallet Analyst AI
            </p>
            <p className="mt-1 text-xs leading-5 text-stardust">
              Your onchain rating helps other users discover OnFRA on the ERC-8004 reputation registry.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stardust hover:bg-white/5 hover:text-white"
            aria-label="Close rating modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={submitting}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(value)}
              className="rounded-lg p-1 transition hover:scale-110 disabled:opacity-50"
              aria-label={`Rate ${value} stars`}
            >
              <Star
                size={28}
                className={
                  value <= active
                    ? "fill-btc-orange text-btc-orange"
                    : "text-white/20"
                }
              />
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-center text-xs text-danger">{error}</p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-stardust transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={stars < 1 || submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-btc-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-btc-orange/90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit onchain"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
