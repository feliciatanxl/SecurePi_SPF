"use client";

import { Check, Clock3, Lightbulb, X } from "lucide-react";
import type { PredictRound } from "@/lib/types";

/**
 * One round of What Happens Next?
 *
 * The card leads with what the person was *given*, in the same green the app
 * uses for a reward, before asking what follows. That contrast is the whole
 * exercise: the delayed consequence only teaches anything if the payoff is
 * allowed to look good first.
 */
export function PredictBoard({
  round,
  roundNumber,
  roundTotal,
  chosen,
  onChoose,
  onNext,
  isLast,
}: {
  round: PredictRound;
  roundNumber: number;
  roundTotal: number;
  chosen: number | null;
  onChoose: (index: number) => void;
  onNext?: () => void;
  isLast: boolean;
}) {
  const answered = chosen !== null;
  const correct = chosen === round.answerIndex;

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft tabular-nums">
        Situation {roundNumber} of {roundTotal}
      </p>

      <div className="rounded-2xl border border-line bg-surface-sunk p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          What already happened
        </p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug text-navy-900">
          {round.setup}
        </p>
        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-leaf-200 bg-leaf-50 px-2.5 py-1.5 text-[13px] font-bold text-leaf-700">
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          {round.immediate}
        </p>
      </div>

      <div>
        <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold leading-snug text-navy-900">
          <Clock3 className="h-4 w-4 shrink-0 text-civic-700" aria-hidden="true" />
          {round.prompt}
        </h2>
        <ul className="mt-2.5 space-y-2">
          {round.options.map((option, i) => {
            const isChosen = chosen === i;
            const isAnswer = i === round.answerIndex;
            const style = !answered
              ? "border-line-strong bg-surface hover:border-civic-500 hover:bg-civic-50"
              : isAnswer
                ? "border-leaf-600 bg-leaf-50"
                : isChosen
                  ? "border-coral-600 bg-coral-50"
                  : "border-line bg-surface opacity-70";

            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => onChoose(i)}
                  disabled={answered}
                  aria-pressed={isChosen}
                  className={`flex min-h-[56px] w-full items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 text-left text-[14px] font-semibold leading-snug text-navy-900 transition disabled:cursor-default ${style}`}
                >
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line-strong bg-surface-sunk text-[12px] font-extrabold text-ink-muted"
                  >
                    {answered && isAnswer ? (
                      <Check className="h-3.5 w-3.5 text-leaf-700" strokeWidth={3} />
                    ) : answered && isChosen ? (
                      <X className="h-3.5 w-3.5 text-coral-700" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {answered && (
        <section
          className="animate-rise rounded-2xl border border-line bg-surface p-4"
          aria-live="polite"
        >
          <p className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
            <Lightbulb className="h-4 w-4 text-amber-600" aria-hidden="true" />
            {correct ? "That is what follows" : "Here is what follows"}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
            {round.explanation}
          </p>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-navy-900 px-4 text-[14px] font-extrabold text-white transition hover:bg-navy-800"
            >
              {isLast ? "See what you built" : "Next situation"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
