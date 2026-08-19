"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { GuardianProgressNote } from "@/components/player/GuardianCard";
import { RewardBurst } from "@/components/player/RewardBurst";
import { SectionLabel, SkillBadge } from "@/components/ui/Badges";
import { deltaLines } from "@/components/player/DebriefCard";
import { usePlayer } from "@/lib/state/PlayerProvider";
import type { MiniGame } from "@/lib/types";

/**
 * Shared chrome and reward pipeline for every mini-game.
 *
 * Mini-games are a reinforcement layer. They award a fraction of what a scenario
 * decision pays, and they are never the place a behavioural lesson is first
 * taught — the completion card always names the skill and hands the player back
 * towards the scenario content.
 *
 * The reward is granted exactly once per session, even if the player replays,
 * so a mini-game can never be farmed for stats.
 */
export function MiniGameShell({
  game,
  backHref,
  backLabel,
  /** Progress caption, e.g. "Warning signs found". */
  progressLabel,
  progressNow,
  progressTotal,
  /** True once the activity's own task is finished. */
  solved,
  /** Rendered above the play surface while the game is in progress. */
  children,
  /** Shown after `solved`, before the reward card. Used for transfer questions. */
  followUp,
  /** Set once any follow-up step is done and the reward may be granted. */
  readyToReward = true,
  surfaceClassName = "px-4 py-4",
  onReplay,
}: {
  game: MiniGame;
  backHref: string;
  backLabel: string;
  progressLabel: string;
  progressNow: number;
  progressTotal: number;
  solved: boolean;
  children: ReactNode;
  followUp?: ReactNode;
  readyToReward?: boolean;
  /** Play-surface padding. A dense grid claims more of the gutter than prose. */
  surfaceClassName?: string;
  onReplay: () => void;
}) {
  const { applyDeltas, advanceGuardian, completeActivity, guardians } =
    usePlayer();
  const [granted, setGranted] = useState(false);
  const [burstKey, setBurstKey] = useState<number | null>(null);
  const grantedOnce = useRef(false);

  const guardian = guardians.find((g) => g.id === game.reward.guardianId);

  /**
   * Called by the reward step. Guarded by a ref as well as state so a double
   * render in React Strict Mode cannot pay out twice.
   */
  const claim = useCallback(() => {
    if (grantedOnce.current) return;
    grantedOnce.current = true;
    applyDeltas(game.reward.deltas);
    advanceGuardian(game.reward.guardianId);
    completeActivity(game.nodeId);
    setGranted(true);
    setBurstKey(Date.now());
  }, [
    advanceGuardian,
    applyDeltas,
    completeActivity,
    game.nodeId,
    game.reward.deltas,
    game.reward.guardianId,
  ]);

  const replay = () => {
    setBurstKey(null);
    onReplay();
  };

  const stats = deltaLines(game.reward.deltas);
  const coins = game.reward.deltas.coins ?? 0;

  return (
    <div className="relative flex min-h-full flex-col">
      {burstKey !== null && (
        <RewardBurst
          key={burstKey}
          title="Activity complete"
          amount={coins ? `+${coins} Coins` : undefined}
          tone="positive"
        />
      )}

      {/* Activity bar */}
      <header className="sticky top-0 z-20 bg-navy-900">
        <div className="flex items-center gap-3 px-4 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
              Mini-Game
            </p>
            <p className="truncate text-[15px] font-bold text-white">
              {game.title}
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-white/12 px-2.5 py-1 text-[12px] font-bold tabular-nums text-white">
            {progressNow} / {progressTotal}
          </span>
        </div>
      </header>

      {/* Instruction */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
          {progressLabel}
        </p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-navy-900">
          {game.title}
        </h1>
        <p className="mt-1 text-[14px] leading-relaxed text-ink">
          {game.instruction}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SkillBadge
            competency={game.primaryCompetency}
            caption="Skill practised"
          />
          {guardian && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-surface px-3 py-2 text-[13px] font-bold text-amber-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {guardian.name}
            </span>
          )}
        </div>
      </div>

      {/* Play surface */}
      <div className={`flex-1 ${surfaceClassName}`}>{children}</div>

      {/* Completion */}
      {solved && (
        <div className="space-y-3 border-t border-line px-4 pb-6 pt-4">
          {followUp}

          {readyToReward && !granted && (
            <button
              type="button"
              onClick={claim}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-4 text-[15px] font-extrabold text-white transition hover:bg-leaf-600"
            >
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              Claim your progress
            </button>
          )}

          {granted && (
            <section
              className="animate-rise space-y-3 rounded-2xl border border-leaf-200 bg-leaf-50 p-4"
              aria-live="polite"
            >
              <div>
                <SectionLabel>{game.skillName}</SectionLabel>
                <p className="mt-1 text-lg font-extrabold uppercase tracking-wide text-leaf-700">
                  {game.skillTitle}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink">
                  {game.skillLine}
                </p>
              </div>

              {stats.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coins > 0 && (
                    <span className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[13px] font-bold tabular-nums text-navy-900">
                      Coins +{coins}
                    </span>
                  )}
                  {stats.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[13px] font-bold tabular-nums text-navy-900"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {guardian && <GuardianProgressNote name={guardian.name} />}

              <p className="border-t border-leaf-200 pt-3 text-[13px] leading-relaxed text-ink-muted">
                Mini-games sharpen recognition. The decision itself is still
                practised in the scenario missions.
              </p>

              <div className="space-y-2.5 pt-1">
                <Link
                  href={backHref}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 px-4 text-[15px] font-extrabold text-white transition hover:bg-navy-800"
                >
                  Back to the district
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={replay}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Play again
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
