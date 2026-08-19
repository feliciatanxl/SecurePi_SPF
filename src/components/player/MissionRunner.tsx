"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, ShieldCheck, TrendingUp, UserRound } from "lucide-react";
import { ClueInspector } from "@/components/player/ClueInspector";
import { ConsequenceTakeover } from "@/components/player/ConsequenceTakeover";
import { DebriefCard } from "@/components/player/DebriefCard";
import { DecisionOption } from "@/components/player/DecisionOption";
import { RewardBurst } from "@/components/player/RewardBurst";
import { ScenarioMessage } from "@/components/player/ScenarioMessage";
import { useScenarioRun } from "@/lib/hooks/useScenarioRun";
import { usePlayer } from "@/lib/state/PlayerProvider";

interface MissionRunnerProps {
  scenarioId: string;
  /** Peer Shield gets teal accents and a friend card; encounters get civic blue. */
  accent?: "civic" | "teal";
  eyebrow: string;
  /** Peer Shield shows the friend's name and quote above the transcript. */
  friend?: { name: string; quote: string };
  /** Question posed to the player above the decision list. */
  decisionPrompt: string;
  /** Prominent mode badge above the title. Marks Peer Shield as its own mode. */
  modeBadge?: string;
  /** One line stating what the player is learning to do. */
  note?: string;
  skillCaption?: string;
  backHref: string;
  backLabel: string;
}

export function MissionRunner({
  scenarioId,
  accent = "civic",
  eyebrow,
  friend,
  decisionPrompt,
  modeBadge,
  note,
  skillCaption = "Skill practised",
  backHref,
  backLabel,
}: MissionRunnerProps) {
  const router = useRouter();
  const { profile, guardians } = usePlayer();
  const {
    scenario,
    transcript,
    taggedClues,
    toggleClue,
    pendingChoiceId,
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
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2
          className="h-6 w-6 animate-spin text-civic-600"
          aria-label="Loading mission"
        />
      </div>
    );
  }

  const isTeal = accent === "teal";
  /** The quiet beat between banking the reward and the consequence landing. */
  const awaitingConsequence = Boolean(result?.delayed) && !consequence;
  const guardianName = result?.debrief.guardianId
    ? guardians.find((g) => g.id === result.debrief.guardianId)?.name
    : undefined;

  return (
    <div className="relative flex min-h-full flex-col">
      {burst && (
        <RewardBurst
          key={burst.key}
          title={burst.title}
          amount={burst.amount}
          tone={burst.tone}
        />
      )}

      {/* Mission bar */}
      <header
        className={`sticky top-0 z-20 ${isTeal ? "bg-teal-700" : "bg-navy-900"}`}
      >
        <div className="flex items-center gap-3 px-4 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
              {eyebrow}
            </p>
            <p className="truncate text-[15px] font-bold text-white">
              {scenario.title}
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-white/12 px-2.5 py-1 text-[12px] font-bold text-white tabular-nums">
            {scenario.step} of {scenario.totalSteps}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 py-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white tabular-nums">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Trust {profile.trust}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white tabular-nums">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-coral-200"
            />
            Risk {profile.risk}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white tabular-nums">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Resilience {profile.resiliencePoints}
          </span>
        </div>
      </header>

      {/* Mission header */}
      <div
        className={`px-4 py-5 ${isTeal ? "bg-teal-50" : "bg-civic-50"} border-b ${
          isTeal ? "border-teal-100" : "border-civic-100"
        }`}
      >
        {modeBadge ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
            {modeBadge}
          </span>
        ) : (
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-civic-700">
            {scenario.category}
          </p>
        )}
        <p
          className={`mt-2 text-[15px] font-bold leading-snug ${
            isTeal ? "text-teal-700" : "text-navy-900"
          }`}
        >
          {scenario.hook}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-900">
          {scenario.title}
        </h1>
        {modeBadge && (
          <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
            {scenario.category}
          </p>
        )}
        {note && (
          <p className="mt-3 rounded-xl border border-teal-200 bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
            {note}
          </p>
        )}
      </div>

      {/* Friend card — Peer Shield only */}
      {friend && (
        <div className="border-b border-line px-4 py-4">
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface-sunk p-3.5">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-600 text-base font-extrabold text-white"
            >
              {friend.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
                <UserRound className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                {friend.name}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink">
                “{friend.quote}”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      <div className="flex-1 space-y-3 px-4 py-4">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            The situation
          </h2>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-ink-muted">
            {scenario.prompt}
          </p>
        </div>

        {transcript.map((m) => (
          <ScenarioMessage key={m.id} message={m} accent={accent} />
        ))}

        {!isResolved && scenario.clues && scenario.clueQuestion && (
          <div className="pt-1">
            <ClueInspector
              question={scenario.clueQuestion}
              clues={scenario.clues}
              tagged={taggedClues}
              onToggle={toggleClue}
              disabled={Boolean(pendingChoiceId)}
            />
          </div>
        )}

        {/*
          When a delayed consequence is pending we deliberately show no debrief.
          Telling the player it went badly during the three seconds they are
          meant to feel rewarded would collapse the whole mechanic — the
          takeover is the debrief for that path.
        */}
        {result && !result.delayed && (
          <div className="pt-2">
            <DebriefCard
              outcome={result.outcome}
              debrief={result.debrief}
              deltas={result.deltas}
              guardianName={guardianName}
              skillCaption={skillCaption}
            />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Decision rail */}
      <div className="sticky bottom-0 z-20 space-y-2.5 border-t border-line bg-surface/95 px-4 pb-5 pt-4 backdrop-blur">
        {awaitingConsequence ? (
          // Holds the beat without hinting at the outcome.
          <p
            aria-live="polite"
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl border border-line bg-surface-sunk px-4 text-[14px] font-semibold text-ink-muted"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 animate-pulse rounded-full bg-leaf-600"
            />
            Deal done. Nothing else happens right now.
          </p>
        ) : isResolved ? (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-navy-900 px-4 text-[15px] font-extrabold text-white transition hover:bg-navy-800"
            >
              Back to missions
            </button>
            <button
              type="button"
              onClick={replay}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try a different decision
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[13px] font-bold text-navy-900">
              {decisionPrompt}
            </h2>
            {scenario.choices.map((choice, i) => (
              <DecisionOption
                key={choice.id}
                choice={choice}
                index={i}
                disabled={Boolean(pendingChoiceId)}
                pending={pendingChoiceId === choice.id}
                onSelect={choose}
              />
            ))}
          </>
        )}
      </div>

      <ConsequenceTakeover
        consequence={consequence}
        onContinue={() => router.push("/")}
        onReplay={replay}
      />
    </div>
  );
}
