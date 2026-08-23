"use client";

import {
  CircleSlash,
  FileEdit,
  PencilLine,
  ShieldAlert,
  UserRoundSearch,
} from "lucide-react";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  TARGET_GROUP_AGE,
  YOUTH_MISSION_STATUS_LABEL,
  type YouthMissionStatus,
  type YouthMissionSubmission,
} from "@/lib/types";

/**
 * The Youth-Created Missions queue.
 *
 * Project SHIELD's design has young people proposing the situations they
 * actually meet. This is the step between that idea and anything a player sees,
 * and the queue is arranged so the reviewer cannot miss it: every card shows
 * the safeguarding points before it shows the actions.
 *
 * The whole pipeline is simulated. There is no submission service and no real
 * young person behind any row — see `youth-missions-data.ts` for what that
 * means and why the submitter fields are a pseudonym and a band and nothing
 * else.
 */

export const STATUS_TONE: Record<YouthMissionStatus, string> = {
  AWAITING_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  CHANGES_REQUESTED: "border-civic-200 bg-civic-50 text-civic-700",
  CONVERTED: "border-leaf-200 bg-leaf-50 text-leaf-700",
  REJECTED: "border-line bg-surface-sunk text-ink-muted",
};

export const DECISION_ICON = {
  CONVERTED: FileEdit,
  CHANGES_REQUESTED: PencilLine,
  REJECTED: CircleSlash,
} as const;

export function YouthMissionStatusChip({
  status,
}: {
  status: YouthMissionStatus;
}) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_TONE[status]}`}
    >
      {YOUTH_MISSION_STATUS_LABEL[status]}
    </span>
  );
}

export function YouthMissionQueue({
  submissions,
  onSelect,
}: {
  submissions: YouthMissionSubmission[];
  onSelect: (submission: YouthMissionSubmission) => void;
}) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-[14px] text-ink-muted">
        Nothing in the queue matches this filter.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 xl:grid-cols-2">
      {submissions.map((submission) => (
        <li key={submission.id}>
          <button
            type="button"
            onClick={() => onSelect(submission)}
            className="flex h-full w-full flex-col rounded-xl border border-line bg-surface p-4 text-left transition hover:border-civic-300 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="min-w-0 text-[15px] font-bold leading-snug text-navy-900">
                {submission.title}
              </h3>
              <YouthMissionStatusChip status={submission.status} />
            </div>

            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-soft">
              <span className="font-semibold text-ink-muted">
                {submission.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {submission.suggestedBand}{" "}
                <span className="tabular-nums">
                  {TARGET_GROUP_AGE[submission.suggestedBand]}
                </span>
              </span>
            </p>

            <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-muted">
              {submission.summary}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-sunk px-2 py-1 text-[11px] font-bold text-navy-900">
                <span
                  aria-hidden="true"
                  className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[submission.proposedCompetency]}
                </span>
                {COMPETENCY_LABEL[submission.proposedCompetency]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                <UserRoundSearch className="h-3.5 w-3.5" aria-hidden="true" />
                {submission.submittedBy} · {submission.submittedOn}
              </span>
              {submission.safeguardingFlags.length > 0 && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 tabular-nums">
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                  {submission.safeguardingFlags.length}
                </span>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
