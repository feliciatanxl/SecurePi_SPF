"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

/**
 * The immediate payoff, full screen.
 *
 * This is the most load-bearing screen in the whole app, and the easiest one to
 * get wrong. It appears the instant a player accepts an offer that will cost
 * them later, and its entire job is to feel **good** — a big number, a warm
 * green, a genuine congratulation.
 *
 * Nothing here hedges. There is no warning colour, no cautionary copy, no
 * disabled button, no hint that anything is wrong, because the mechanic only
 * teaches if the reward lands honestly first. A player who is told at this
 * moment that they made a mistake learns "risky choices feel bad immediately",
 * which is the opposite of how recruitment actually works on people.
 *
 * It is deliberately non-blocking: the delayed consequence is already counting
 * down from the decision, so it arrives on its own schedule whether the player
 * is still looking at this screen or has moved on.
 */
export function RewardTakeover({
  open,
  amount,
  unit,
  headline,
  onContinue,
}: {
  open: boolean;
  /** The figure itself, e.g. "+300". */
  amount: string;
  /** What the figure is, e.g. "Coins". */
  unit: string;
  headline: string;
  onContinue: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="animate-fade fixed inset-0 z-40 bg-gradient-to-b from-leaf-600 to-leaf-700"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-amount"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col items-center justify-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] text-center text-white outline-none"
      >
        <span
          aria-hidden="true"
          className="animate-pop grid h-24 w-24 place-items-center rounded-full bg-white/20"
        >
          <Sparkles className="h-12 w-12 text-amber-400" strokeWidth={2.2} />
        </span>

        <p
          id="reward-amount"
          className="animate-pop mt-6 text-[64px] font-extrabold leading-none tracking-tight tabular-nums drop-shadow-sm"
        >
          {amount}
        </p>
        <p className="mt-1 text-[22px] font-extrabold uppercase tracking-[0.24em] text-leaf-100">
          {unit}
        </p>

        <p className="mt-8 text-[17px] font-bold leading-relaxed">{headline}</p>

        <button
          type="button"
          onClick={onContinue}
          className="mt-auto flex min-h-[54px] w-full items-center justify-center rounded-xl border-b-4 border-black/10 bg-white px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-leaf-700 transition hover:bg-leaf-50 active:translate-y-[3px] active:border-b-0"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
