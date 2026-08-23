"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  MessagesSquare,
  RotateCcw,
  Sparkles,
  Users,
  Vote,
} from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { ScenarioMessage } from "@/components/player/ScenarioMessage";
import { SectionLabel, SkillBadge } from "@/components/ui/Badges";
import { TOKEN_AWARD, tokenKey } from "@/lib/api/rewards-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import type { GroupDecisionScenario, GroupDecisionStage } from "@/lib/types";

/**
 * Think · Vote · Explain — the facilitated group mechanic, on one device.
 *
 * ## What is real here and what is simulated
 *
 * Real: the private think, the locked vote, the reasoning the player tags, the
 * second vote, whether they changed their mind, and the progress that follows
 * from finishing the activity.
 *
 * Simulated: every number attributed to a *group*. There is no session, no
 * other device, no participant list and no server. The group distributions are
 * authored fixtures, and this component labels them as simulated on every
 * surface that shows one — a badge on the panel, a caption on the chart and a
 * line in the debrief. That is not decoration. A pitch audience looking at a
 * bar chart will assume it is data unless told otherwise, and this mechanic is
 * worth demonstrating honestly or not at all.
 *
 * The stage order is fixed and one-way. A player who could jump straight to the
 * group view before locking a vote would be doing something other than thinking
 * privately, which is the step the whole mechanic is built on.
 */

const STAGES: { id: GroupDecisionStage; label: string; short: string }[] = [
  { id: "THINK", label: "Think privately", short: "Think" },
  { id: "VOTE", label: "Lock your vote", short: "Vote" },
  { id: "GROUP", label: "See the room", short: "Group" },
  { id: "EXPLAIN", label: "Explain why", short: "Explain" },
  { id: "RECONSIDER", label: "Decide again", short: "Decide" },
  { id: "DEBRIEF", label: "Debrief", short: "Debrief" },
];

