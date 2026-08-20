"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "lucide-react";
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
  /**
   * City board node this mission fulfils. Completing the mission marks the node
   * done, which is what drives World Progress and district unlocks.
   */
  activityId?: string;
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
  activityId,
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
  const { profile, guardians, completeActivity } = usePlayer();
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
  /*
   * Mode explainers are folded away by default. They are worth reading, but
   * not ahead of the situation — on a phone an expanded explainer pushed the
   * message thread most of a screen down before the player had seen anything
   * to decide about.
   */
  const [aboutOpen, setAboutOpen] = useState(false);

  /*
   * Bring the outcome into view once a decision lands — the reply, then the
   * debrief or the holding beat before a delayed consequence. Deliberately not
   * on load: a player should read the situation from the top rather than be
   * dropped at the bottom of the thread.
   *
   * Scrolling is instant rather than smooth. The app column is its own
   * scrollport, and a smooth scroll inside it is easily interrupted by the
   * layout shift the debrief itself causes — landing in the wrong place is a
   * worse outcome than not animating.
   */
  useEffect(() => {
    const node = bottomRef.current;
    if (!node) return;
    if (result) {
      node.scrollIntoView({ block: "end" });
    } else {
      node.closest("main")?.scrollTo({ top: 0 });
    }
  }, [result]);

  /*
   * A decision counts as completing the node regardless of which option was
   * chosen. The risky path is where the most learning happens — locking city
   * progress behind picking the safe answer would turn the board into a quiz and
   * push players to guess rather than decide.
   */
  const resolved = Boolean(result);
  useEffect(() => {
    if (resolved && activityId) completeActivity(activityId);
  }, [resolved, activityId, completeActivity]);

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
            className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          {/*
            The mission bar carries the page heading. It used to be repeated as
            a large title in the band below, which spent a block of a phone
            screen on a label that was already on screen and stayed there.
          */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              {eyebrow}
            </p>
            <h1 className="truncate text-[16px] font-extrabold leading-tight text-white">
              {scenario.title}
            </h1>
          </div>
          <span className="shrink-0 rounded-lg bg-white/12 px-2 py-1 text-[11px] font-bold text-white tabular-nums">
            {scenario.step}/{scenario.totalSteps}
          </span>
        </div>

        {/* HUD. One strip, three numbers, always on screen. */}
        <dl className="flex items-center gap-1.5 border-t border-white/10 px-4 py-1">
          <HudStat
            icon={<TrendingUp className="h-3 w-3" aria-hidden="true" />}
            label="Trust"
            value={profile.trust}
          />
          <HudStat
            icon={
              <span
                aria-hidden="true"
                className="block h-1.5 w-1.5 rounded-full bg-coral-200"
              />
            }
            label="Risk"
            value={profile.risk}
          />
          <HudStat
            icon={<ShieldCheck className="h-3 w-3" aria-hidden="true" />}
            label="Resil."
            value={profile.resiliencePoints}
          />
        </dl>
      </header>

      {/*
        Mission framing. Only what a player needs before deciding: which mode
        this is, the hook, and the situation. The mode explainer sits behind
        "About" so it cannot push the thread off the first screen.
      */}
      <div
        className={`px-4 py-2.5 ${isTeal ? "bg-teal-50" : "bg-civic-50"} border-b ${
          isTeal ? "border-teal-100" : "border-civic-100"
        }`}
      >
        <div className="flex items-center gap-2">
          {modeBadge && (
            <span className="inline-flex shrink-0 items-center rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
              {modeBadge}
            </span>
          )}
          <p className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {scenario.category}
          </p>
          {note && (
            <button
              type="button"
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
              aria-controls="mission-about"
              className={`-my-1.5 inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg px-1.5 text-[12px] font-bold transition ${
                isTeal
                  ? "text-teal-700 hover:text-teal-600"
                  : "text-civic-700 hover:text-civic-800"
              }`}
            >
              About
              <span className="sr-only"> {modeBadge ?? "this mission"}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${aboutOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <p
          className={`mt-1 text-[14px] font-bold leading-snug ${
            isTeal ? "text-teal-700" : "text-navy-900"
          }`}
        >
          {scenario.hook}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold leading-snug text-ink-muted">
          {scenario.prompt}
        </p>

        {note && aboutOpen && (
          <p
            id="mission-about"
            className="mt-2 rounded-xl border border-teal-200 bg-surface px-3 py-2 text-[12.5px] leading-snug text-ink"
          >
            {note}
          </p>
        )}
      </div>

      {/* Friend card — Peer Shield only */}
      {friend && (
        <div className="border-b border-line px-4 py-2.5">
          <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-sunk p-2.5">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-600 text-[15px] font-extrabold text-white"
            >
              {friend.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-navy-900">
                <UserRound className="h-3 w-3 text-teal-700" aria-hidden="true" />
                {friend.name}
              </p>
              <p className="mt-0.5 text-[13.5px] leading-snug text-ink">
                “{friend.quote}”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      <div className="flex-1 space-y-2 px-4 py-2.5">
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
      <div className="sticky bottom-0 z-20 space-y-2 border-t border-line bg-surface/95 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
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
              onClick={() => router.push(backHref)}
              className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-navy-900 px-4 text-[15px] font-extrabold text-white transition hover:bg-navy-800"
            >
              {backLabel}
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
        onContinue={() => router.push(backHref)}
        onReplay={replay}
      />
    </div>
  );
}

/** One HUD figure. Compact enough that three fit on one strip at 375px. */
function HudStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1">
      <span className="shrink-0 text-white/80">{icon}</span>
      <dt className="truncate text-[10px] font-bold uppercase tracking-wide text-white/70">
        {label}
      </dt>
      <dd className="ml-auto text-[12px] font-extrabold tabular-nums text-white">
        {value}
      </dd>
    </div>
  );
}
