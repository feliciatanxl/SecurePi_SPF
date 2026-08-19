"use client";

import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { REVIEW_THRESHOLD } from "@/components/admin/ScenarioTable";
import type { AdminScenarioRow } from "@/lib/types";

/**
 * "What needs attention?" — the second question the Overview has to answer.
 *
 * Every figure here is about a piece of CONTENT, never a participant. A low safe
 * decision rate means the scenario is not teaching clearly enough yet; it is not
 * a signal about the young people who answered it.
 */
export function AdminNeedsAttention({
  rows,
  onOpenReview,
  onSelect,
}: {
  rows: AdminScenarioRow[];
  onOpenReview: () => void;
  onSelect: (row: AdminScenarioRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-4">
        <p className="flex items-center gap-2 text-[14px] font-bold text-leaf-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          No content is below the review threshold
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          Every live scenario is teaching at or above {REVIEW_THRESHOLD}%.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-amber-200 bg-surface">
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row)}
              className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-amber-50"
            >
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-navy-900">
                  {row.title}
                </span>
                <span className="block text-[12px] text-ink-muted">
                  {row.category} · {row.responses.toLocaleString()} responses
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[15px] font-extrabold tabular-nums text-navy-900">
                  {row.safeDecisionRate}%
                </span>
                <span className="block text-[11px] tabular-nums text-ink-soft">
                  was {row.previousSafeDecisionRate}%
                </span>
              </span>
              <span className="hidden shrink-0 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 sm:inline">
                Review recommended
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-line bg-surface-sunk px-4 py-3">
        <button
          type="button"
          onClick={onOpenReview}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-bold text-civic-700 underline underline-offset-2 transition hover:text-civic-800"
        >
          View content review
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
