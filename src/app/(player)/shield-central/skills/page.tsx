"use client";

import { HubPage } from "@/components/player/HubPage";
import { useShieldProgress } from "@/lib/hooks/useShieldProgress";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  COMPETENCY_ORDER,
  type Competency,
} from "@/lib/types";

/**
 * The S.H.I.E.L.D. framework.
 *
 * The one place in the player app where the framework is explained at length.
 * Everywhere else it appears as a small tag at the moment a skill is being
 * practised — a young person should meet the framework through what they are
 * doing, not read it first.
 *
 * The count beside each skill is how many activities the player has completed
 * that practised it. It is a record, not a rating: there is no level, no
 * percentage and no judgement of how well anything was done.
 */
const SKILL_MEANING: Record<Competency, string> = {
  SPOT: "Notice the signals that a situation is not what it is being presented as — easy money, urgency, someone needing your account.",
  HOLD: "Put time between the pressure and your answer. Anything genuinely legitimate survives a delay.",
  IDENTIFY:
    "Work out who is actually pushing the decision, and what they get out of it.",
  EVALUATE:
    "Follow the choice past the moment it is made. What does this cost in three days, or three months?",
  LEAD: "Choose the response that holds up, and know where to go for help when it is bigger than you.",
  DEFEND:
    "Step in for someone else without escalating it or putting yourself in the middle.",
};

export default function SkillsPage() {
  const { skillCounts, skillsPractised } = useShieldProgress();

  return (
    <HubPage
      eyebrow="Shield Central"
      title="S.H.I.E.L.D. skills"
      measure="medium"
      intro={`The six prevention skills. You have practised ${skillsPractised.length} of them so far.`}
    >
      <ul className="space-y-2 xl:grid xl:grid-cols-2 xl:gap-3 xl:space-y-0">
        {COMPETENCY_ORDER.map((c) => {
          const count = skillCounts[c] ?? 0;
          return (
            <li
              key={c}
              className={`rounded-2xl border p-3.5 ${
                count > 0 ? "border-civic-200 bg-civic-50" : "border-line bg-surface"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-900 text-[16px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[c]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[15px] font-extrabold text-navy-900">
                      {COMPETENCY_LABEL[c]}
                    </span>
                    <span className="text-[12px] font-bold tabular-nums text-ink-soft">
                      {count} {count === 1 ? "activity" : "activities"}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                    {SKILL_MEANING[c]}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
        These counts record what you have practised. They are not a score, a
        level or an assessment of you, and they are never compared with anyone
        else.
      </p>
    </HubPage>
  );
}
