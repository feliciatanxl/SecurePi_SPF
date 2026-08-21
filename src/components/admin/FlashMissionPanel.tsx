"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check, CircleCheck, ExternalLink, Loader2, Rocket, Zap } from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { MOCK_GUARDIANS } from "@/lib/api/mock-data";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  SIMULATED_COHORTS,
  type AdminScenarioRow,
  type Competency,
  type FlashMissionDraft,
  type SimulatedCohortId,
  type TargetGroup,
} from "@/lib/types";

const TARGET_GROUPS: TargetGroup[] = [
  "Secondary",
  "ITE / Poly / JC",
  "Secondary / Tertiary",
  "All youth cohorts",
];

const COMPETENCIES = Object.keys(COMPETENCY_LABEL) as Competency[];

/**
 * Pre-filled with a realistic worked example so the no-code authoring story can
 * be demonstrated in a few seconds during a pitch, without typing a full
 * scenario live.
 */
const EXAMPLE: FlashMissionDraft = {
  title: "Fake Job Offer",
  category: "Money Mule Recruitment",
  targetGroup: "ITE / Poly / JC",
  prompt:
    "An online recruiter says you can earn commission by receiving and forwarding payments.",
  choices: [
    "Accept",
    "Ask for company details",
    "Reject and verify independently",
  ],
  safeChoiceIndex: 2,
  safeResponse:
    "Verify unexpected offers independently and do not allow others to use your account to receive or transfer funds.",
  competency: "SPOT",
  guardianId: MOCK_GUARDIANS[0].id,
  debrief:
    "Commission for moving money through your own account is money mule recruitment, not a job.",
  warningSigns: ["Easy money", "Urgency", "Use of personal account"],
  cohorts: ["tertiary"],
  status: "LIVE",
};

const labelCls =
  "block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted";
const fieldCls =
  "mt-1.5 w-full min-h-[44px] rounded-lg border border-line-strong bg-surface px-3 py-2 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-civic-500";

/**
 * Deploy Flash Mission.
 *
 * A right-side drawer over the portal, not a dialog in the middle of it: the
 * administrator keeps the Scenario Library in view behind the form, which is
 * where the mission they are writing will appear a moment later.
 *
 * The form is a content-authoring tool and is styled like one — calm, sectioned
 * and dense. It deliberately does not borrow anything from the youth game.
 *
 * Two states live in this component: the form, and the confirmation. Keeping
 * them together is what lets the drawer confirm in place rather than closing
 * and leaving the administrator to work out whether it worked.
 */
