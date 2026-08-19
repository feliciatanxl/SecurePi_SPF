"use client";

import { Check, Lightbulb, SignalHigh } from "lucide-react";
import type { DecodeRound } from "@/lib/types";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Signal strength, standing in for the usual hanging figure.
 *
 * The replacement is not cosmetic squeamishness — a gallows is an odd thing to
 * put in front of young people in a crime-prevention programme, and a signal
 * meter carries the same "you are running out of room" pressure while staying on
 * theme. Remaining attempts are stated as a number as well as drawn, so the
 * state never depends on the graphic.
 */
function SignalMeter({ left, total }: { left: number; total: number }) {
  return (
    <div>
      <p className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          <SignalHigh className="h-3.5 w-3.5" aria-hidden="true" />
          Signal strength
        </span>
        <span className="text-[13px] font-bold tabular-nums text-navy-900">
          {left} of {total} attempts left
        </span>
      </p>
      <div className="mt-1.5 flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-full ${
              i < left ? "bg-civic-600" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function DecodeBoard({
  round,
  roundNumber,
  roundTotal,
  guessed,
  attemptsLeft,
  attemptsTotal,
  solved,
  failed,
  onGuess,
  onNext,
  onRetryRound,
}: {
  round: DecodeRound;
  roundNumber: number;
  roundTotal: number;
  /** Letters the player has already tried, right or wrong. */
  guessed: string[];
  attemptsLeft: number;
  attemptsTotal: number;
  solved: boolean;
  failed: boolean;
  onGuess: (letter: string) => void;
  /** Present when there is another round after this one. */
  onNext?: () => void;
  onRetryRound: () => void;
}) {
  const letters = round.answer.split("");
  const revealed = letters.map((l) => guessed.includes(l) || solved || failed);

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft tabular-nums">
        Clue {roundNumber} of {roundTotal}
      </p>

      {/* The hint */}
      <div className="rounded-2xl border border-civic-200 bg-civic-50 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-civic-700">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          Hint
        </p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug text-navy-900">
          {round.hint}
        </p>
      </div>

      {/* The word */}
      <div>
        <p className="sr-only" aria-live="polite">
          {letters.map((l, i) => (revealed[i] ? l : "blank")).join(" ")}
        </p>
        <ul className="flex flex-wrap justify-center gap-1.5">
          {letters.map((letter, i) => (
            <li key={`${letter}-${i}`}>
              <span
                aria-hidden="true"
                className={`grid h-12 w-9 place-items-center rounded-lg border-2 text-xl font-extrabold uppercase ${
                  revealed[i]
                    ? solved
                      ? "border-leaf-600 bg-leaf-50 text-leaf-700"
                      : "border-navy-900 bg-surface text-navy-900"
                    : "border-line-strong border-b-navy-900 bg-surface-sunk text-transparent"
                }`}
              >
                {revealed[i] ? letter : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <SignalMeter left={attemptsLeft} total={attemptsTotal} />

      {/* Letter picker */}
      {!solved && !failed && (
        <div>
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            Pick a letter
          </h2>
          <ul className="grid grid-cols-7 gap-1">
            {ALPHABET.map((letter) => {
              const used = guessed.includes(letter);
              const hit = used && round.answer.includes(letter);
              return (
                <li key={letter}>
                  <button
                    type="button"
                    disabled={used}
                    onClick={() => onGuess(letter)}
                    aria-label={
                      used
                        ? `${letter}, already tried, ${hit ? "in the word" : "not in the word"}`
                        : `Guess ${letter}`
                    }
                    className={`grid h-11 w-full place-items-center rounded-lg border text-[14px] font-extrabold uppercase transition ${
                      hit
                        ? "border-leaf-600 bg-leaf-600 text-white"
                        : used
                          ? "border-line bg-surface-sunk text-ink-soft line-through"
                          : "border-line-strong bg-surface text-navy-900 hover:border-civic-500 hover:bg-civic-50"
                    }`}
                  >
                    {letter}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Round outcome */}
      {solved && (
        <section
          className="animate-rise rounded-2xl border border-leaf-200 bg-leaf-50 p-4"
          aria-live="polite"
        >
          <p className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-leaf-700">
            <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            {round.answer} decoded
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
            {round.meaning}
          </p>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-navy-900 px-4 text-[14px] font-extrabold text-white transition hover:bg-navy-800"
            >
              Next clue
            </button>
          )}
        </section>
      )}

      {failed && (
        <section
          className="animate-rise rounded-2xl border border-amber-200 bg-amber-50 p-4"
          aria-live="polite"
        >
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-amber-700">
            Signal lost — the word was {round.answer}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
            {round.meaning}
          </p>
          <button
            type="button"
            onClick={onRetryRound}
            className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-amber-600 px-4 text-[14px] font-extrabold text-amber-700 transition hover:bg-amber-100"
          >
            Try this clue again
          </button>
        </section>
      )}
    </div>
  );
}
