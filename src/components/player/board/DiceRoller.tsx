"use client";

import type { TurnPhase } from "@/lib/hooks/useDiceTurn";

/**
 * The roll control and the die.
 *
 * An original six-sided die drawn from pips — no casino felt, no chips, no
 * jackpot flourish and no "you rolled high, have a prize". The copy states
 * plainly what the die is for, because a young person should never come away
 * thinking a good outcome here was luck.
 */

/** Pip layout per face, on a 3×3 grid read left to right, top to bottom. */
const FACES: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

export function Die({
  value,
  className = "h-9 w-9",
  tumbling = false,
}: {
  value: number;
  className?: string;
  tumbling?: boolean;
}) {
  const pips = FACES[value] ?? FACES[1];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 grid-cols-3 gap-[2px] rounded-lg border-2 border-navy-900/15 bg-white p-1 shadow-[inset_0_-2px_0_rgba(11,37,69,0.12)] ${className} ${
        tumbling ? "animate-tumble" : ""
      }`}
    >
      {pips.map((on, i) => (
        <span
          key={i}
          className={`rounded-full ${on ? "bg-navy-900" : "bg-transparent"}`}
        />
      ))}
    </span>
  );
}

export function DiceRoller({
  phase,
  value,
  onRoll,
  /** Shown instead of the roll control while an activity sheet is open. */
  disabled,
}: {
  phase: TurnPhase;
  value: number | null;
  onRoll: () => void;
  disabled?: boolean;
}) {
  const rolling = phase === "rolling";
  const showing = phase === "result" || phase === "moving";

  return (
    <div className="flex items-center gap-2.5">
      <div className="min-w-0 flex-1">
        {showing && value !== null ? (
          <p
            className="flex min-h-[52px] items-center justify-center gap-3 rounded-xl border-2 border-amber-400 bg-navy-900 px-3"
            role="status"
            aria-live="polite"
          >
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-400">
              You rolled
            </span>
            <Die value={value} className="h-10 w-10" />
            <span className="text-[26px] font-extrabold leading-none tabular-nums text-white">
              {value}
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={onRoll}
            disabled={disabled || rolling}
            className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-4 text-[15px] font-extrabold uppercase tracking-[0.1em] text-navy-900 transition hover:bg-amber-400 active:translate-y-[3px] active:border-b-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[9px] font-bold tracking-[0.2em] text-navy-900/70">
                Your turn
              </span>
              <span>{rolling ? "Rolling…" : "Roll dice"}</span>
            </span>
            <Die value={rolling ? 6 : 4} className="h-9 w-9" tumbling={rolling} />
          </button>
        )}
      </div>
    </div>
  );
}
