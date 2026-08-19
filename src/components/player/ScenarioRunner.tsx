"use client";

import { useEffect, useRef } from "react";
import { Loader2, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { ChatBubble } from "@/components/player/ChatBubble";
import { ChoiceButton } from "@/components/player/ChoiceButton";
import { ConsequenceModal } from "@/components/player/ConsequenceModal";
import { RewardBurst } from "@/components/player/RewardBurst";
import { useScenarioRun } from "@/lib/hooks/useScenarioRun";
import { COMPETENCY_LABEL, type ChoiceOutcome } from "@/lib/types";

const OUTCOME_STYLES: Record<
  ChoiceOutcome,
  { ring: string; text: string; label: string }
> = {
  SAFE: {
    ring: "border-safe-500/30 bg-safe-500/10",
    text: "text-safe-400",
    label: "Safe decision",
  },
  CAUTIOUS: {
    ring: "border-gold-400/30 bg-gold-400/10",
    text: "text-gold-300",
    label: "Partial credit",
  },
  RISKY: {
    ring: "border-danger-500/30 bg-danger-500/10",
    text: "text-danger-400",
    label: "Risky decision",
  },
};

/**
 * Shared runner for both player views. View 1 and View 2 differ only in the
 * scenario they load and the accent copy — the interaction model is identical,
 * which is also true of the production engine.
 */
export function ScenarioRunner({
  scenarioId,
  accentLabel,
  accentIcon,
}: {
  scenarioId: string;
  accentLabel: string;
  accentIcon: React.ReactNode;
}) {
  const {
    scenario,
    transcript,
    pendingChoiceId,
    committedChoice,
    result,
    burst,
    consequence,
    choose,
    replay,
    isResolved,
  } = useScenarioRun(scenarioId);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript.length, result]);

  if (!scenario) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-shield-500" />
      </div>
    );
  }

  const outcome = result ? OUTCOME_STYLES[result.outcome] : null;

  return (
    <div className="relative flex min-h-full flex-col">
      {burst && (
        <RewardBurst key={burst.key} label={burst.label} tone={burst.tone} />
      )}

      {/* Scene framing */}
      <div className="border-b border-white/5 bg-ink-850/60 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-shield-600/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-shield-300 ring-1 ring-shield-500/30">
            {accentIcon}
            {accentLabel}
          </span>
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {scenario.threatType}
          </span>
        </div>
        <h1 className="mt-2.5 text-xl font-bold tracking-tight text-white">
          {scenario.title}
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
          {scenario.prompt}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {scenario.competencies.map((c) => (
            <span
              key={c}
              className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
            >
              {COMPETENCY_LABEL[c]}
            </span>
          ))}
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 space-y-2.5 px-4 py-4">
        {transcript.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}

        {/* Inline debrief */}
        {result && outcome && (
          <div
            className={`animate-rise mt-4 rounded-2xl border p-4 ${outcome.ring}`}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <ShieldAlert className={`h-4 w-4 ${outcome.text}`} />
              <span
                className={`text-[11px] font-bold uppercase tracking-widest ${outcome.text}`}
              >
                {outcome.label}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-300">
              {result.feedback}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Choice rail */}
      <div className="sticky bottom-0 space-y-2 border-t border-white/5 bg-ink-900/95 px-4 py-4 backdrop-blur">
        {!isResolved && (
          <p className="pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            What do you do?
          </p>
        )}

        {isResolved ? (
          <button
            type="button"
            onClick={replay}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-ink-800 px-4 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-shield-500/40 hover:bg-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-400"
          >
            <RotateCcw className="h-4 w-4" />
            Play again
          </button>
        ) : (
          scenario.choices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              disabled={Boolean(pendingChoiceId)}
              pending={pendingChoiceId === choice.id}
              selected={committedChoice?.id === choice.id}
              onSelect={choose}
            />
          ))
        )}

        {isResolved && !consequence && result?.delayed && (
          <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-600">
            <Sparkles className="h-3 w-3" />
            Nice. Nothing bad happened.
          </p>
        )}
      </div>

      <ConsequenceModal consequence={consequence} onReplay={replay} />
    </div>
  );
}
