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
import { MissionComplete } from "@/components/player/MissionComplete";
import { ConsequenceTakeover } from "@/components/player/ConsequenceTakeover";
import { DebriefCard } from "@/components/player/DebriefCard";
import { DecisionOption } from "@/components/player/DecisionOption";
import { RewardBurst } from "@/components/player/RewardBurst";
import { RewardTakeover } from "@/components/player/RewardTakeover";
import { ScenarioMessage } from "@/components/player/ScenarioMessage";
import { useScenarioRun } from "@/lib/hooks/useScenarioRun";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { TOKEN_AWARD, tokenKey } from "@/lib/api/rewards-data";
import { SITUATION_CARDS } from "@/lib/api/board-data";

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
  /**
   * Opt in to the two-column laptop composition: the situation on the left,
   * the decision on the right.
   *
   * Off by default, and deliberately so. A solo scenario is a message thread
   * arriving on your phone, and that *is* the situation being rehearsed — it
   * keeps a phone-width reading column on every screen. Peer Shield is the
   * opposite case: the player is a bystander weighing evidence against a
   * response, and on a laptop those two things belong side by side rather than
   * a scroll apart.
   */
  desktopSplit?: boolean;
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
  desktopSplit = false,
}: MissionRunnerProps) {
  const router = useRouter();
  const { profile, guardians, completeActivity, awardTokens } = usePlayer();
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
   *
   * Shield Tokens follow the same rule: completing the mission pays the same
   * participation award whichever option was taken, so no player is ever paid
   * for choosing badly and none is punished for exploring. The one bonus that
   * does depend on the decision is the Peer Shield one — intervening
   * constructively for a friend is the skill that mode exists to build.
   */
  const resolved = Boolean(result);
  const awardedRef = useRef(false);
  const [tokensAwarded, setTokensAwarded] = useState(0);

  useEffect(() => {
    if (!resolved || !activityId || awardedRef.current) return;
    awardedRef.current = true;

    completeActivity(activityId);

    let total = awardTokens(tokenKey.mission(activityId), TOKEN_AWARD.mission);
    if (scenario?.mode === "PEER_SHIELD" && result?.outcome === "SAFE") {
      total += awardTokens(
        tokenKey.peerShieldSuccess(activityId),
        TOKEN_AWARD.peerShieldSuccess,
      );
    }
    setTokensAwarded(total);
  }, [
    activityId,
    awardTokens,
    completeActivity,
    resolved,
    result?.outcome,
    scenario?.mode,
  ]);

  /*
   * Mission Complete is a separate beat from the debrief, and the delayed
   * consequence has to be allowed to land first — so the takeover is dismissed
   * into the completion card, and "View what I learned" puts it back rather
   * than leaving the player with no way to re-read it.
   */
  const [completeOpen, setCompleteOpen] = useState(false);
  const [takeoverDismissed, setTakeoverDismissed] = useState(false);

  /*
   * The full-screen reward state, shown only for a choice that pays now and
   * charges later — the moment the whole Delayed Consequence Engine turns on.
   * A safe choice keeps the smaller floating burst: a takeover there would read
   * as "you won", which is not what a considered decision is.
   *
   * It is dismissed by the player, or automatically the moment the consequence
   * lands on top of it.
   */
  const [rewardSeen, setRewardSeen] = useState(false);

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
  const guardian = result?.debrief.guardianId
    ? guardians.find((g) => g.id === result.debrief.guardianId)
    : undefined;
  const guardianName = guardian?.name;

  /*
   * "Warning signs identified" on the completion card is the player's own clue
   * tagging, not an invented figure — the mission asks which signals stood out,
   * and this reports how many of them they actually marked.
   */
  const signals = scenario.clues?.length
    ? { found: taggedClues.length, total: scenario.clues.length }
    : undefined;
  const casebookDiscovered = Boolean(
    activityId &&
      SITUATION_CARDS.some(
        (card) => card.nodeId === activityId && profile.casebook.includes(card.id),
      ),
  );

  const finish = () => setCompleteOpen(true);

  const bigReward = Boolean(result?.delayed) && Boolean(result?.flashAmount);
  const rewardOpen = bigReward && !rewardSeen && !consequence;

  /*
   * The measure of the mission.
   *
   * On a laptop the mission surface spans the shell either way, and the measure
   * lives *inside* it — on the contents of each band. The root only carries a
   * width below xl, where the viewport is the measure anyway.
   *
   * That split matters. A mission bar, a HUD strip and a decision rail that all
   * stop 600px short of the window edge read as a phone frame parked on the
   * desktop, however little chrome is drawn around them: what makes a page look
   * like a separate document is its bands ending, not its borders. Running the
   * bands edge to edge and centring only the reading content is what the rest of
   * ShieldQuest does, so a solo scenario does it too.
   *
   * The two differ only in how wide the reading content is allowed to be: a
   * bystander weighing evidence against a response gets two columns inside
   * 1400px, and a message thread you are living through stays a thread.
   */
  const measure = desktopSplit
    ? "mx-auto w-full max-w-[440px] md:max-w-[720px] xl:max-w-none"
    : "mx-auto w-full max-w-[440px] md:max-w-[560px] xl:max-w-none";
  /** The inner measure, applied to the contents of every full-bleed band. */
  const band = desktopSplit
    ? "mx-auto w-full xl:max-w-[1400px]"
    : "mx-auto w-full xl:max-w-[700px]";

  return (
    <div className={`relative flex min-h-full flex-col ${measure}`}>
      {burst && !bigReward && (
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
        <div className={`${band} flex items-center gap-3 px-4 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] ${desktopSplit ? "xl:gap-4 xl:px-6 xl:pb-3 xl:pt-4" : ""}`}>
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
        <div className="border-t border-white/10">
        <dl className={`${band} flex items-center gap-1.5 px-4 py-1 ${desktopSplit ? "xl:gap-3 xl:px-6 xl:py-2" : ""}`}>
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
        </div>
      </header>

      {/*
        Mission framing. Only what a player needs before deciding: which mode
        this is, the hook, and the situation. The mode explainer sits behind
        "About" so it cannot push the thread off the first screen.
      */}
      <div
        className={`${isTeal ? "bg-teal-50" : "bg-civic-50"} border-b ${
          isTeal ? "border-teal-100" : "border-civic-100"
        }`}
      >
      <div className={`${band} px-4 py-2.5 ${desktopSplit ? "xl:px-6 xl:py-3.5" : ""}`}>
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
      </div>

      {/*
        Situation and decision.

        One flex column on a phone — friend card, thread, then the decision rail
        pinned to the bottom, exactly as before. On a laptop the same two groups
        become two columns: what happened on the left, what you do about it on
        the right, both on screen at once instead of a scroll apart.
      */}
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          desktopSplit
            ? `${band} xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-start xl:gap-7 xl:px-6 xl:py-5`
            : ""
        }`}
      >
        <div
          className={`flex min-w-0 flex-1 flex-col ${desktopSplit ? "" : band}`}
        >
      {/* Friend card — Peer Shield only */}
      {friend && (
        <div
          className={`border-b border-line px-4 py-2.5 ${
            desktopSplit ? "xl:rounded-2xl xl:border xl:px-4 xl:py-3" : ""
          }`}
        >
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

      {/*
        Transcript. Capped on a laptop: a message thread read at 700px is still
        a message thread, and one read at 1400px is a document.
      */}
      <div
        className={`flex-1 space-y-2 px-4 py-2.5 ${
          desktopSplit ? "xl:max-w-[700px] xl:px-0 xl:py-3" : ""
        }`}
      >
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
        </div>

      {/*
        Decision rail. A pinned bar at the bottom of a phone; the right-hand
        pane on a laptop, where it sticks near the top of the column so the
        response options stay put while the thread is read beside them.
      */}
      <div
        className={`sticky bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur ${
          desktopSplit
            ? "xl:bottom-auto xl:top-5 xl:self-start xl:rounded-2xl xl:border xl:bg-surface xl:shadow-[0_18px_44px_-32px_rgba(11,37,69,0.55)]"
            : ""
        }`}
      >
        <div
          className={`space-y-2 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 ${
            desktopSplit ? "xl:px-5 xl:pb-5 xl:pt-4" : band
          }`}
        >
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
              onClick={finish}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-leaf-700 bg-leaf-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.06em] text-white transition hover:bg-leaf-700 active:translate-y-[3px] active:border-b-0"
            >
              Finish mission
            </button>
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
            >
              {backLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                setCompleteOpen(false);
                setTakeoverDismissed(false);
                setRewardSeen(false);
                replay();
              }}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try a different decision
            </button>
          </div>
        ) : (
          <>
            <h2
              className={`text-[13px] font-bold text-navy-900 ${
                desktopSplit ? "xl:text-[16px] xl:leading-snug" : ""
              }`}
            >
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
      </div>
      </div>

      <RewardTakeover
        open={rewardOpen}
        amount={(result?.flashAmount ?? "").split(" ")[0]}
        unit={(result?.flashAmount ?? "").split(" ").slice(1).join(" ") || "Coins"}
        headline={
          result?.flashTitle
            ? `${result.flashTitle}. It went through straight away.`
            : "It went through straight away."
        }
        onContinue={() => setRewardSeen(true)}
      />

      {/*
        The takeover is the debrief for the delayed path, so it hands over to
        Mission Complete rather than straight back to the district — and it can
        be reopened from there, because a player who wants to re-read why the
        S$300 cost them should never have to replay the mission to do it.
      */}
      <ConsequenceTakeover
        consequence={takeoverDismissed ? null : consequence}
        onContinue={() => {
          setTakeoverDismissed(true);
          setCompleteOpen(true);
        }}
        onReplay={() => {
          setTakeoverDismissed(false);
          setRewardSeen(false);
          replay();
        }}
      />

      <MissionComplete
        open={completeOpen}
        title={scenario.title}
        competency={result?.debrief.competency ?? scenario.primaryCompetency}
        guardian={guardian}
        signals={signals}
        tokensAwarded={tokensAwarded}
        guardianAdvanced={Boolean(result?.debrief.guardianId)}
        casebookDiscovered={casebookDiscovered}
        onViewLearning={() => {
          setCompleteOpen(false);
          // The delayed path has no debrief card — the takeover is the lesson.
          if (consequence) setTakeoverDismissed(false);
          else bottomRef.current?.scrollIntoView({ block: "end" });
        }}
        onClose={() => setCompleteOpen(false)}
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
