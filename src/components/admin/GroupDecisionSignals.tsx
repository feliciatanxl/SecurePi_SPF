"use client";

import { ArrowRight, Lock, MessagesSquare, Users } from "lucide-react";
import { TARGET_GROUP_AGE, type GroupDecisionSignal } from "@/lib/types";

/**
 * Think–Vote–Explain signals.
 *
 * ## What this measures, and what it refuses to
 *
 * It reports how a *question* behaved in a facilitated session: where the room
 * started, where it ended, and how many people moved after hearing each other.
 * That is a content-authoring signal — a question that never moves anybody is
 * either too obvious or badly framed — and it is the same kind of measure as
 * the safe decision rate elsewhere in this portal.
 *
 * It says nothing about any participant. There is no individual response here,
 * no per-youth history, no comparison between young people and no risk score.
 * The shape it renders has nowhere to put one, which is the point.
 *
 * Every figure is simulated. There is no live session behind the prototype's
 * Think–Vote–Explain flow, and this panel says so above the numbers rather than
 * in a footnote under them.
 */
export function GroupDecisionSignalPanel({
  signals,
}: {
  signals: GroupDecisionSignal[];
}) {
  const reconsideredAverage = signals.length
    ? Math.round(
        signals.reduce((sum, s) => sum + s.reconsideredPct, 0) / signals.length,
      )
    : 0;

  return (
    <div className="space-y-3">
      <p className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Simulated facilitated sessions · no live multiplayer exists
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Reconsidered after discussion"
          value={`${reconsideredAverage}%`}
          note="Average across the simulated questions below. A question nobody moves on is usually too obvious to be worth asking."
        />
        <SummaryTile
          label="Questions run"
          value={signals.length}
          note="Facilitated Think–Vote–Explain questions in the demonstration set."
        />
        <SummaryTile
          label="Participant records held"
          value="0"
          note="Aggregate only. No individual response, history or profile is stored or displayed."
        />
      </div>

      <ul className="grid gap-3 xl:grid-cols-2">
        {signals.map((signal) => (
          <li
            key={signal.id}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <h3 className="text-[14px] font-bold leading-snug text-navy-900">
              {signal.question}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-soft">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {signal.band}{" "}
                <span className="tabular-nums">
                  {TARGET_GROUP_AGE[signal.band]}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {signal.responses} simulated responses
              </span>
            </p>

            <div className="mt-3 flex items-center gap-3">
              <Reading label="Before" value={signal.initialSafePct} />
              <ArrowRight
                className="h-4 w-4 shrink-0 text-ink-soft"
                aria-hidden="true"
              />
              <Reading label="After discussion" value={signal.finalSafePct} />
              <span className="ml-auto shrink-0 rounded-md bg-leaf-50 px-2 py-1 text-[12px] font-bold text-leaf-700 tabular-nums">
                +{signal.finalSafePct - signal.initialSafePct} pts
              </span>
            </div>

            <ShiftBar
              before={signal.initialSafePct}
              after={signal.finalSafePct}
            />

            <p className="mt-2.5 flex items-start gap-1.5 border-t border-line pt-2.5 text-[12.5px] leading-snug text-ink-muted">
              <MessagesSquare
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft"
                aria-hidden="true"
              />
              <span>
                <span className="font-semibold text-ink">
                  {signal.reconsideredPct}% changed their answer.
                </span>{" "}
                Most-named reason: “{signal.topFactor}”.
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1.5 text-[28px] font-extrabold leading-none tracking-tight text-navy-900 tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-ink-muted">{note}</p>
    </div>
  );
}

function Reading({ label, value }: { label: string; value: number }) {
  return (
    <p className="leading-tight">
      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </span>
      <span className="text-[20px] font-extrabold tabular-nums text-navy-900">
        {value}%
      </span>
    </p>
  );
}

/**
 * The shift, drawn once.
 *
 * The "before" reading stays visible under the "after" one rather than being
 * replaced by it — an improvement bar that only shows the final number hides
 * the thing the panel exists to report.
 */
function ShiftBar({ before, after }: { before: number; after: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative mt-2.5 block h-2.5 overflow-hidden rounded-full bg-line"
    >
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-civic-200"
        style={{ width: `${after}%` }}
      />
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-civic-600"
        style={{ width: `${before}%` }}
      />
    </span>
  );
}
