import type { ReactNode } from "react";
import { COMPETENCY_LABEL, COMPETENCY_LETTER, type Competency } from "@/lib/types";

/**
 * The S.H.I.E.L.D. framework surfaces here and nowhere else — a small badge at
 * the moment a skill is practised, rather than a page of academic text.
 */
export function SkillBadge({
  competency,
  caption = "Skill practised",
  tone = "light",
}: {
  competency: Competency;
  caption?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
        dark
          ? "border-white/15 bg-white/10"
          : "border-civic-100 bg-civic-50"
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-extrabold ${
          dark ? "bg-amber-400 text-navy-900" : "bg-navy-900 text-white"
        }`}
      >
        {COMPETENCY_LETTER[competency]}
      </span>
      <span className="leading-tight">
        <span
          className={`block text-[11px] font-bold uppercase tracking-[0.12em] ${
            dark ? "text-white/60" : "text-ink-soft"
          }`}
        >
          {caption}
        </span>
        <span
          className={`block text-[13px] font-semibold ${
            dark ? "text-white" : "text-navy-900"
          }`}
        >
          {COMPETENCY_LETTER[competency]} — {COMPETENCY_LABEL[competency]}
        </span>
      </span>
    </div>
  );
}

/** Small uppercase section heading used throughout the debrief surfaces. */
export function SectionLabel({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <h3
      className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
        tone === "dark" ? "text-white/55" : "text-ink-soft"
      }`}
    >
      {children}
    </h3>
  );
}
