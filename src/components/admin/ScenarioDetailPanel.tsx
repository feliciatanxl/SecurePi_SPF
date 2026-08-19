"use client";

import {
  ClipboardCheck,
  Minus,
  PencilLine,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { REVIEW_THRESHOLD, STATUS_STYLES } from "@/components/admin/ScenarioTable";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  type AdminScenarioRow,
} from "@/lib/types";

/**
 * One-line learning objective per category.
 *
 * In production this is authored alongside the scenario and returned with it.
 * The mock keeps it keyed by category so the panel has something real to show
 * without inventing per-scenario copy that would then need maintaining.
 */
const OBJECTIVES: Record<string, string> = {
  "Money Mule Recruitment":
    "Recognise that being paid to receive and forward money makes you responsible for it, and disengage rather than negotiate.",
  "Shop Theft & Peer Pressure":
    "Identify when a dare has shifted the decision to the group, and separate the social cost from the legal one.",
  "Account Sharing":
    "Understand that a shared login stays in your name, whatever the other person then does with it.",
  "E-Commerce Scam":
    "Check a seller through a channel you already trust before any money moves.",
  "Peer Shield · Money Mule":
    "Intervene with a friend privately, name the risk without shaming, and give them a next step.",
  "Peer Shield · Shop Theft":
    "Decline to provide cover, and recognise that corroborating a story makes it partly yours.",
  "Job Scam":
    "Test an offer against what a real employer would actually need from you.",
  "Vape Possession":
    "Recognise that holding something for someone else transfers the consequence, not just the item.",
  "Phishing QR":
    "Treat an unexpected payment prompt as unverified until checked through the official channel.",
  "Account Takeover":
    "Refuse third-party login prompts for in-game rewards, however routine they look.",
  "Unlicensed Moneylending":
    "Recognise runner recruitment, and understand that the errand is the offence.",
  Impersonation:
    "Verify identity through a second, independent channel before acting on an urgent request.",
};

const FALLBACK_OBJECTIVE =
  "Recognise the pressure being applied, pause before acting, and choose the response that still holds up afterwards.";

function Trend({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 || current === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] text-ink-soft">
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        No previous cycle to compare
      </span>
    );
  }
  const diff = current - previous;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-soft">
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        No change since last cycle
      </span>
    );
  }
  const up = diff > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[13px] font-bold tabular-nums ${
        up ? "text-leaf-700" : "text-coral-700"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {up ? "+" : ""}
      {diff} pts since last cycle
    </span>
  );
}

/**
 * Lightweight scenario detail.
 *
 * Prototype behaviour: Edit and Review are stubs that state what they would do.
 * The panel exists to show the shape of the authoring workflow, and to make the
 * meaning of "safe decision rate" unambiguous at the point it is read — it is a
 * measure of how well the content teaches, not of the youths who answered it.
 */
export function ScenarioDetailPanel({
  row,
  onClose,
}: {
  row: AdminScenarioRow;
  onClose: () => void;
}) {
  const needsReview =
    row.status === "LIVE" &&
    row.responses > 0 &&
    row.safeDecisionRate < REVIEW_THRESHOLD;

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="border-b border-line bg-surface-sunk px-6 py-5 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[row.status]}`}
          >
            {row.status}
          </span>
          {row.isFlashMission && (
            <span className="inline-flex items-center gap-1 rounded-md border border-civic-200 bg-civic-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-civic-700">
              <Zap className="h-2.5 w-2.5" aria-hidden="true" />
              Flash Mission
            </span>
          )}
        </div>
        <h2
          id="scenario-detail-title"
          className="mt-2 text-[19px] font-extrabold tracking-tight text-navy-900"
        >
          {row.title}
        </h2>
        <p className="mt-0.5 text-[13px] text-ink-muted">{row.category}</p>
      </header>

      <div className="thin-scroll flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <Field label="Learning objective">
          <p className="text-[14px] leading-relaxed text-ink">
            {OBJECTIVES[row.category] ?? FALLBACK_OBJECTIVE}
          </p>
        </Field>

        <Field label="S.H.I.E.L.D. skills">
          <ul className="flex flex-wrap gap-1.5">
            {row.competencies.map((c) => (
              <li
                key={c}
                className="inline-flex items-center gap-1.5 rounded-lg border border-civic-100 bg-civic-50 px-2 py-1"
              >
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[c]}
                </span>
                <span className="text-[12px] font-semibold text-navy-900">
                  {COMPETENCY_LABEL[c]}
                </span>
              </li>
            ))}
          </ul>
        </Field>

        <Field label="Audience">
          <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <Users className="h-4 w-4 text-ink-soft" aria-hidden="true" />
            {row.targetGroup}
          </p>
        </Field>

        <Field label="Performance summary">
          {row.responses === 0 ? (
            <p className="text-[14px] text-ink-muted">
              Awaiting responses. Figures appear once the scenario has been
              answered.
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tabular-nums text-navy-900">
                    {row.safeDecisionRate}%
                  </span>
                  <span className="text-[13px] font-semibold text-ink-muted">
                    chose a safer option
                  </span>
                </p>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-line"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full ${
                      needsReview ? "bg-amber-500" : "bg-civic-600"
                    }`}
                    style={{ width: `${row.safeDecisionRate}%` }}
                  />
                </div>
                <p className="mt-1.5">
                  <Trend
                    current={row.safeDecisionRate}
                    previous={row.previousSafeDecisionRate}
                  />
                </p>
              </div>

              <p className="text-[13px] tabular-nums text-ink-muted">
                {row.responses.toLocaleString()} responses recorded
              </p>

              {/* Stated at the point of reading, not buried in a footnote. */}
              <p className="rounded-lg border border-line bg-surface-sunk px-3 py-2.5 text-[12px] leading-relaxed text-ink-muted">
                Safe decision rate measures how clearly this{" "}
                <strong className="font-bold text-ink">scenario teaches</strong>.
                A lower rate means the content needs stronger teaching support —
                it says nothing about the young people who answered it, and no
                individual response is stored against a participant.
              </p>

              {needsReview && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-relaxed text-amber-700">
                  <span className="font-bold uppercase tracking-wide">
                    Review recommended
                  </span>{" "}
                  — below the {REVIEW_THRESHOLD}% content-review threshold.
                </p>
              )}
            </div>
          )}
        </Field>

        <Field label="Last updated">
          <p className="text-[14px] text-ink">
            {row.updatedOn}
            <span className="text-ink-muted"> · {row.updatedBy}</span>
          </p>
        </Field>
      </div>

      <footer className="space-y-2 border-t border-line bg-surface-sunk px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-civic-600 px-4 text-[14px] font-bold text-white opacity-60"
          >
            <PencilLine className="h-4 w-4" aria-hidden="true" />
            Edit scenario
          </button>
          <button
            type="button"
            disabled
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line-strong px-4 text-[14px] font-semibold text-ink-muted opacity-60"
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            Send for review
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-lg px-4 text-[14px] font-semibold text-ink-muted transition hover:bg-canvas hover:text-ink"
          >
            Close
          </button>
        </div>
        <p className="text-[12px] text-ink-soft">
          Editing and review routing are not implemented in this prototype.
        </p>
      </footer>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </h3>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}
