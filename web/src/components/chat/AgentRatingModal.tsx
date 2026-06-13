"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { AGENT_FEEDBACK_TAG_OPTIONS, type AgentFeedbackTagId } from "@/lib/blockchain/erc8004Feedback";

type AgentRatingModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (tags: AgentFeedbackTagId[]) => Promise<void>;
};

export function AgentRatingModal({ open, onClose, onSubmit }: AgentRatingModalProps) {
  const [selected, setSelected] = useState<AgentFeedbackTagId[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function toggleTag(tag: AgentFeedbackTagId) {
    setSelected((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  }

  async function handleSubmit() {
    if (selected.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(selected);
      setSelected([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit rating.");
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
              How was OnFRA agent?
            </p>
            <p className="mt-1 text-xs leading-5 text-stardust">
              Pick what stood out — your onchain feedback helps others discover OnFRA.
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

        <div className="mt-4 flex flex-wrap gap-2">
          {AGENT_FEEDBACK_TAG_OPTIONS.map(({ id, label }) => {
            const active = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                disabled={submitting}
                onClick={() => toggleTag(id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                  active
                    ? "border-btc-orange/50 bg-btc-orange/15 text-btc-orange"
                    : "border-white/10 bg-black/30 text-stardust hover:border-white/20 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-3 text-center text-xs text-danger">{error}</p>}

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
            disabled={selected.length === 0 || submitting}
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
