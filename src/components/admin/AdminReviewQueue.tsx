"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { REVIEW_THRESHOLD } from "@/components/admin/ScenarioTable";
import type { AdminScenarioRow } from "@/lib/types";

/** Why this scenario surfaced, in the administrator's own terms. */
function reasonFor(row: AdminScenarioRow): string {
  const diff = row.safeDecisionRate - row.previousSafeDecisionRate;
  if (row.previousSafeDecisionRate > 0 && diff < 0) {
    return `Safe decision rate has fallen ${Math.abs(diff)} points and is below the ${REVIEW_THRESHOLD}% content-review threshold.`;
  }
  if (row.previousSafeDecisionRate > 0 && diff === 0) {
    return `Safe decision rate has not moved since the last cycle and remains below the ${REVIEW_THRESHOLD}% content-review threshold.`;
  }
  return `Safe decision rate is below the ${REVIEW_THRESHOLD}% content-review threshold.`;
}

/**
 * The administrator's action queue.
 *
 * Only content that meets a review condition appears, and every item is about
 * the scenario: what it is failing to teach clearly, and how that has moved.
 *
 * There is deliberately no drill-down to individual answers. "View responses
 * summary" is aggregate by design — the portal has no concept of a participant's
 * answer history, and adding one would turn a content tool into a profiling tool.
 */
export function AdminReviewQueue({
  rows,
  onSelect,
}: {
  rows: AdminScenarioRow[];
  onSelect: (row: AdminScenarioRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-leaf-200 bg-leaf-50 px-5 py-10 text-center">
        <CheckCircle2
          className="mx-auto h-6 w-6 text-leaf-700"
          aria-hidden="true"
        />
        <p className="mt-2 text-[15px] font-bold text-leaf-700">
          Nothing is awaiting review
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          No live scenario is currently below the {REVIEW_THRESHOLD}% threshold.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const diff = row.safeDecisionRate - row.previousSafeDecisionRate;
        const hasPrevious = row.previousSafeDecisionRate > 0;
        const Icon = !hasPrevious || diff === 0 ? Minus : diff > 0 ? TrendingUp : TrendingDown;

        return (
          <li
            key={row.id}
            className="overflow-hidden rounded-xl border border-amber-200 bg-surface"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-[220px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-extrabold text-navy-900">
                    {row.title}
                  </h3>
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                    Review recommended
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {row.category} · {row.targetGroup}
                </p>

                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                    Reason for review
                  </p>
                  <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink">
                    {reasonFor(row)}
                  </p>
                </div>
              </div>

              {/* Figures block */}
              <dl className="grid grid-cols-3 gap-x-5 gap-y-1 sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    Current
                  </dt>
                  <dd className="text-2xl font-extrabold tabular-nums text-navy-900">
                    {row.safeDecisionRate}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    Previous
                  </dt>
                  <dd className="flex items-baseline gap-1 text-[15px] font-bold tabular-nums text-ink-muted">
                    {hasPrevious ? `${row.previousSafeDecisionRate}%` : "—"}
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    Responses
                  </dt>
                  <dd className="text-[15px] font-bold tabular-nums text-ink-muted">
                    {row.responses.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-line bg-surface-sunk px-4 py-3">
              <button
                type="button"
                onClick={() => onSelect(row)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-civic-600 px-4 text-[13px] font-bold text-white transition hover:bg-civic-700"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Review scenario
              </button>
              <button
                type="button"
                onClick={() => onSelect(row)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-strong px-4 text-[13px] font-semibold text-ink-muted transition hover:border-civic-200 hover:text-civic-700"
              >
                <FileBarChart className="h-4 w-4" aria-hidden="true" />
                View responses summary
              </button>
              <p className="flex items-center text-[12px] text-ink-soft">
                Aggregate only — individual answers are not recorded.
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
