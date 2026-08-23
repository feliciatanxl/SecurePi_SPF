"use client";

import { Check, Link2 } from "lucide-react";
import type { MatchGame } from "@/lib/types";

/**
 * Two columns and a link between them. Used by Clue Match and Who Can Help?.
 *
 * Selection is two taps rather than a drag: a drag target on a 390px screen is
 * a coordination test, and this activity is meant to test whether a young
 * person can connect a signal to a situation, not whether they can hold a
 * finger steady. Two taps also work identically with a keyboard and a screen
 * reader, which a drag does not.
 *
 * A wrong pairing is not punished with a life or a timer. It clears the
 * selection, says so, and lets them try again — the pairing is the learning,
 * and the note that appears on a correct pair is where the teaching actually
 * happens.
 */
export function MatchBoard({
  game,
  matched,
  selectedPromptId,
  wrongPromptId,
  onSelectPrompt,
  onSelectMatch,
}: {
  game: MatchGame;
  /** Pair ids already linked. */
  matched: string[];
  selectedPromptId: string | null;
  /** The prompt involved in the most recent wrong attempt, for feedback. */
  wrongPromptId: string | null;
  onSelectPrompt: (pairId: string) => void;
  onSelectMatch: (pairId: string) => void;
}) {
  const byId = new Map(game.pairs.map((p) => [p.id, p]));
  const rightColumn = game.matchOrder
    .map((id) => byId.get(id))
    .filter((p): p is MatchGame["pairs"][number] => Boolean(p));

  const selected = selectedPromptId ? byId.get(selectedPromptId) : undefined;

  return (
    <div className="space-y-3">
      <p
        aria-live="polite"
        className={`flex min-h-[46px] items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-semibold leading-snug ${
          wrongPromptId
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : selected
              ? "border-civic-200 bg-civic-50 text-civic-700"
              : "border-line bg-surface-sunk text-ink-muted"
        }`}
      >
        <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        {wrongPromptId
          ? "Not that one. Pick the sign again and try another match."
          : selected
            ? `Now pick what “${truncate(selected.prompt)}” belongs to.`
            : `Pick a ${game.promptLabel.toLowerCase()} to start.`}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <h2 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {game.promptLabel}
          </h2>
          <ul className="space-y-2">
            {game.pairs.map((pair) => {
              const done = matched.includes(pair.id);
              const active = selectedPromptId === pair.id;
              const wrong = wrongPromptId === pair.id;
              return (
                <li key={pair.id}>
                  <button
                    type="button"
                    disabled={done}
                    onClick={() => onSelectPrompt(pair.id)}
                    aria-pressed={active}
                    className={`flex min-h-[64px] w-full items-start gap-2 rounded-xl border-2 px-2.5 py-2 text-left text-[12.5px] font-semibold leading-snug transition disabled:cursor-default sm:text-[13.5px] ${cellStyle(
                      { done, active, wrong },
                    )}`}
                  >
                    {done && (
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf-700"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1">{pair.prompt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {game.matchLabel}
          </h2>
          <ul className="space-y-2">
            {rightColumn.map((pair) => {
              const done = matched.includes(pair.id);
              return (
                <li key={pair.id}>
                  <button
                    type="button"
                    disabled={done || !selectedPromptId}
                    onClick={() => onSelectMatch(pair.id)}
                    className={`flex min-h-[64px] w-full items-start gap-2 rounded-xl border-2 px-2.5 py-2 text-left text-[12.5px] font-semibold leading-snug transition disabled:cursor-default sm:text-[13.5px] ${cellStyle(
                      {
                        done,
                        active: false,
                        wrong: false,
                        dimmed: !done && !selectedPromptId,
                      },
                    )}`}
                  >
                    {done && (
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf-700"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1">{pair.match}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {matched.length > 0 && (
        <section
          className="animate-rise space-y-2 rounded-2xl border border-leaf-200 bg-leaf-50 p-3.5"
          aria-live="polite"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-leaf-700">
            What you connected
          </h2>
          <ul className="space-y-2">
            {matched.map((id) => {
              const pair = byId.get(id);
              if (!pair) return null;
              return (
                <li key={id} className="text-[13px] leading-snug text-ink">
                  <span className="font-bold text-navy-900">{pair.match}</span>
                  {" — "}
                  {pair.note}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function cellStyle({
  done,
  active,
  wrong,
  dimmed = false,
}: {
  done: boolean;
  active: boolean;
  wrong: boolean;
  dimmed?: boolean;
}) {
  if (done) return "border-leaf-600 bg-leaf-50 text-leaf-700";
  if (wrong) return "border-amber-500 bg-amber-50 text-navy-900";
  if (active) return "border-civic-600 bg-civic-50 text-navy-900";
  if (dimmed) return "border-line bg-surface text-ink-muted";
  return "border-line-strong bg-surface text-navy-900 hover:border-civic-500 hover:bg-civic-50";
}

/** Keeps the status line to one readable sentence on a phone. */
function truncate(value: string, max = 38) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}
