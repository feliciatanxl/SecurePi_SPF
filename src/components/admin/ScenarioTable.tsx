"use client";

import { Minus, TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { AdminScenarioRow, ScenarioStatus } from "@/lib/types";

const STATUS_STYLES: Record<ScenarioStatus, string> = {
  LIVE: "border-leaf-200 bg-leaf-50 text-leaf-700",
  DRAFT: "border-line bg-surface-sunk text-ink-muted",
  SCHEDULED: "border-civic-200 bg-civic-50 text-civic-700",
  ARCHIVED: "border-line bg-surface-sunk text-ink-soft",
};

/**
 * Content below this rate is flagged for authoring review.
 *
 * This measures how well a SCENARIO teaches — which topics need more support —
 * never anything about the participants themselves.
 */
export const REVIEW_THRESHOLD = 60;

function rateBar(rate: number) {
  if (rate >= 70) return "bg-leaf-600";
  if (rate >= REVIEW_THRESHOLD) return "bg-civic-600";
  return "bg-amber-500";
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 || current === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[12px] text-ink-soft">
        <Minus className="h-3 w-3" aria-hidden="true" />
        <span className="sr-only">No comparison available</span>
      </span>
    );
  }
  const diff = current - previous;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-ink-soft">
        <Minus className="h-3 w-3" aria-hidden="true" />
        No change
      </span>
    );
  }
  const up = diff > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[12px] font-bold tabular-nums ${
        up ? "text-leaf-700" : "text-coral-700"
      }`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {up ? "+" : ""}
      {diff} pts
    </span>
  );
}

export function ScenarioTable({
  rows,
  highlightId,
  caption,
}: {
  rows: AdminScenarioRow[];
  highlightId?: string | null;
  caption: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-5 py-12 text-center">
        <p className="text-[14px] font-semibold text-ink-muted">
          No scenarios match this view.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line bg-surface-sunk">
              {[
                "Scenario",
                "Category",
                "Target group",
                "Status",
                "Safe decision rate",
                "Responses",
                "Last updated",
              ].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft ${
                    i === 5 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => {
              const isNew = row.id === highlightId;
              const needsReview =
                row.status === "LIVE" &&
                row.responses > 0 &&
                row.safeDecisionRate < REVIEW_THRESHOLD;

              return (
                <tr
                  key={row.id}
                  className={isNew ? "bg-civic-50" : "hover:bg-surface-sunk"}
                >
                  <th scope="row" className="px-4 py-3.5 text-left font-normal">
                    <span className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-navy-900">
                        {row.title}
                      </span>
                      {row.isFlashMission && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-civic-200 bg-civic-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-civic-700">
                          <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                          Flash
                        </span>
                      )}
                    </span>
                  </th>

                  <td className="px-4 py-3.5 text-[13px] text-ink-muted">
                    {row.category}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-ink-muted">
                    {row.targetGroup}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    {row.responses === 0 ? (
                      <span className="text-[13px] text-ink-soft">
                        Awaiting responses
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-20 overflow-hidden rounded-full bg-line"
                            aria-hidden="true"
                          >
                            <span
                              className={`block h-full rounded-full ${rateBar(row.safeDecisionRate)}`}
                              style={{ width: `${row.safeDecisionRate}%` }}
                            />
                          </span>
                          <span className="text-[14px] font-bold tabular-nums text-navy-900">
                            {row.safeDecisionRate}%
                          </span>
                        </span>
                        <Delta
                          current={row.safeDecisionRate}
                          previous={row.previousSafeDecisionRate}
                        />
                        {needsReview && (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                            Review recommended
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right text-[13px] tabular-nums text-ink-muted">
                    {row.responses.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="block text-[13px] text-ink">
                      {row.updatedOn}
                    </span>
                    <span className="block text-[12px] text-ink-soft">
                      {row.updatedBy}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
