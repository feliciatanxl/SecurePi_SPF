"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Rocket, Zap } from "lucide-react";
import {
  COMPETENCY_LABEL,
  type AgeGroup,
  type Competency,
  type FlashMissionDraft,
} from "@/lib/types";

const AGE_GROUPS: AgeGroup[] = ["13–15", "16–18", "19–21", "13–21"];
const COMPETENCIES = Object.keys(COMPETENCY_LABEL) as Competency[];

const EMPTY: FlashMissionDraft = {
  title: "",
  threatType: "",
  ageGroup: "16–18",
  competency: "SPOT",
  situation: "",
  safeAction: "",
  runsForDays: 7,
};

const labelCls =
  "block text-xs font-semibold uppercase tracking-wider text-slate-600";
const fieldCls =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

/**
 * The no-code authoring path. An officer describes the emerging trend in plain
 * language; the engine generates the scenario shell and publishes it. No
 * developer, no release cycle.
 */
export function FlashMissionForm({
  onDeploy,
  onCancel,
}: {
  onDeploy: (draft: FlashMissionDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<FlashMissionDraft>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FlashMissionDraft>(
    key: K,
    value: FlashMissionDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

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
    <form onSubmit={handleSubmit} className="bg-white">
      <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-6 py-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600/10 ring-1 ring-blue-600/20">
          <Zap className="h-5 w-5 text-blue-600" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Deploy Flash Mission
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Publish a scenario for an emerging trend. Live to the selected cohort
            in under a minute — no code, no release.
          </p>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
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
              placeholder="e.g. Fake MOE Bursary SMS"
              className={fieldCls}
            />
          </div>

          <div>
            <label htmlFor="fm-threat" className={labelCls}>
              Threat type
            </label>
            <input
              id="fm-threat"
              required
              value={draft.threatType}
              onChange={(e) => set("threatType", e.target.value)}
              placeholder="e.g. Government Impersonation"
              className={fieldCls}
            />
          </div>

          <div>
            <label htmlFor="fm-age" className={labelCls}>
              Target age group
            </label>
            <select
              id="fm-age"
              value={draft.ageGroup}
              onChange={(e) => set("ageGroup", e.target.value as AgeGroup)}
              className={fieldCls}
            >
              {AGE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fm-comp" className={labelCls}>
              S.H.I.E.L.D. competency
            </label>
            <select
              id="fm-comp"
              value={draft.competency}
              onChange={(e) => set("competency", e.target.value as Competency)}
              className={fieldCls}
            >
              {COMPETENCIES.map((c) => (
                <option key={c} value={c}>
                  {COMPETENCY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="fm-situation" className={labelCls}>
            The situation youths will face
          </label>
          <textarea
            id="fm-situation"
            required
            rows={3}
            value={draft.situation}
            onChange={(e) => set("situation", e.target.value)}
            placeholder="Describe the approach in the scammer's own words. The engine turns this into the chat transcript."
            className={`${fieldCls} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="fm-safe" className={labelCls}>
            The correct action
          </label>
          <input
            id="fm-safe"
            required
            value={draft.safeAction}
            onChange={(e) => set("safeAction", e.target.value)}
            placeholder="e.g. Do not click. Verify via the official Gov.sg channel."
            className={fieldCls}
          />
        </div>

        <div className="sm:w-1/2">
          <label htmlFor="fm-days" className={labelCls}>
            Runs for (days)
          </label>
          <input
            id="fm-days"
            type="number"
            min={1}
            max={30}
            value={draft.runsForDays}
            onChange={(e) => set("runsForDays", Number(e.target.value))}
            className={fieldCls}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deploying…
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Deploy now
            </>
          )}
        </button>
      </div>
    </form>
  );
}
