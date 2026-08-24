import { Check, CircleDashed, Handshake } from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { guardianStanding } from "@/lib/state/PlayerProvider";
import {
  COMPETENCY_LABEL,
  type Guardian,
  type GuardianAward,
} from "@/lib/types";

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
 *
 * All six are always listed, met or not. A Guardian the player has not reached
 * yet says so in words and explains what would meet it, because the roster is
 * the map of the skill system: hiding four of the six would turn "skills you
 * are building" into a collection with gaps in it.
 */
export function GuardianCard({
  guardian,
  cumulative,
  met,
  featured = false,
  aura = false,
}: {
  guardian: Guardian;
  cumulative: number;
  /** True once the player has demonstrated this Guardian's competency. */
  met: boolean;
  featured?: boolean;
  /** An equipped Guardian cosmetic. Appearance only — it changes nothing. */
  aura?: boolean;
}) {
  const { level, progress, target } = guardianStanding(guardian, cumulative);

  return (
    <article
      className={`rounded-2xl border p-3.5 ${
        !met
          ? "border-dashed border-line-strong bg-surface-sunk"
          : featured
            ? "border-amber-200 bg-amber-50"
            : "border-line bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        <GuardianPlate
          guardian={guardian}
          className={`h-11 w-11 rounded-2xl text-[17px] ${aura ? "guardian-aura" : ""} ${
            met ? "" : "opacity-55 saturate-50"
          }`}
          tone={met && featured ? "amber" : "navy"}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-base font-extrabold uppercase tracking-wide text-navy-900">
              {guardian.name}
            </h3>
            {met && (
              <span className="rounded-md bg-navy-900/8 px-1.5 py-0.5 text-[11px] font-bold text-navy-800">
                Level {level}
              </span>
            )}
            <MetBadge met={met} />
          </div>
          <p className="mt-0.5 text-[13px] font-bold text-civic-700">
            {guardian.skill}
          </p>
          <p className="mt-1 text-[13px] italic text-ink-muted">
            “{guardian.motto}”
          </p>
        </div>
      </div>

      {met ? (
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
      ) : (
        <div className="mt-3 rounded-xl border border-line bg-surface px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            How you meet {guardian.name}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-ink-muted">
            Complete your first{" "}
            <span className="font-bold text-navy-900">
              {COMPETENCY_LABEL[guardian.competency]}
            </span>{" "}
            activity in the city. {guardian.description}
          </p>
        </div>
      )}
    </article>
  );
}

/**
 * Met state in words, never in colour alone.
 *
 * The wording matters as much as the accessibility of it: a Guardian is met or
 * not yet met. It is never locked, never for sale and never rolled for, so the
 * label never suggests otherwise.
 */
export function MetBadge({ met }: { met: boolean }) {
  return met ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-leaf-100 px-1.5 py-0.5 text-[11px] font-bold text-leaf-700">
      <Handshake className="h-3 w-3" aria-hidden="true" />
      Met
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-navy-900/6 px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">
      <CircleDashed className="h-3 w-3" aria-hidden="true" />
      Not yet met
    </span>
  );
}

/**
 * Shown inside a debrief to say what the completion did to its Guardian.
 *
 * Three states, because there are three things that can have happened: the
 * Guardian was met, it was progressed, or this activity had already paid its
 * one Guardian grant and the run was practice. Claiming "+1" for the third
 * would be the screen reporting something that did not occur.
 */
export function GuardianProgressNote({
  name,
  award,
}: {
  name: string;
  /** What the completion granted. `null` when the activity had already paid. */
  award: GuardianAward | null;
}) {
  if (award === "MET") {
    return (
      <p className="inline-flex items-center gap-2 rounded-lg border border-leaf-200 bg-leaf-50 px-3 py-2 text-[13px] font-semibold text-leaf-700">
        <Handshake className="h-4 w-4 shrink-0" aria-hidden="true" />
        {name} met — Guardian added to your roster
      </p>
    );
  }

  if (award === "PROGRESSED") {
    return (
      <p className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-semibold text-amber-700">
        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        {name} progress +1
      </p>
    );
  }

  return (
    <p className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-sunk px-3 py-2 text-[13px] font-semibold text-ink-muted">
      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
      {name} progress already earned — practice run
    </p>
  );
}
