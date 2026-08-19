import { Check, Lightbulb, MessageSquareQuote, ShieldAlert } from "lucide-react";
import { SectionLabel, SkillBadge } from "@/components/ui/Badges";
import { GuardianProgressNote } from "@/components/player/GuardianCard";
import type { ChoiceOutcome, DecisionDebrief, Deltas } from "@/lib/types";

const OUTCOME_STYLE: Record<
  ChoiceOutcome,
  { wrap: string; head: string; Icon: typeof Check }
> = {
  SAFE: {
    wrap: "border-leaf-200 bg-leaf-50",
    head: "text-leaf-700",
    Icon: Check,
  },
  CAUTIOUS: {
    wrap: "border-amber-200 bg-amber-50",
    head: "text-amber-700",
    Icon: Lightbulb,
  },
  RISKY: {
    wrap: "border-coral-200 bg-coral-50",
    head: "text-coral-700",
    Icon: ShieldAlert,
  },
};

/** Human-readable stat movements, e.g. "Trust +10". */
export function deltaLines(deltas: Deltas): string[] {
  const out: string[] = [];
  const push = (label: string, n?: number) => {
    if (n) out.push(`${label} ${n > 0 ? "+" : ""}${n}`);
  };
  push("Trust", deltas.trust);
  push("Risk", deltas.risk);
  push("Community Resilience", deltas.resilience);
  return out;
}

/**
 * The teaching payload for every non-delayed outcome. Never just "Correct!" —
 * the player is told what they acted on and which skill it exercised.
 */
export function DebriefCard({
  outcome,
  debrief,
  deltas,
  guardianName,
  skillCaption = "Skill practised",
}: {
  outcome: ChoiceOutcome;
  debrief: DecisionDebrief;
  deltas: Deltas;
  guardianName?: string;
  skillCaption?: string;
}) {
  const { wrap, head, Icon } = OUTCOME_STYLE[outcome];
  const stats = deltaLines(deltas);

  return (
    <section
      className={`animate-rise space-y-4 rounded-2xl border p-4 ${wrap}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${head}`}
          strokeWidth={2.6}
          aria-hidden="true"
        />
        <div>
          <h2
            className={`text-lg font-extrabold uppercase tracking-wide ${head}`}
          >
            {debrief.headline}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink">
            {debrief.body}
          </p>
        </div>
      </div>

      {debrief.spotted && debrief.spotted.length > 0 && (
        <div>
          <SectionLabel>You spotted</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {debrief.spotted.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px]">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-leaf-700"
                  strokeWidth={3}
                  aria-hidden="true"
                />
                <span className="text-ink">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <span
              key={s}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[13px] font-bold text-navy-900 tabular-nums"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {debrief.sampleScript && (
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <SectionLabel>You might say</SectionLabel>
          <p className="mt-2 flex gap-2 text-[14px] italic leading-relaxed text-ink">
            <MessageSquareQuote
              className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
              aria-hidden="true"
            />
            “{debrief.sampleScript}”
          </p>
        </div>
      )}

      {debrief.saferResponse && (
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <SectionLabel>Safer response</SectionLabel>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {debrief.saferResponse}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <SkillBadge competency={debrief.competency} caption={skillCaption} />
        {guardianName && <GuardianProgressNote name={guardianName} />}
      </div>
    </section>
  );
}
