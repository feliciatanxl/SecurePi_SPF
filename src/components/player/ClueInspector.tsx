"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Clue } from "@/lib/types";

/**
 * Optional evidence tagging. Collapsed by default and never required to make a
 * decision — it exists so a player can rehearse *articulating* why something
 * felt wrong, which is what transfers to a real situation.
 */
export function ClueInspector({
  question,
  clues,
  tagged,
  onToggle,
  disabled,
}: {
  question: string;
  clues: Clue[];
  tagged: string[];
  onToggle: (clueId: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = "clue-inspector-panel";

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-[52px] w-full items-center gap-2.5 px-4 py-3 text-left"
        >
          <Search className="h-4 w-4 shrink-0 text-civic-600" aria-hidden="true" />
          <span className="flex-1 text-[14px] font-semibold text-navy-900">
            {question}
          </span>
          {tagged.length > 0 && (
            <span className="rounded-md bg-civic-100 px-1.5 py-0.5 text-[11px] font-bold text-civic-700 tabular-nums">
              {tagged.length} tagged
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </h2>

      {open && (
        <div id={panelId} className="border-t border-line px-4 pb-4 pt-3">
          <p className="mb-3 text-[13px] text-ink-muted">
            Optional. Tag anything that feels off before you decide.
          </p>
          <ul className="flex flex-wrap gap-2">
            {clues.map((clue) => {
              const on = tagged.includes(clue.id);
              return (
                <li key={clue.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={on}
                    onClick={() => onToggle(clue.id)}
                    className={`min-h-[40px] rounded-full border px-3.5 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      on
                        ? "border-civic-600 bg-civic-600 text-white"
                        : "border-line-strong bg-surface text-ink hover:border-civic-500 hover:bg-civic-50"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {clue.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {tagged.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-line pt-3">
              {clues
                .filter((c) => tagged.includes(c.id))
                .map((c) => (
                  <li key={c.id} className="text-[13px] leading-relaxed">
                    <span className="font-semibold text-navy-900">
                      {c.label}:
                    </span>{" "}
                    <span className="text-ink-muted">{c.note}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