export function FlashMissionPanel({
  deployed,
  onDeploy,
  onCancel,
  onViewLibrary,
  onDone,
}: {
  /** Set once a deployment has succeeded — switches the drawer to the confirmation. */
  deployed: AdminScenarioRow | null;
  onDeploy: (draft: FlashMissionDraft) => Promise<void>;
  onCancel: () => void;
  onViewLibrary: () => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<FlashMissionDraft>(EXAMPLE);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FlashMissionDraft>(
    key: K,
    value: FlashMissionDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const setChoice = (index: 0 | 1 | 2, value: string) =>
    setDraft((prev) => {
      const choices: [string, string, string] = [...prev.choices];
      choices[index] = value;
      return { ...prev, choices };
    });

  const toggleCohort = (id: SimulatedCohortId) =>
    setDraft((prev) => ({
      ...prev,
      cohorts: prev.cohorts.includes(id)
        ? prev.cohorts.filter((c) => c !== id)
        : [...prev.cohorts, id],
    }));

  const setWarningSign = (index: number, value: string) =>
    setDraft((prev) => {
      const signs = [...prev.warningSigns];
      signs[index] = value;
      return { ...prev, warningSigns: signs };
    });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onDeploy(draft);
    } finally {
      setSubmitting(false);
    }
  };

  const guardian =
    MOCK_GUARDIANS.find((g) => g.id === draft.guardianId) ?? MOCK_GUARDIANS[0];

  if (deployed) {
    return (
      <FlashMissionLive
        row={deployed}
        competency={draft.competency}
        guardianName={guardian.name}
        onViewLibrary={onViewLibrary}
        onDone={onDone}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col bg-surface">
      <header className="shrink-0 border-b border-line bg-surface-sunk px-6 pb-4 pt-5">
        <span className="inline-flex rounded-md border border-line-strong bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
          Prototype · Simulated data
        </span>
        <h2
          id="flash-mission-title"
          className="mt-2.5 flex items-center gap-2 pr-8 text-[19px] font-extrabold tracking-tight text-navy-900"
        >
          <Zap className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          Deploy Flash Mission
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          Publish a timely scenario to selected participant groups without
          rebuilding the application.
        </p>
      </header>

      <div className="thin-scroll min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
        <Section index={1} title="Mission details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fm-title" className={labelCls}>
                Mission title
              </label>
              <input
                id="fm-title"
                required
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                className={fieldCls}
              />
            </div>

            <div>
              <label htmlFor="fm-category" className={labelCls}>
                Threat category
              </label>
              <input
                id="fm-category"
                required
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
                className={fieldCls}
              />
            </div>

            <div>
              <label htmlFor="fm-target" className={labelCls}>
                Target group
              </label>
              <select
                id="fm-target"
                value={draft.targetGroup}
                onChange={(e) => set("targetGroup", e.target.value as TargetGroup)}
                className={fieldCls}
              >
                {TARGET_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fm-status" className={labelCls}>
                Status
              </label>
              <select
                id="fm-status"
                value={draft.status}
                onChange={(e) =>
                  set("status", e.target.value as FlashMissionDraft["status"])
                }
                className={fieldCls}
              >
                <option value="LIVE">Ready to deploy — publishes as Live</option>
                <option value="DRAFT">Draft — not published</option>
              </select>
            </div>
          </div>
        </Section>

        <Section index={2} title="Scenario">
          <label htmlFor="fm-prompt" className={labelCls}>
            Situation prompt
          </label>
          <textarea
            id="fm-prompt"
            required
            rows={3}
            value={draft.prompt}
            onChange={(e) => set("prompt", e.target.value)}
            className={`${fieldCls} resize-none`}
          />
        </Section>

        <Section index={3} title="Player choices">
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Presented to youths in a neutral order and styling. The learning
            response below is recorded for authoring only — participants never
            see it marked before they choose.
          </p>
          <fieldset className="mt-2.5">
            <legend className="sr-only">Decision choices</legend>
            <div className="space-y-2">
              {([0, 1, 2] as const).map((i) => {
                const isSafe = draft.safeChoiceIndex === i;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-2.5 transition ${
                      isSafe
                        ? "border-leaf-600 bg-leaf-50"
                        : "border-line bg-surface-sunk"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line-strong bg-surface text-[13px] font-bold text-ink-muted"
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        required
                        aria-label={`Decision choice ${String.fromCharCode(65 + i)}`}
                        value={draft.choices[i]}
                        onChange={(e) => setChoice(i, e.target.value)}
                        className={`${fieldCls} mt-0`}
                      />
                    </div>
                    <label className="mt-2 flex min-h-[32px] cursor-pointer items-center gap-2 pl-[42px] text-[12px] font-semibold text-ink-muted">
                      <input
                        type="radio"
                        name="fm-safe-choice"
                        checked={isSafe}
                        onChange={() => set("safeChoiceIndex", i)}
                        className="h-4 w-4 accent-[var(--color-leaf-600)]"
                      />
                      Intended learning response
                      {isSafe && (
                        <span className="rounded bg-leaf-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                          Admin only
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </Section>

        <Section index={4} title="Learning alignment">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fm-skill" className={labelCls}>
                S.H.I.E.L.D. skill
              </label>
              <select
                id="fm-skill"
                value={draft.competency}
                onChange={(e) => set("competency", e.target.value as Competency)}
                className={fieldCls}
              >
                {COMPETENCIES.map((c) => (
                  <option key={c} value={c}>
                    {COMPETENCY_LETTER[c]} — {COMPETENCY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fm-guardian" className={labelCls}>
                Guardian
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <GuardianPlate
                  guardian={guardian}
                  className="h-9 w-9 shrink-0 rounded-lg text-[13px]"
                />
                <select
                  id="fm-guardian"
                  value={draft.guardianId}
                  onChange={(e) => set("guardianId", e.target.value)}
                  className={`${fieldCls} mt-0`}
                >
                  {MOCK_GUARDIANS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Section>

        <Section index={5} title="Debrief">
          <div className="space-y-4">
            <div>
              <label htmlFor="fm-safe" className={labelCls}>
                Safer response / learning message
              </label>
              <textarea
                id="fm-safe"
                required
                rows={3}
                value={draft.safeResponse}
                onChange={(e) => set("safeResponse", e.target.value)}
                className={`${fieldCls} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="fm-debrief" className={labelCls}>
                Short debrief
              </label>
              <textarea
                id="fm-debrief"
                required
                rows={2}
                value={draft.debrief}
                onChange={(e) => set("debrief", e.target.value)}
                className={`${fieldCls} resize-none`}
              />
            </div>

            <fieldset>
              <legend className={labelCls}>Warning signs</legend>
              <p className="mt-1 text-[12px] text-ink-soft">
                Short phrases. These are what the debrief points back to.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {draft.warningSigns.map((sign, i) => (
                  <input
                    key={i}
                    aria-label={`Warning sign ${i + 1}`}
                    value={sign}
                    onChange={(e) => setWarningSign(i, e.target.value)}
                    className={`${fieldCls} mt-0`}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </Section>

        <Section
          index={6}
          title="Deployment"
          badge="Simulated cohorts"
        >
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Demonstration groups only. This prototype has no participant
            database and does not connect to any operational system.
          </p>
          <div className="mt-2.5 space-y-2">
            {SIMULATED_COHORTS.map((cohort) => {
              const checked = draft.cohorts.includes(cohort.id);
              return (
                <label
                  key={cohort.id}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-3 text-[14px] font-semibold transition ${
                    checked
                      ? "border-civic-500 bg-civic-50 text-civic-800"
                      : "border-line bg-surface text-ink-muted hover:border-civic-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCohort(cohort.id)}
                    className="h-4 w-4 accent-[var(--color-civic-600)]"
                  />
                  {cohort.label}
                </label>
              );
            })}
          </div>
        </Section>

        {/* One final read before publishing. */}
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Ready to deploy
          </h3>
          <dl className="mt-2.5 space-y-1.5 text-[13px]">
            <SummaryRow label="Mission" value={draft.title} />
            <SummaryRow label="Category" value={draft.category} />
            <SummaryRow label="Audience" value={draft.targetGroup} />
            <SummaryRow
              label="Skill"
              value={`${COMPETENCY_LETTER[draft.competency]} · ${COMPETENCY_LABEL[draft.competency]}`}
            />
            <SummaryRow label="Guardian" value={guardian.name} />
            <SummaryRow
              label="Choices"
              value={`${draft.choices.length} · learning response ${String.fromCharCode(65 + draft.safeChoiceIndex)}`}
            />
            <SummaryRow
              label="Cohorts"
              value={
                draft.cohorts.length
                  ? SIMULATED_COHORTS.filter((c) => draft.cohorts.includes(c.id))
                      .map((c) => c.label)
                      .join(", ")
                  : "None selected"
              }
            />
            <SummaryRow
              label="Status"
              value={draft.status === "LIVE" ? "Ready to deploy" : "Draft"}
            />
          </dl>
        </section>
      </div>

      <footer className="flex shrink-0 items-center gap-3 border-t border-line bg-surface-sunk px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] flex-1 rounded-lg border border-line-strong bg-surface px-4 text-[14px] font-semibold text-ink-muted transition hover:border-line-strong hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[44px] flex-[2] items-center justify-center gap-2 rounded-lg bg-civic-600 px-5 text-[14px] font-bold text-white transition hover:bg-civic-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Deploying…
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" aria-hidden="true" />
              Deploy Flash Mission
            </>
          )}
        </button>
      </footer>
    </form>
  );
}

function Section({
  index,
  title,
  badge,
  children,
}: {
  index: number;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3.5 flex flex-wrap items-center gap-2 border-b border-line pb-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-navy-900">
          {index}. {title}
        </h3>
        {badge && (
          <span className="rounded border border-line-strong bg-surface-sunk px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-amber-700/80">
        {label}
      </dt>
      <dd className="min-w-0 text-right font-semibold text-amber-900">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation                                                        */
/* ------------------------------------------------------------------ */

function FlashMissionLive({
  row,
  competency,
  guardianName,
  onViewLibrary,
  onDone,
}: {
  row: AdminScenarioRow;
  competency: Competency;
  guardianName: string;
  onViewLibrary: () => void;
  onDone: () => void;
}) {
  const live = row.status === "LIVE";

  return (
    <div className="flex min-h-0 flex-col bg-surface">
      <div className="thin-scroll flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-leaf-50 px-8 py-10 text-center">
        <span
          aria-hidden="true"
          className="grid h-20 w-20 place-items-center rounded-full bg-leaf-600 text-white shadow-sm"
        >
          <Check className="h-10 w-10" strokeWidth={3} />
        </span>

        <h2
          id="flash-mission-title"
          className="mt-6 text-[26px] font-extrabold uppercase tracking-tight text-leaf-700"
        >
          {live ? "Flash Mission live" : "Flash Mission saved"}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          <span className="font-bold text-navy-900">{row.title}</span>{" "}
          {live
            ? "is now available to the selected simulated cohort."
            : "has been saved as a draft and is not published."}
        </p>

        <dl className="mt-7 w-full rounded-xl border border-leaf-200 bg-surface p-4 text-left">
          <LiveRow
            label="Status"
            value={
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.14em] ${
                  live
                    ? "bg-leaf-100 text-leaf-700"
                    : "bg-surface-sunk text-ink-muted"
                }`}
              >
                {row.status}
              </span>
            }
          />
          <LiveRow label="Audience" value={row.targetGroup} />
          <LiveRow
            label="Skill"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[competency]}
                </span>
                {COMPETENCY_LABEL[competency]}
              </span>
            }
          />
          <LiveRow label="Guardian" value={guardianName} last />
        </dl>

        <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
          Prototype / simulated data. No participant record was created and
          nothing was sent to any operational system.
        </p>
      </div>

      <footer className="shrink-0 space-y-2 border-t border-line bg-surface px-6 py-4">
        <button
          type="button"
          onClick={onViewLibrary}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-civic-600 px-5 text-[14px] font-bold text-white transition hover:bg-civic-700"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View in Scenario Library
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-5 text-[14px] font-semibold text-ink-muted transition hover:text-ink"
        >
          <CircleCheck className="h-4 w-4" aria-hidden="true" />
          Done
        </button>
      </footer>
    </div>
  );
}

function LiveRow({
  label,
  value,
  last,
}: {
  label: string;
  value: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${last ? "" : "border-b border-line"}`}
    >
      <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="text-[14px] font-bold text-navy-900">{value}</dd>
    </div>
  );
}
