"use client";

import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Clock,
  Coins,
  Lock,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { SectionLabel, SkillBadge } from "@/components/ui/Badges";
import type { DelayedConsequence } from "@/lib/types";

/**
 * The delayed consequence.
 *
 * Rendered as a full takeover rather than an error dialog: the point is that
 * *time has passed* since the reward, so the surface changes completely. It is
 * not dismissible — the player has to read it — and the tone teaches rather
 * than shames. This is the only screen in the app that is fully dark.
 */
export function ConsequenceTakeover({
  consequence,
  onContinue,
  onReplay,
}: {
  consequence: DelayedConsequence | null;
  onContinue: () => void;
  onReplay: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const open = Boolean(consequence);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!consequence) return null;

  return (
    <div
      className="animate-fade fixed inset-0 z-50 overflow-y-auto bg-navy-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consequence-headline"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5 pb-8 pt-10 outline-none"
      >
        {/* Time passage */}
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {consequence.timeLabel}
          </p>
          <span
            aria-hidden="true"
            className="animate-sweep mt-3 block h-px w-full origin-left bg-gradient-to-r from-amber-400 via-navy-700 to-transparent"
          />
        </div>

        {/* Headline */}
        <div className="mt-7 flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10"
          >
            <Lock className="h-5 w-5 text-amber-400" />
          </span>
          <div>
            <h1
              id="consequence-headline"
              className="text-2xl font-extrabold leading-tight tracking-tight text-white"
            >
              {consequence.headline}
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-100">
              {consequence.body}
            </p>
          </div>
        </div>

        {/* What changed */}
        <section className="mt-7 rounded-2xl border border-white/12 bg-white/6 p-4">
          <SectionLabel tone="dark">What changed?</SectionLabel>

          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Immediate
              </p>
              <ul className="mt-1.5 space-y-1">
                {consequence.changedImmediate.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[14px] font-bold text-amber-400"
                  >
                    <Coins className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 pt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Later
              </p>
              <ul className="mt-1.5 space-y-1">
                {consequence.changedLater.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[14px] font-semibold text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral-600"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Why this mattered */}
        <section className="mt-4 rounded-2xl border border-white/12 bg-white/6 p-4">
          <SectionLabel tone="dark">Why this mattered</SectionLabel>
          <p className="mt-2 text-[13px] font-semibold text-white/70">
            Warning signs in the message
          </p>
          <ul className="mt-2 space-y-2">
            {consequence.warningSigns.map((sign) => (
              <li key={sign} className="flex items-start gap-2.5">
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <span className="text-[14px] leading-relaxed text-navy-100">
                  {sign}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Safer response */}
        <section className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <SectionLabel tone="dark">Safer response</SectionLabel>
          <p className="mt-2 text-[14px] leading-relaxed text-white">
            {consequence.saferResponse}
          </p>
        </section>

        <div className="mt-4">
          <SkillBadge
            competency={consequence.competency}
            caption="Skill to practise"
            tone="dark"
          />
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2.5 pt-8">
          <button
            type="button"
            onClick={onContinue}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 text-[15px] font-extrabold text-navy-900 transition hover:bg-amber-400"
          >
            Continue mission
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 text-[15px] font-semibold text-white transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Replay this decision
          </button>
        </div>
      </div>
    </div>
  );
}
