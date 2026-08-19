import { DISTRICT_SKIN } from "@/components/player/DistrictCard";
import type { WorldProgress as Progress } from "@/lib/types";

/**
 * City progress.
 *
 * Personal learning progress only. There is deliberately no leaderboard, no
 * cohort comparison, no ranking and no "best player" — a youth crime-prevention
 * programme has no business turning learning into a competition between the
 * young people taking part in it.
 */
export function WorldProgress({
  progress,
  compact = false,
}: {
  progress: Progress;
  /** Compact fits inside the home hero; full is the standalone page. */
  compact?: boolean;
}) {
  const pct = progress.total
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <section
      aria-labelledby="city-progress"
      className={
        compact
          ? "rounded-2xl border border-white/12 bg-white/8 p-3.5"
          : "rounded-2xl border border-line bg-surface p-4"
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="city-progress"
          className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
            compact ? "text-navy-100/70" : "text-ink-soft"
          }`}
        >
          City progress
        </h2>
        <p
          className={`text-[13px] font-bold tabular-nums ${
            compact ? "text-white" : "text-navy-900"
          }`}
        >
          {progress.completed} / {progress.total}
          <span
            className={`ml-1 font-semibold ${compact ? "text-navy-100/70" : "text-ink-soft"}`}
          >
            activities
          </span>
        </p>
      </div>

      {/* Overall bar. The figure above carries the same information. */}
      <div
        className={`mt-2.5 h-2 overflow-hidden rounded-full ${
          compact ? "bg-white/15" : "bg-line"
        }`}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-amber-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className={`mt-3 space-y-2 ${compact ? "" : "sm:space-y-2.5"}`}>
        {progress.districts.map((d) => {
          const skin = DISTRICT_SKIN[d.districtId];
          return (
            <li key={d.districtId} className="flex items-center gap-2.5">
              <span
                className={`flex-1 truncate text-[13px] font-semibold ${
                  compact ? "text-navy-100" : "text-ink"
                }`}
              >
                {d.name}
              </span>
              <span className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: d.total }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-4 rounded-full ${
                      i < d.completed
                        ? skin.fill
                        : compact
                          ? "bg-white/20"
                          : "bg-line"
                    }`}
                  />
                ))}
              </span>
              <span
                className={`w-10 shrink-0 text-right text-[12px] font-bold tabular-nums ${
                  compact ? "text-white" : "text-navy-900"
                }`}
              >
                {d.completed} / {d.total}
              </span>
            </li>
          );
        })}
      </ul>

      {!compact && (
        <p className="mt-3.5 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-soft">
          This is your own learning progress. ShieldQuest does not rank
          participants or compare your progress with anyone else&rsquo;s.
        </p>
      )}
    </section>
  );
}
