import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  type SkillCoverage,
} from "@/lib/types";

/**
 * S.H.I.E.L.D. skill coverage.
 *
 * Plain CSS bars — no chart library is worth adding to a prototype for six
 * horizontal rules, and the percentage is printed next to every bar so the
 * figure never depends on reading a length.
 *
 * This is a content question: which prevention skills are our published
 * scenarios teaching well, and which need better material. It is not a per-youth
 * competency profile and must never become one.
 */
export function SkillCoverageChart({ rows }: { rows: SkillCoverage[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.competency}>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-navy-900 text-[11px] font-extrabold text-white"
              >
                {COMPETENCY_LETTER[row.competency]}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                {COMPETENCY_LABEL[row.competency]}
              </span>
              <span className="shrink-0 text-[13px] font-bold tabular-nums text-navy-900">
                {row.coverage}%
              </span>
              <span className="hidden w-[92px] shrink-0 text-right text-[12px] tabular-nums text-ink-soft sm:block">
                {row.scenarios} scenario{row.scenarios === 1 ? "" : "s"}
              </span>
            </div>
            <div
              className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line"
              aria-hidden="true"
            >
              <div
                className={`h-full rounded-full ${
                  row.coverage >= 75
                    ? "bg-leaf-600"
                    : row.coverage >= 60
                      ? "bg-civic-600"
                      : "bg-amber-500"
                }`}
                style={{ width: `${row.coverage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-muted">
        Coverage is the share of responses on each skill&rsquo;s content that
        chose a safer option, across all live scenarios. It indicates where more
        teaching material is needed.
      </p>
    </div>
  );
}
