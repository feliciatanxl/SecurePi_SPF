"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  CircleSlash,
  FileEdit,
  Lock,
  PencilLine,
  ShieldAlert,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { YouthMissionStatusChip } from "@/components/admin/YouthMissionQueue";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  TARGET_GROUP_AGE,
  type YouthMissionDecision,
  type YouthMissionSubmission,
} from "@/lib/types";

/**
 * Reviewing one youth-submitted mission idea.
 *
 * Three routes out, and none of them is "publish". The strongest available
 * decision is **Convert to scenario draft**, which produces a draft in the
 * Scenario Library that still has to be written, reviewed and scheduled like
 * any other content. That ceiling is deliberate: an idea from a young person
 * deserves to be taken seriously, and taking it seriously means it goes through
 * the same review as everything else rather than around it.
 *
 * The safeguarding panel sits above the decision controls, not below them, and
 * the reviewer note travels with whichever decision is recorded.
 *
 * Everything here is session-local. There is no submission service behind the
 * queue, so a decision recorded in a demonstration lives in memory until the
 * page is reloaded — the panel says so rather than implying a record was
 * written somewhere.
 */
export function YouthMissionPanel({
  submission,
  onDecide,
  onClose,
}: {
  submission: YouthMissionSubmission;
  onDecide: (
    id: string,
    decision: YouthMissionDecision,
    note: string,
  ) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(submission.reviewNote ?? "");

  /* A different submission opened into the same panel starts from its own note. */
  useEffect(() => {
    setNote(submission.reviewNote ?? "");
  }, [submission.id, submission.reviewNote]);

  const decide = (decision: YouthMissionDecision) => {
    onDecide(submission.id, decision, note.trim());
    onClose();
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="border-b border-line bg-surface-sunk px-6 py-5 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <YouthMissionStatusChip status={submission.status} />
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
            Simulated submission
          </span>
        </div>
        <h2
          id="youth-mission-title"
          className="mt-2 text-[19px] font-extrabold tracking-tight text-navy-900"
        >
          {submission.title}
        </h2>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          {submission.category}
        </p>
      </header>

      <div className="thin-scroll flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <Field label="The idea, as submitted">
          <p className="text-[14px] leading-relaxed text-ink">
            {submission.summary}
          </p>
        </Field>

        <Field label="What the submitter says it teaches">
          <p className="text-[14px] leading-relaxed text-ink">
            {submission.intendedLesson}
          </p>
        </Field>

        <Field label="Proposed audience band">
          <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <Users className="h-4 w-4 text-ink-soft" aria-hidden="true" />
            {submission.suggestedBand}
            <span className="font-normal text-ink-soft tabular-nums">
              {TARGET_GROUP_AGE[submission.suggestedBand]}
            </span>
          </p>
        </Field>

        <Field label="Proposed S.H.I.E.L.D. skill">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-civic-100 bg-civic-50 px-2 py-1">
            <span
              aria-hidden="true"
              className="grid h-5 w-5 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
            >
              {COMPETENCY_LETTER[submission.proposedCompetency]}
            </span>
            <span className="text-[12px] font-semibold text-navy-900">
              {COMPETENCY_LABEL[submission.proposedCompetency]}
            </span>
          </span>
        </Field>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Safeguarding points to weigh
          </h3>
          <ul className="mt-2 space-y-1.5">
            {submission.safeguardingFlags.map((flag) => (
              <li
                key={flag}
                className="flex items-start gap-2 text-[13px] leading-snug text-ink"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600"
                />
                {flag}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 border-t border-amber-200 pt-2.5 text-[12px] leading-relaxed text-amber-700">
            Nothing here can reach a player without review. The strongest
            decision available is a scenario <strong>draft</strong>.
          </p>
        </section>

        <Field label="Submitter">
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
            <UserRoundSearch className="h-4 w-4 text-ink-soft" aria-hidden="true" />
            <span className="font-semibold text-ink">
              {submission.submittedBy}
            </span>
            <span aria-hidden="true">·</span>
            {submission.submitterBand}
            <span aria-hidden="true">·</span>
            {submission.submittedOn}
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
            A programme pseudonym and a cohort band are the only submitter
            fields this model holds. No name, school, class or contact detail is
            collected, and none is needed to review an idea.
          </p>
        </Field>

        <Field label="Moderation note">
          <textarea
            id="ym-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What has to change, or why this is being taken forward."
            className="mt-0.5 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-[14px] leading-relaxed text-ink outline-none transition placeholder:text-ink-soft focus:border-civic-500"
          />
          <p className="mt-1 text-[12px] text-ink-soft">
            Recorded against the decision below. Session-local in this
            prototype — a reload returns the queue to its fixture state.
          </p>
        </Field>
      </div>

      <footer className="space-y-2 border-t border-line bg-surface-sunk px-6 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          Reviewer decision
        </p>
        <button
          type="button"
          onClick={() => decide("CONVERTED")}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-civic-600 px-4 text-[14px] font-bold text-white transition hover:bg-civic-700"
        >
          <FileEdit className="h-4 w-4" aria-hidden="true" />
          Convert to scenario draft
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide("CHANGES_REQUESTED")}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink transition hover:border-civic-300 hover:text-civic-700"
          >
            <PencilLine className="h-4 w-4" aria-hidden="true" />
            Request changes
          </button>
          <button
            type="button"
            onClick={() => decide("REJECTED")}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink-muted transition hover:border-coral-200 hover:text-coral-700"
          >
            <CircleSlash className="h-4 w-4" aria-hidden="true" />
            Not taken forward
          </button>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </h3>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}
