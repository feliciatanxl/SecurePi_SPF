import { Check, Trophy } from "lucide-react";
import type { ResolvedAchievement } from "@/lib/types";

/**
 * Achievements.
 *
 * Personal milestones against the player's own practice, shown as progress
 * toward a target. There is no leaderboard, no rank, no percentile and no
 * visibility of anybody else's progress — deliberately, and everywhere in this
 * app.
 */
export function AchievementList({
  achievements,
}: {
  achievements: ResolvedAchievement[];
}) {
  return (
    <ul className="space-y-2 xl:grid xl:grid-cols-2 xl:gap-3 xl:space-y-0">
      {achievements.map((a) => {
        const pct = Math.round((a.progress / a.target) * 100);
        return (
          <li
            key={a.id}
            className={`rounded-2xl border p-3 ${
              a.earned ? "border-leaf-200 bg-leaf-50" : "border-line bg-surface"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                  a.earned
                    ? "bg-leaf-600 text-white"
                    : "bg-surface-sunk text-ink-soft"
                }`}
              >
                {a.earned ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <Trophy className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[14px] font-extrabold uppercase tracking-wide text-navy-900">
                    {a.title}
                  </span>
                  <span className="text-[13px] font-bold tabular-nums text-ink-muted">
                    {a.progress} / {a.target}
                  </span>
                  {a.earned && (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-leaf-700">
                      Earned
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
                  {a.description}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line"
                >
                  <span
                    className={`block h-full rounded-full ${a.earned ? "bg-leaf-600" : "bg-civic-600"}`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
