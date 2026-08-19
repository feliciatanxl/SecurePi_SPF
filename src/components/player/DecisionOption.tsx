"use client";

import { Loader2 } from "lucide-react";
import type { ScenarioChoice } from "@/lib/types";

/**
 * Every option renders identically until a decision is committed.
 *
 * This is deliberate and load-bearing: colour-coding the safe answer would turn
 * the scenario into a colour-recognition test instead of a judgement test. The
 * outcome styling only appears in the debrief, after the player has chosen.
 */
export function DecisionOption({
  choice,
  index,
  disabled,
  pending,
  onSelect,
}: {
  choice: ScenarioChoice;
  index: number;
  disabled?: boolean;
  pending?: boolean;
  onSelect: (choice: ScenarioChoice) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(choice)}
      className="group flex min-h-[60px] w-full items-center gap-3 rounded-2xl border-2 border-line bg-surface px-4 py-3 text-left transition
        hover:border-civic-500 hover:bg-civic-50
        disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:bg-surface"
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line-strong bg-surface-sunk text-[13px] font-extrabold text-ink-muted transition group-hover:border-civic-500 group-hover:bg-civic-600 group-hover:text-white"
      >
        {index + 1}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-navy-900">
          {choice.label}
        </span>
        {choice.hint && (
          <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">
            {choice.hint}
          </span>
        )}
      </span>

      {pending && (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin text-civic-600"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
