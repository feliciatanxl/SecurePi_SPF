"use client";

import { Coins, RotateCcw, Snowflake, TriangleAlert } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { COMPETENCY_LABEL, type DelayedConsequence } from "@/lib/types";

interface ConsequenceModalProps {
  consequence: DelayedConsequence | null;
  onReplay: () => void;
}

/**
 * The teaching payload. Not dismissible by backdrop or Escape — the player has
 * to acknowledge it, which is the whole point of the delayed-consequence loop.
 */
export function ConsequenceModal({
  consequence,
  onReplay,
}: ConsequenceModalProps) {
  return (
    <Modal
      open={Boolean(consequence)}
      dismissible={false}
      labelledBy="consequence-headline"
      className="bg-ink-850"
    >
      {consequence && (
        <div>
          <div className="flex items-start gap-3 border-b border-danger-500/20 bg-danger-500/10 px-5 py-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-danger-500/20 ring-1 ring-danger-500/40">
              <Snowflake className="h-5 w-5 text-danger-400" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-danger-400">
                3 days later
              </p>
              <h2
                id="consequence-headline"
                className="text-lg font-bold leading-tight text-white"
              >
                {consequence.headline}
              </h2>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            <p className="text-sm leading-relaxed text-slate-300">
              {consequence.body}
            </p>

            <div className="flex items-center justify-between rounded-2xl border border-danger-500/25 bg-danger-500/5 px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Wallet adjustment
              </span>
              <span className="flex items-center gap-1.5 text-base font-extrabold tabular-nums text-danger-400">
                <Coins className="h-4 w-4" />
                {consequence.coinDelta.toLocaleString()}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-800 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-gold-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                  Debrief · {COMPETENCY_LABEL[consequence.competency]}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {consequence.debrief}
              </p>
            </div>

            <button
              type="button"
              onClick={onReplay}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-shield-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-shield-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-300"
            >
              <RotateCcw className="h-4 w-4" />
              Replay the decision
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
