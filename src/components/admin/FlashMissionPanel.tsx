"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Rocket, Zap } from "lucide-react";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  type Competency,
  type FlashMissionDraft,
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
  safeResponse:
    "Do not receive or forward money for anyone else. Disengage and verify the employer through an official channel.",
  competency: "SPOT",
  debrief:
    "Commission for moving money through your own account is money mule recruitment, not a job.",
  status: "LIVE",
};

const labelCls =
  "block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted";
const fieldCls =
  "mt-1.5 w-full min-h-[44px] rounded-lg border border-line-strong bg-surface px-3 py-2 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-civic-500";

export function FlashMissionPanel({
  onDeploy,
  onCancel,
}: {
  onDeploy: (draft: FlashMissionDraft) => Promise<void>;
  onCancel: () => void;
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onDeploy(draft);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col bg-surface">
      <header className="flex items-start gap-3 border-b border-line bg-surface-sunk px-6 py-5">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-civic-600"
        >
          <Zap className="h-5 w-5 text-white" />
        </span>
        <div className="pr-8">
          <h2
            id="flash-mission-title"
            className="text-[17px] font-extrabold tracking-tight text-navy-900"
          >
            Deploy Flash Mission
          </h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
            Publish a scenario for an emerging trend. No code, no release cycle.
            Pre-filled with an example — edit any field.
          </p>
        </div>
      </header>

      <div className="thin-scroll flex-1 space-y-5 overflow-y-auto px-6 py-5">
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
        </div>

        <div>
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
        </div>

        <fieldset>
          <legend className={labelCls}>Decision choices</legend>
          <p className="mt-1 text-[12px] text-ink-soft">
            Presented to youths in a neutral order and styling.
          </p>
          <div className="mt-2 space-y-2">
            {([0, 1, 2] as const).map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line-strong bg-surface-sunk text-[13px] font-bold text-ink-muted"
                >
                  {i + 1}
                </span>
                <input
                  required
                  aria-label={`Decision choice ${i + 1}`}
                  value={draft.choices[i]}
                  onChange={(e) => setChoice(i, e.target.value)}
                  className={`${fieldCls} mt-0`}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="fm-safe" className={labelCls}>
            Recommended safe response
          </label>
          <textarea
            id="fm-safe"
            required
            rows={2}
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

        <div className="sm:w-1/2">
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
            <option value="LIVE">Live</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      <footer className="flex items-center justify-end gap-3 border-t border-line bg-surface-sunk px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] rounded-lg px-4 text-[14px] font-semibold text-ink-muted transition hover:bg-canvas hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-civic-600 px-5 text-[14px] font-bold text-white transition hover:bg-civic-700 disabled:opacity-60"
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
