"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import type { ScenarioChoice } from "@/lib/types";

interface ChoiceButtonProps {
  choice: ScenarioChoice;
  disabled?: boolean;
  pending?: boolean;
  selected?: boolean;
  onSelect: (choice: ScenarioChoice) => void;
}

/**
 * Deliberately neutral styling: the UI must never telegraph which option is the
 * safe one, or the scenario stops measuring judgement and starts measuring
 * colour recognition.
 */
export function ChoiceButton({
  choice,
  disabled,
  pending,
  selected,
  onSelect,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(choice)}
      className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition
        ${
          selected
            ? "border-shield-500/60 bg-shield-600/15"
            : "border-white/10 bg-ink-800 hover:border-shield-500/40 hover:bg-ink-700"
        }
        disabled:cursor-not-allowed disabled:opacity-45
        focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-400`}
    >
      <span className="flex-1">
        <span className="block text-sm font-semibold text-slate-100">
          {choice.label}
        </span>
        {choice.hint && (
          <span className="mt-0.5 block text-xs leading-snug text-slate-400">
            {choice.hint}
          </span>
        )}
      </span>
      {pending ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-shield-400" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-shield-400" />
      )}
    </button>
  );
}
