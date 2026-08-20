import { Check, Lock } from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { guardianStanding } from "@/lib/state/PlayerProvider";
import type { Guardian } from "@/lib/types";

/** Segmented progress bar — reads clearly on a projector and needs no colour. */
function ProgressPips({
  progress,
  target,
  emphasis = false,
}: {
  progress: number;
  target: number;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: target }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 rounded-full ${
            i < progress
              ? emphasis
                ? "bg-amber-500"
                : "bg-civic-600"
              : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Guardians represent prevention skills, not collectibles — every card leads
 * with the skill it stands for and what strengthens it.
 */
export function GuardianCard({
  guardian,
  cumulative,
  featured = false,
}: {
  guardian: Guardian;
  cumulative: number;
  featured?: boolean;
}) {
  const { level, progress, target } = guardianStanding(guardian, cumulative);

  return (
    <article
      className={`rounded-2xl border p-3.5 ${
        featured
          ? "border-amber-200 bg-amber-50"
          : "border-line bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        <GuardianPlate
          guardian={guardian}
          className="h-11 w-11 rounded-2xl text-[17px]"
          tone={featured ? "amber" : "navy"}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-base font-extrabold uppercase tracking-wide text-navy-900">
              {guardian.name}
            </h3>
            <span className="rounded-md bg-navy-900/8 px-1.5 py-0.5 text-[11px] font-bold text-navy-800">
              Level {level}
            </span>
            {!guardian.unlocked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-soft">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Locked
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] font-bold text-civic-700">
            {guardian.skill}
          </p>
          <p className="mt-1 text-[13px] italic text-ink-muted">
            “{guardian.motto}”
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {guardian.skill} progress
          </span>
          <span className="text-[13px] font-bold tabular-nums text-navy-900">
            {progress} / {target}
          </span>
        </div>
        <ProgressPips progress={progress} target={target} emphasis={featured} />
        <p className="mt-2 text-[13px] leading-snug text-ink-muted">
          {progress === 0 && level > 1
            ? `Level ${level} reached. ${guardian.description}`
            : `Complete ${target - progress} more ${guardian.skill.toLowerCase()} decision${
                target - progress === 1 ? "" : "s"
              } to strengthen ${guardian.name}.`}
        </p>
      </div>
    </article>
  );
}


/** Shown inside a debrief when a decision strengthened a Guardian. */
export function GuardianProgressNote({ name }: { name: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-semibold text-amber-700">
      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
      {name} progress +1
    </p>
  );
}