export function GroupDecisionRunner({
  scenario,
  backHref,
  backLabel,
}: {
  scenario: GroupDecisionScenario;
  backHref: string;
  backLabel: string;
}) {
  const {
    guardians,
    applyDeltas,
    advanceGuardian,
    completeActivity,
    awardTokens,
  } = usePlayer();

  const [stage, setStage] = useState<GroupDecisionStage>("THINK");
  const [firstChoice, setFirstChoice] = useState<string | null>(null);
  const [finalChoice, setFinalChoice] = useState<string | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [factorsShared, setFactorsShared] = useState(false);
  const [tokensAwarded, setTokensAwarded] = useState(0);

  const guardian = guardians.find((g) => g.id === scenario.guardianId);
  const stageIndex = STAGES.findIndex((s) => s.id === stage);
  const panelRef = useRef<HTMLDivElement>(null);
  const awardedRef = useRef(false);

  /*
   * Progress is granted on reaching the debrief, whichever way the player
   * voted and whether or not they changed their mind. Paying more for the safe
   * option would turn a discussion exercise into a guessing game — and the
   * player who votes "leave it", hears the room, and then moves is exactly the
   * person this mechanic is for.
   */
  useEffect(() => {
    if (stage !== "DEBRIEF" || awardedRef.current) return;
    awardedRef.current = true;
    applyDeltas(scenario.reward);
    advanceGuardian(scenario.guardianId);
    completeActivity(scenario.nodeId);
    setTokensAwarded(
      awardTokens(tokenKey.mission(scenario.nodeId), TOKEN_AWARD.mission),
    );
  }, [
    advanceGuardian,
    applyDeltas,
    awardTokens,
    completeActivity,
    scenario.guardianId,
    scenario.nodeId,
    scenario.reward,
    stage,
  ]);

  /* The stage panel is below the transcript on a phone. Bring it into view. */
  useEffect(() => {
    if (stage === "THINK") return;
    panelRef.current?.scrollIntoView({ block: "start" });
  }, [stage]);

  /*
   * Running it again resets the flow but deliberately not the award. The Shield
   * Token grant is keyed and could not pay twice anyway, but Guardian progress
   * and the stat deltas are not — and a facilitated question a player can
   * re-run four times to level Beacon four times would make Guardian progress
   * evidence of replaying rather than of practising. The debrief says "already
   * earned" on a second pass, which is what actually happened.
   */
  const restart = () => {
    setStage("THINK");
    setFirstChoice(null);
    setFinalChoice(null);
    setFactors([]);
    setFactorsShared(false);
    setTokensAwarded(0);
  };

  const band = "mx-auto w-full xl:max-w-[1400px]";
  const optionOf = (id: string | null) =>
    scenario.options.find((o) => o.id === id);

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-[440px] flex-col md:max-w-[720px] xl:max-w-none">
      {/* Activity bar */}
      <header className="sticky top-0 z-20 bg-coral-700">
        <div
          className={`${band} flex items-center gap-3 px-4 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] xl:gap-4 xl:px-6 xl:pb-3 xl:pt-4`}
        >
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/12 text-white"
          >
            <Vote className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              {scenario.eyebrow}
            </p>
            <h1 className="truncate text-[16px] font-extrabold leading-tight text-white">
              {scenario.title}
            </h1>
          </div>
          <span className="shrink-0 rounded-lg bg-white/12 px-2 py-1 text-[11px] font-bold tabular-nums text-white">
            {stageIndex + 1}/{STAGES.length}
          </span>
        </div>

        {/* Stage rail. Scrolls on a phone rather than shrinking to nothing. */}
        <div className="border-t border-white/10">
          <ol
            aria-label="Think, Vote, Explain stages"
            className={`${band} thin-scroll flex gap-1.5 overflow-x-auto px-4 py-1.5 xl:px-6`}
          >
            {STAGES.map((s, i) => {
              const done = i < stageIndex;
              const active = i === stageIndex;
              return (
                <li key={s.id} className="shrink-0">
                  <span
                    aria-current={active ? "step" : undefined}
                    className={`flex min-h-[28px] items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      active
                        ? "bg-white text-coral-700"
                        : done
                          ? "bg-white/18 text-white"
                          : "bg-white/8 text-white/60"
                    }`}
                  >
                    {done ? (
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <span className="tabular-nums">{i + 1}</span>
                    )}
                    {s.short}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      {/* Framing */}
      <div className="border-b border-coral-100 bg-coral-50">
        <div className={`${band} px-4 py-2.5 xl:px-6 xl:py-3.5`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-coral-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
              <Users className="h-3 w-3" aria-hidden="true" />
              Think · Vote · Explain
            </span>
            <p className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              {scenario.category}
            </p>
          </div>
          <p className="mt-1 text-[14px] font-bold leading-snug text-coral-700">
            {STAGES[stageIndex].label}
          </p>
          <p className="mt-0.5 text-[13px] font-semibold leading-snug text-ink-muted">
            {scenario.situation}
          </p>
          <PrototypeNote />
        </div>
      </div>

      {/* Situation and stage panel */}
      <div
        className={`flex min-h-0 flex-1 flex-col ${band} xl:grid xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:items-start xl:gap-7 xl:px-6 xl:py-5`}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 space-y-2 px-4 py-2.5 xl:max-w-[640px] xl:px-0 xl:py-0">
            {scenario.messages.map((m) => (
              <ScenarioMessage key={m.id} message={m} accent="civic" />
            ))}
          </div>
        </div>

        <div
          ref={panelRef}
          className="scroll-mt-28 space-y-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1.5 xl:sticky xl:top-5 xl:self-start xl:rounded-2xl xl:border xl:border-line xl:bg-surface xl:px-5 xl:py-5 xl:shadow-[0_18px_44px_-32px_rgba(11,37,69,0.55)]"
        >
          {stage === "THINK" && (
            <ThinkStage
              question={scenario.question}
              onDone={() => setStage("VOTE")}
            />
          )}

          {stage === "VOTE" && (
            <VoteStage
              heading="Lock in what you would do"
              caption="Nobody sees this until everyone has voted. That is the point of voting first."
              question={scenario.question}
              options={scenario.options}
              onChoose={(id) => {
                setFirstChoice(id);
                setStage("GROUP");
              }}
            />
          )}

          {stage === "GROUP" && firstChoice && (
            <GroupStage
              scenario={scenario}
              myChoiceId={firstChoice}
              onContinue={() => setStage("EXPLAIN")}
            />
          )}

          {stage === "EXPLAIN" && (
            <ExplainStage
              scenario={scenario}
              chosen={factors}
              shared={factorsShared}
              onToggle={(id) =>
                setFactors((prev) =>
                  prev.includes(id)
                    ? prev.filter((f) => f !== id)
                    : [...prev, id],
                )
              }
              onShare={() => setFactorsShared(true)}
              onContinue={() => setStage("RECONSIDER")}
            />
          )}

          {stage === "RECONSIDER" && (
            <VoteStage
              heading="Now decide again"
              caption="Changing your mind after hearing a reason is the skill, not a climbdown. Keeping it is fine too."
              question={scenario.question}
              options={scenario.options}
              firstChoiceId={firstChoice}
              onChoose={(id) => {
                setFinalChoice(id);
                setStage("DEBRIEF");
              }}
            />
          )}

          {stage === "DEBRIEF" && (
            <DebriefStage
              scenario={scenario}
              firstLabel={optionOf(firstChoice)?.label}
              finalLabel={optionOf(finalChoice)?.label}
              changed={Boolean(
                firstChoice && finalChoice && firstChoice !== finalChoice,
              )}
              factorLabels={scenario.factors
                .filter((f) => factors.includes(f.id))
                .map((f) => f.label)}
              guardianName={guardian?.name}
              guardianPlate={
                guardian ? (
                  <GuardianPlate
                    guardian={guardian}
                    className="h-10 w-10 rounded-2xl text-[15px]"
                    tone="amber"
                  />
                ) : null
              }
              tokensAwarded={tokensAwarded}
              backHref={backHref}
              onRestart={restart}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared framing                                                      */
/* ------------------------------------------------------------------ */

/** Never optional, and never smaller than the numbers it qualifies. */
function PrototypeNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11.5px] font-semibold leading-snug text-amber-700">
      <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      {children ?? (
        <>
          Prototype Group Simulation. Group figures on this screen are authored
          demonstration values — there is no live session, no other device and
          no participant data behind them.
        </>
      )}
    </p>
  );
}

function StageHeading({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
}) {
  return (
    <div>
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-1 text-[17px] font-extrabold leading-snug tracking-tight text-navy-900">
        {title}
      </h2>
      {caption && (
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          {caption}
        </p>
      )}
    </div>
  );
}

const primaryButton =
  "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-coral-700 bg-coral-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.06em] text-white transition hover:bg-coral-700 active:translate-y-[3px] active:border-b-0";

/* ------------------------------------------------------------------ */
/* Stage 1 — Think                                                     */
/* ------------------------------------------------------------------ */

function ThinkStage({
  question,
  onDone,
}: {
  question: string;
  onDone: () => void;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-line bg-surface-sunk p-4 xl:border-0 xl:bg-transparent xl:p-0">
      <StageHeading
        eyebrow="Step 1 · Think"
        title={question}
        caption="Read it through and settle on an answer before anyone says anything out loud. Thinking first is what stops the loudest voice in the room deciding for everybody."
      />
      <ul className="space-y-1.5 text-[13px] leading-relaxed text-ink-muted">
        <li className="flex gap-2">
          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
          No discussion yet.
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
          There is no marked-correct option, before or after.
        </li>
      </ul>
      <button type="button" onClick={onDone} className={primaryButton}>
        I have thought about it
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stages 2 and 5 — Vote, and vote again                               */
/* ------------------------------------------------------------------ */

function VoteStage({
  heading,
  caption,
  question,
  options,
  firstChoiceId,
  onChoose,
}: {
  heading: string;
  caption: string;
  question: string;
  options: GroupDecisionScenario["options"];
  /** Marked on the second vote so the player can see what they said before. */
  firstChoiceId?: string | null;
  onChoose: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <StageHeading
        eyebrow={firstChoiceId ? "Step 5 · Decide again" : "Step 2 · Vote"}
        title={heading}
        caption={caption}
      />
      <p className="text-[13px] font-bold text-navy-900">{question}</p>
      <ul className="space-y-2">
        {options.map((option, i) => {
          const wasFirst = firstChoiceId === option.id;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onChoose(option.id)}
                className={`flex min-h-[64px] w-full items-start gap-2.5 rounded-2xl border-2 px-3.5 py-3 text-left transition ${
                  wasFirst
                    ? "border-civic-500 bg-civic-50"
                    : "border-line-strong bg-surface hover:border-coral-600 hover:bg-coral-50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line-strong bg-surface-sunk text-[12px] font-extrabold text-ink-muted"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold leading-snug text-navy-900">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">
                    {option.hint}
                  </span>
                  {wasFirst && (
                    <span className="mt-1.5 inline-block rounded-md bg-civic-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                      Your first vote
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 3 — See the room                                              */
/* ------------------------------------------------------------------ */

function GroupStage({
  scenario,
  myChoiceId,
  onContinue,
}: {
  scenario: GroupDecisionScenario;
  myChoiceId: string;
  onContinue: () => void;
}) {
  const mine = scenario.options.find((o) => o.id === myChoiceId);

  return (
    <section className="space-y-3">
      <StageHeading
        eyebrow="Step 3 · Group view"
        title="How the room split"
        caption="Nobody is named and nothing is attributed. What a group is looking at here is its own spread — including how many people picked what they picked quietly."
      />

      <div className="rounded-2xl border border-line bg-surface p-3.5">
        <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          Simulated Group Responses
          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
            Demonstration only
          </span>
        </p>
        <ul className="mt-2.5 space-y-2.5">
          {scenario.options.map((option) => (
            <VoteBar
              key={option.id}
              label={option.label}
              pct={option.simulatedFirstVotePct}
              mine={option.id === myChoiceId}
            />
          ))}
        </ul>
      </div>

      {mine && (
        <div className="rounded-2xl border border-civic-200 bg-civic-50 p-3.5">
          <SectionLabel>What your vote means here</SectionLabel>
          <p className="mt-1 text-[14px] font-bold leading-snug text-navy-900">
            {mine.label}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink">
            {mine.afterVoteNote}
          </p>
        </div>
      )}

      <PrototypeNote>
        These percentages are authored for the demonstration. No responses were
        collected and no session exists behind this chart.
      </PrototypeNote>

      <button type="button" onClick={onContinue} className={primaryButton}>
        Say why
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}

function VoteBar({
  label,
  pct,
  mine = false,
  tone = "coral",
}: {
  label: string;
  pct: number;
  mine?: boolean;
  tone?: "coral" | "civic";
}) {
  return (
    <li>
      <p className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 text-[13px] font-semibold leading-snug text-navy-900">
          {label}
          {mine && (
            <span className="ml-1.5 rounded-md bg-civic-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
              You
            </span>
          )}
        </span>
        <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-navy-900">
          {pct}%
        </span>
      </p>
      <span
        aria-hidden="true"
        className="mt-1 block h-2.5 overflow-hidden rounded-full bg-line"
      >
        <span
          className={`block h-full rounded-full transition-[width] duration-700 ${
            tone === "civic" ? "bg-civic-600" : "bg-coral-600"
          }`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 4 — Explain                                                   */
/* ------------------------------------------------------------------ */

function ExplainStage({
  scenario,
  chosen,
  shared,
  onToggle,
  onShare,
  onContinue,
}: {
  scenario: GroupDecisionScenario;
  chosen: string[];
  shared: boolean;
  onToggle: (id: string) => void;
  onShare: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="space-y-3">
      <StageHeading
        eyebrow="Step 4 · Explain"
        title="What was behind your vote?"
        caption="Pick everything that was actually in your head. Naming the reason is what makes it reusable — and it is the part other people learn from."
      />

      <ul className="flex flex-wrap gap-2">
        {scenario.factors.map((factor) => {
          const active = chosen.includes(factor.id);
          return (
            <li key={factor.id}>
              <button
                type="button"
                onClick={() => onToggle(factor.id)}
                aria-pressed={active}
                className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-left text-[13px] font-semibold leading-snug transition ${
                  active
                    ? "border-coral-600 bg-coral-50 text-coral-700"
                    : "border-line-strong bg-surface text-navy-900 hover:border-coral-600"
                }`}
              >
                {factor.label}
              </button>
            </li>
          );
        })}
      </ul>

      {!shared ? (
        <button
          type="button"
          onClick={onShare}
          disabled={chosen.length === 0}
          className={`${primaryButton} disabled:cursor-not-allowed disabled:border-line disabled:bg-line-strong disabled:text-ink-muted`}
        >
          <MessagesSquare className="h-4 w-4" aria-hidden="true" />
          Compare with the room
        </button>
      ) : (
        <>
          <div className="rounded-2xl border border-line bg-surface p-3.5">
            <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Simulated reasons given
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                Demonstration only
              </span>
            </p>
            <ul className="mt-2.5 space-y-2.5">
              {scenario.factors.map((factor) => (
                <VoteBar
                  key={factor.id}
                  label={factor.label}
                  pct={factor.simulatedSharePct}
                  mine={chosen.includes(factor.id)}
                  tone="civic"
                />
              ))}
            </ul>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
              Shares do not total 100 — people gave more than one reason.
            </p>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3.5">
            <SectionLabel>Talk about it</SectionLabel>
            <ul className="mt-1.5 space-y-1.5">
              {scenario.discussionPrompts.map((prompt) => (
                <li
                  key={prompt}
                  className="flex gap-2 text-[13px] leading-relaxed text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
                  />
                  {prompt}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              In a facilitated session these are asked out loud. On one device
              they are here so the flow can be demonstrated end to end.
            </p>
          </div>

          <button type="button" onClick={onContinue} className={primaryButton}>
            Decide again
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 6 — Debrief                                                   */
/* ------------------------------------------------------------------ */

function DebriefStage({
  scenario,
  firstLabel,
  finalLabel,
  changed,
  factorLabels,
  guardianName,
  guardianPlate,
  tokensAwarded,
  backHref,
  onRestart,
}: {
  scenario: GroupDecisionScenario;
  firstLabel?: string;
  finalLabel?: string;
  changed: boolean;
  factorLabels: string[];
  guardianName?: string;
  guardianPlate: React.ReactNode;
  tokensAwarded: number;
  backHref: string;
  onRestart: () => void;
}) {
  return (
    <section className="space-y-3" aria-live="polite">
      <StageHeading
        eyebrow="Step 6 · Debrief"
        title={scenario.debrief.headline}
      />
      <p className="text-[14px] leading-relaxed text-ink">
        {scenario.debrief.body}
      </p>

      <div className="rounded-2xl border border-line bg-surface-sunk p-3.5">
        <SectionLabel>Your two votes</SectionLabel>
        <dl className="mt-1.5 space-y-1.5 text-[13px]">
          <div className="flex gap-2">
            <dt className="w-[92px] shrink-0 font-bold text-ink-soft">First</dt>
            <dd className="font-semibold text-navy-900">{firstLabel ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[92px] shrink-0 font-bold text-ink-soft">After the room</dt>
            <dd className="font-semibold text-navy-900">{finalLabel ?? "—"}</dd>
          </div>
        </dl>
        <p
          className={`mt-2 inline-block rounded-lg px-2.5 py-1 text-[12.5px] font-bold ${
            changed
              ? "bg-leaf-50 text-leaf-700"
              : "bg-civic-50 text-civic-700"
          }`}
        >
          {changed
            ? "You changed your mind after hearing the reasoning."
            : "You held your position after hearing the reasoning."}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-3.5">
        <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          Simulated second vote
          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
            Demonstration only
          </span>
        </p>
        <ul className="mt-2.5 space-y-2.5">
          {scenario.options.map((option) => (
            <VoteBar
              key={option.id}
              label={option.label}
              pct={option.simulatedSecondVotePct}
              mine={option.label === finalLabel}
            />
          ))}
        </ul>
      </div>

      {factorLabels.length > 0 && (
        <div className="rounded-2xl border border-civic-200 bg-civic-50 p-3.5">
          <SectionLabel>The reasons you named</SectionLabel>
          <ul className="mt-1.5 space-y-1">
            {factorLabels.map((label) => (
              <li
                key={label}
                className="flex gap-2 text-[13px] leading-snug text-ink"
              >
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-civic-700"
                  strokeWidth={3}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
        <SectionLabel>What was in the situation</SectionLabel>
        <ul className="mt-1.5 space-y-1">
          {scenario.debrief.warningSigns.map((sign) => (
            <li
              key={sign}
              className="flex gap-2 text-[13px] leading-snug text-ink"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600"
              />
              {sign}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-leaf-200 bg-leaf-50 p-3.5">
        <SectionLabel>A safer response</SectionLabel>
        <p className="mt-1 text-[13.5px] leading-relaxed text-ink">
          {scenario.debrief.saferResponse}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface-sunk p-3.5">
        <SectionLabel>For the facilitator</SectionLabel>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          {scenario.debrief.facilitatorNote}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SkillBadge
          competency={scenario.primaryCompetency}
          caption="Skill practised"
        />
        {guardianName && (
          <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[13px] font-bold text-amber-700">
            {guardianPlate}
            {guardianName} +1
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[13px] font-bold tabular-nums text-amber-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {tokensAwarded > 0
            ? `Shield Tokens +${tokensAwarded}`
            : "Shield Tokens already earned"}
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        <Link
          href="/game"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.06em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
        >
          Return to city
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={backHref}
          className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
        >
          Back to the district
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Run it again
        </button>
      </div>
    </section>
  );
}
