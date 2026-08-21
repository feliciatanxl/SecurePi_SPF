"use client";

import { AchievementList } from "@/components/player/AchievementList";
import { HubPage } from "@/components/player/HubPage";
import { useShieldProgress } from "@/lib/hooks/useShieldProgress";

/**
 * Achievements.
 *
 * Milestones in the player's own practice. Completing one pays Shield Tokens —
 * the only "skill milestone" award in the game — and nothing else. No ranking,
 * no comparison, no visibility of anyone else.
 */
export default function AchievementsPage() {
  const { achievements } = useShieldProgress();
  const earned = achievements.filter((a) => a.earned).length;

  return (
    <HubPage
      eyebrow="Shield Central"
      title="Achievements"
      measure="medium"
      intro="Milestones in what you have practised. Nothing here is compared with other participants."
      action={
        <p className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-right">
          <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-navy-100/70">
            Earned
          </span>
          <span className="block text-[17px] font-extrabold leading-tight tabular-nums text-amber-400">
            {earned}/{achievements.length}
          </span>
        </p>
      }
    >
      <AchievementList achievements={achievements} />

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
        Each achievement you complete adds Shield Tokens once. They are earned
        by practising skills, never by a dice roll and never by outperforming
        anyone.
      </p>
    </HubPage>
  );
}
