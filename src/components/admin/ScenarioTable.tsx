"use client";

import { Minus, TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { AdminScenarioRow, ScenarioStatus } from "@/lib/types";

const STATUS_STYLES: Record<ScenarioStatus, string> = {
  LIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-500/20",
  SCHEDULED: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ARCHIVED: "bg-slate-100 text-slate-400 ring-slate-400/20",
};

/** Below this, content is flagged for review rather than left running. */
const ATTENTION_THRESHOLD = 50;

function rateColor(rate: number) {
  if (rate >= 70) return "bg-emerald-500";
  if (rate >= ATTENTION_THRESHOLD) return "bg-amber-500";
  return "bg-rose-500";
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 || current === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
        <Minus className="h-3 w-3" />
        —
      </span>
    );
  }
  const diff = current - previous;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
        <Minus className="h-3 w-3" />0
      </span>
    );
  }
  const up = diff > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
        up ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      <Icon className="h-3 w-3" />
      {up ? "+" : ""}
      {diff}
    </span>
  );
}

export function ScenarioTable({
  rows,
  highlightId,
}: {
  rows: AdminScenarioRow[];
  highlightId?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Scenario
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Age group
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Safe decision rate
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Plays
              </th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Last updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isNew = row.id === highlightId;
              const needsAttention =
                row.status === "LIVE" &&
                row.plays > 0 &&
                row.safeDecisionRate < ATTENTION_THRESHOLD;

              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isNew ? "bg-blue-50/70" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {row.title}
                      </span>
                      {row.isFlashMission && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-600/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-600/20">
                          <Zap className="h-2.5 w-2.5" />
                          Flash
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {row.threatType}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-slate-600 tabular-nums">
                    {row.ageGroup}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {row.plays === 0 ? (
                      <span className="text-xs italic text-slate-400">
                        No data yet
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div
                          className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200"
                          role="img"
                          aria-label={`${row.safeDecisionRate} percent safe decisions`}
                        >
                          <div
                            className={`h-full rounded-full ${rateColor(row.safeDecisionRate)}`}
                            style={{ width: `${row.safeDecisionRate}%` }}
                          />
                        </div>
                        <span className="w-9 text-sm font-bold tabular-nums text-slate-900">
                          {row.safeDecisionRate}%
                        </span>
                        <Delta
                          current={row.safeDecisionRate}
                          previous={row.previousSafeDecisionRate}
                        />
                        {needsAttention && (
                          <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 ring-1 ring-rose-600/20">
                            Review
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 text-right tabular-nums text-slate-600">
                    {row.plays.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-slate-700">{row.updatedOn}</div>
                    <div className="text-xs text-slate-500">
                      {row.updatedBy}
                    </div>
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
