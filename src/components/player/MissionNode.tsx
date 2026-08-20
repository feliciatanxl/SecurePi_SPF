import Link from "next/link";
import { ArrowRight, Check, Clock, Lock, Sparkles } from "lucide-react";
import { KIND_CHIP, MissionKindMark } from "@/components/player/MissionArt";
import type { ResolvedNode } from "@/lib/hooks/useWorld";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  NODE_KIND_LABEL,
  type Competency,
} from "@/lib/types";

/** Skill indicator, e.g. "S · Spot the Risk". Small, never a framework lecture. */
export function SkillTag({
  competency,
  className = "",
}: {
  competency: Competency;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid h-4 w-4 shrink-0 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
      >
        {COMPETENCY_LETTER[competency]}
      </span>
      {COMPETENCY_LABEL[competency]}
    </span>
  );
}

/**
 * One stop on a district route.
 *
 * Status is never carried by colour alone: an icon, a text label and the
 * interactive state all say the same thing, so the board reads correctly on a
 * projector, in greyscale and to a screen reader.
 */
export function MissionNodeCard({
  node,
  index,
  guardianName,
}: {
  node: ResolvedNode;
  /** Position along the route, shown as the stop number. */
  index: number;
  guardianName?: string;
}) {
  const locked = !node.playable;
  const planned = node.availability === "PLANNED";

  const inner = (
    <>
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
            node.completed
              ? "border-leaf-200 bg-leaf-600 text-white"
              : locked
                ? "border-line bg-surface-sunk text-ink-soft"
                : "border-navy-800 bg-navy-900 text-amber-400"
          }`}
        >
          {node.completed ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : locked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <MissionKindMark kind={node.kind} className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${KIND_CHIP[node.kind]}`}
            >
              {NODE_KIND_LABEL[node.kind]}
            </span>
            <span className="text-[11px] font-semibold text-ink-soft tabular-nums">
              Stop {index + 1}
            </span>
          </div>

          <h3 className="mt-0.5 text-[15px] font-extrabold leading-snug text-navy-900">
            {node.title}
          </h3>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
            {node.summary}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <SkillTag competency={node.primaryCompetency} />
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-soft">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {node.estimatedMinutes} min
            </span>
            {guardianName && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-amber-700">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {guardianName}
              </span>
            )}
          </div>
        </div>

        {!locked && !node.completed && (
          <ArrowRight
            className="mt-1.5 h-4 w-4 shrink-0 text-civic-600"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Status line. Always words, never colour on its own. */}
      {node.completed ? (
        <p className="mt-2.5 flex items-center gap-1.5 border-t border-leaf-200 pt-2 text-[12px] font-bold uppercase tracking-wide text-leaf-700">
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          Completed — replay any time
        </p>
      ) : planned ? (
        <p className="mt-2.5 flex items-center gap-1.5 border-t border-line pt-2 text-[12px] font-bold uppercase tracking-wide text-ink-soft">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Coming soon
        </p>
      ) : locked ? (
        <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5 text-[12px] font-semibold text-ink-soft">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-bold uppercase tracking-wide">Locked</span> —
            complete {node.remainingToUnlock} more{" "}
            {node.remainingToUnlock === 1 ? "activity" : "activities"} in this
            district
          </span>
        </p>
      ) : null}
    </>
  );

  if (locked) {
    return (
      <article
        aria-disabled="true"
        className="rounded-2xl border border-line bg-surface-sunk p-3"
      >
        {inner}
      </article>
    );
  }

  return (
    <Link
      href={node.href ?? "#"}
      className={`block rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-18px_rgba(11,37,69,0.7)] ${
        node.completed
          ? "border-leaf-200 bg-leaf-50 hover:border-leaf-600"
          : "border-line bg-surface hover:border-civic-500"
      }`}
    >
      {inner}
    </Link>
  );
}
