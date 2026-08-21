"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  CalendarClock,
  Check,
  Clock,
  Lock,
  MapPin,
  Shield,
  Sparkles,
} from "lucide-react";
import { DistrictScene } from "@/components/player/DistrictArt";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { SkillTag } from "@/components/player/MissionNode";
import { SpaceMark } from "@/components/player/board/SpaceMark";
import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import { Modal } from "@/components/ui/Modal";
import { guardianStanding, usePlayer } from "@/lib/state/PlayerProvider";
import { GUARDIAN_DIALOGUE } from "@/lib/api/world-data";
import type { ResolvedSpace } from "@/lib/hooks/useBoard";
import {
  BOARD_SPACE_LABEL,
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  NODE_KIND_LABEL,
  type Guardian,
} from "@/lib/types";

/**
 * What happens when the token lands.
 *
 * A bottom sheet over the board, never a page change: the board stays where it
 * is, so the turn reads as one continuous action rather than a navigation.
 *
 * Situation Card spaces show the card first and the briefing second — the card
 * frames the situation, the briefing names the activity and the skill, and only
 * then does the player leave for the mission itself. Every other space type
 * goes straight to what it has to say.
 *
 * No sheet in here awards anything. Landing is never a payout: a reward
 * checkpoint opens the Rewards Hub, a Guardian checkpoint reports progress the
 * player already earned. Tokens come from finishing activities, never from
 * where the die stopped.
 */
export function SpaceSheet({
  space,
  guardians,
  districtName,
  onClose,
}: {
  space: ResolvedSpace | null;
  guardians: Guardian[];
  districtName: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={space !== null}
      onClose={onClose}
      labelledBy="space-sheet-title"
      className="bg-surface"
    >
      {space && (
        <SheetBody
          space={space}
          guardians={guardians}
          districtName={districtName}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function SheetBody({
  space,
  guardians,
  districtName,
  onClose,
}: {
  space: ResolvedSpace;
  guardians: Guardian[];
  districtName: string;
  onClose: () => void;
}) {
  const { profile, recordCasebookEntry } = usePlayer();
  // A Situation Card leads with its face; every other space has nothing to
  // reveal, so it opens on the briefing or the checkpoint directly.
  const [showCard, setShowCard] = useState(space.kind === "SITUATION_CARD");

  /* Meeting a Situation Card files it in the Shield Casebook, so the learning
     reference is there afterwards whether or not the mission was finished. */
  const cardId = space.card?.id;
  useEffect(() => {
    if (cardId) recordCasebookEntry(cardId);
  }, [cardId, recordCasebookEntry]);

  const guardian = space.guardianId
    ? guardians.find((g) => g.id === space.guardianId)
    : undefined;

  return (
    <div className="flex max-h-[86dvh] min-h-0 flex-col">
      <span
        aria-hidden="true"
        className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden"
      />

      {space.kind === "SITUATION_CARD" && space.card && showCard ? (
        <SituationCardFace
          space={space}
          districtName={districtName}
          guardians={guardians}
          onContinue={() => setShowCard(false)}
        />
      ) : space.kind === "GUARDIAN_CHECKPOINT" && guardian ? (
        <GuardianCheckpoint
          guardian={guardian}
          cumulative={profile.guardianProgress[guardian.id] ?? 0}
          districtName={districtName}
          onClose={onClose}
        />
      ) : space.kind === "REWARD_CHECKPOINT" ? (
        <RewardCheckpoint
          tokens={profile.shieldTokens}
          districtName={districtName}
          onClose={onClose}
        />
      ) : space.kind === "DISTRICT_CHECKPOINT" ? (
        <DistrictCheckpoint space={space} districtName={districtName} onClose={onClose} />
      ) : space.kind === "SHIELD_CENTRAL" ? (
        <ShieldCentralSpace onClose={onClose} />
      ) : (
        <MissionBriefing
          space={space}
          districtName={districtName}
          guardians={guardians}
          onClose={onClose}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Situation Card                                                      */
/* ------------------------------------------------------------------ */

function SituationCardFace({
  space,
  districtName,
  guardians,
  onContinue,
}: {
  space: ResolvedSpace;
  districtName: string;
  guardians: Guardian[];
  onContinue: () => void;
}) {
  const card = space.card!;
  const guardian = guardians.find((g) => g.id === card.guardianId);

  return (
    <>
      <header className="shrink-0 bg-coral-600 px-5 pb-4 pt-3.5 text-center text-white">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-coral-100">
          {districtName} · Situation Card
        </p>
        <h2
          id="space-sheet-title"
          className="mt-1 text-[24px] font-extrabold uppercase leading-tight tracking-tight"
        >
          {card.title}
        </h2>
      </header>

      <div className="thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-center">
        {guardian && (
          <GuardianPlate
            guardian={guardian}
            className="mx-auto h-16 w-16 rounded-2xl text-xl"
          />
        )}

        <p className="text-[15px] font-semibold leading-relaxed text-ink">
          “{card.blurb}”
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-sunk px-2.5 py-1.5 text-[12px] font-bold text-navy-900">
            <span
              aria-hidden="true"
              className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
            >
              {COMPETENCY_LETTER[card.competency]}
            </span>
            {COMPETENCY_LABEL[card.competency]}
          </span>
          {guardian && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[12px] font-bold text-amber-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {guardian.name}
            </span>
          )}
        </div>

        <p className="rounded-xl border border-line bg-surface-sunk px-3 py-2 text-[12px] leading-relaxed text-ink-muted">
          Situation Cards never decide anything for you. This one opens the
          activity — what you take from it is your decision inside it.
        </p>
      </div>

      <div className="shrink-0 border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
        >
          {card.actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Mission briefing                                                    */
/* ------------------------------------------------------------------ */

/**
 * The compact briefing shown before an activity starts.
 *
 * Deliberately short: what it is, which skill it builds, whose Guardian it
 * strengthens, how long it takes, and one line on what the player will
 * practise. Nothing here is a lecture — the activity itself is the teaching.
 */
function MissionBriefing({
  space,
  districtName,
  guardians,
  onClose,
}: {
  space: ResolvedSpace;
  districtName: string;
  guardians: Guardian[];
  onClose: () => void;
}) {
  const router = useRouter();
  const node = space.node;
  const guardian = node?.guardianId
    ? guardians.find((g) => g.id === node.guardianId)
    : space.card
      ? guardians.find((g) => g.id === space.card!.guardianId)
      : undefined;

  const skin = space.districtId ? DISTRICT_SKIN[space.districtId] : undefined;

  return (
    <>
      <div className="relative h-[64px] w-full shrink-0 overflow-hidden">
        {space.districtId && (
          <DistrictScene districtId={space.districtId} className="opacity-100" />
        )}
      </div>

      <header
        className={`shrink-0 border-b px-5 pb-3.5 pt-3 ${skin?.header ?? "border-line bg-surface-sunk"}`}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-navy-900/70">
          {districtName} · {BOARD_SPACE_LABEL[space.kind]}
        </p>
        <h2
          id="space-sheet-title"
          className="mt-0.5 pr-10 text-[21px] font-extrabold uppercase leading-tight tracking-tight text-navy-900"
        >
          {node?.title ?? space.title}
        </h2>
        {node && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
            {NODE_KIND_LABEL[node.kind]}
          </p>
        )}
      </header>

      <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {node && <SkillTag competency={node.primaryCompetency} />}
          {node && (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-soft">
              <Clock className="h-3 w-3" aria-hidden="true" />~
              {node.estimatedMinutes} min
            </span>
          )}
        </div>

        {guardian && (
          <div className="guardian-briefing flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
            <GuardianPlate
              guardian={guardian}
              className="guardian-reaction h-12 w-12 rounded-2xl text-[15px]"
              tone="amber"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                {guardian.name} · {guardian.skill}
              </p>
              <p className="mt-0.5 text-[13px] font-semibold leading-snug text-navy-900">
                “{GUARDIAN_DIALOGUE[guardian.id]?.briefing ?? guardian.motto}”
              </p>
            </div>
          </div>
        )}

        <section className="rounded-xl border border-civic-100 bg-civic-50 p-3.5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-civic-700">
            What you&rsquo;ll practise
          </h3>
          <p className="mt-1 text-[14px] leading-relaxed text-ink">
            {node?.summary ?? space.card?.blurb}
          </p>
        </section>

        {space.completed && (
          <p className="flex items-center gap-2 rounded-xl border border-leaf-200 bg-leaf-50 px-3 py-2 text-[13px] font-bold text-leaf-700">
            <Check className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
            Already completed — replay any time. Shield Tokens are only paid
            once.
          </p>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        {node?.playable && node.href ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(node.href!);
            }}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
          >
            {space.completed ? "Play again" : "Start mission"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[13px] leading-relaxed text-ink-muted">
            {space.planned ? (
              <CalendarClock
                className="mt-0.5 h-4 w-4 shrink-0 text-coral-700"
                aria-hidden="true"
              />
            ) : (
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {space.planned ? (
                <>
                  <span className="font-bold uppercase tracking-wide text-coral-700">
                    Coming soon
                  </span>{" "}
                  — planned for prototype expansion. This activity is designed
                  but not built yet.
                </>
              ) : (
                <>
                  <span className="font-bold uppercase tracking-wide">
                    Locked by progress
                  </span>{" "}
                  — complete {node?.remainingToUnlock ?? 1} more{" "}
                  {(node?.remainingToUnlock ?? 1) === 1 ? "activity" : "activities"}{" "}
                  in {districtName}.
                  <span className="mt-1 block font-bold tabular-nums text-navy-900">
                    {node?.unlockCompleted ?? 0} / {node?.unlockRequired ?? 0}{" "}
                    completed
                  </span>
                </>
              )}
            </span>
          </p>
        )}

        {space.districtId && (
          <Link
            href={`/district/${space.districtId}`}
            onClick={onClose}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Open the full {districtName} route
          </Link>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Checkpoints                                                         */
/* ------------------------------------------------------------------ */

function CheckpointFrame({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <header className="shrink-0 border-b border-line bg-surface-sunk px-5 pb-3.5 pt-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-civic-700">
          {eyebrow}
        </p>
        <h2
          id="space-sheet-title"
          className="mt-0.5 pr-10 text-[20px] font-extrabold uppercase leading-tight tracking-tight text-navy-900"
        >
          {title}
        </h2>
      </header>
      <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {children}
      </div>
      <div className="shrink-0 space-y-2 border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        {footer}
      </div>
    </>
  );
}

function GuardianCheckpoint({
  guardian,
  cumulative,
  districtName,
  onClose,
}: {
  guardian: Guardian;
  cumulative: number;
  districtName: string;
  onClose: () => void;
}) {
  const { level, progress, target } = guardianStanding(guardian, cumulative);
  const remaining = target - progress;

  return (
    <CheckpointFrame
      eyebrow={`${districtName} · Guardian Checkpoint`}
      title={`${guardian.name} Checkpoint`}
      footer={
        <>
          <Link
            href="/guardians"
            onClick={onClose}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-[15px] font-extrabold text-white transition hover:bg-navy-800"
          >
            Open Guardians
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
          >
            Back to the board
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <GuardianPlate guardian={guardian} className="h-14 w-14 rounded-2xl text-xl" />
        <div className="min-w-0">
          <p className="text-[14px] font-extrabold uppercase tracking-wide text-navy-900">
            {guardian.skill}
          </p>
          <p className="text-[13px] italic text-ink-muted">“{guardian.motto}”</p>
        </div>
        <span className="ml-auto shrink-0 rounded-lg bg-navy-900/8 px-2 py-1 text-[12px] font-bold text-navy-800">
          Level {level}
        </span>
      </div>

      <div>
        <p className="flex items-baseline justify-between text-[12px] font-bold">
          <span className="uppercase tracking-[0.12em] text-ink-soft">
            {guardian.skill} progress
          </span>
          <span className="tabular-nums text-navy-900">
            {progress} / {target}
          </span>
        </p>
        <div className="mt-1.5 flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: target }, (_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${i < progress ? "bg-amber-500" : "bg-line"}`}
            />
          ))}
        </div>
      </div>

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[13px] leading-relaxed text-ink-muted">
        <span className="mb-1 block font-bold text-navy-900">
          “{GUARDIAN_DIALOGUE[guardian.id]?.checkpoint ?? guardian.motto}”
        </span>
        Complete {remaining} more {guardian.skill.toLowerCase()}{" "}
        {remaining === 1 ? "activity" : "activities"} to strengthen{" "}
        {guardian.name}. Guardian progress comes from decisions you make — never
        from the dice, and never from spending anything.
      </p>
    </CheckpointFrame>
  );
}

function RewardCheckpoint({
  tokens,
  districtName,
  onClose,
}: {
  tokens: number;
  districtName: string;
  onClose: () => void;
}) {
  return (
    <CheckpointFrame
      eyebrow={`${districtName} · Reward Checkpoint`}
      title="Rewards Checkpoint"
      footer={
        <>
          <Link
            href="/shield-central/rewards"
            onClick={onClose}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-navy-900 transition hover:bg-amber-400 active:translate-y-[3px] active:border-b-0"
          >
            <Award className="h-4 w-4" aria-hidden="true" />
            View rewards
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
          >
            Back to the board
          </button>
        </>
      }
    >
      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-center">
        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
          Shield Tokens available
        </span>
        <span className="mt-0.5 block text-4xl font-extrabold tabular-nums text-amber-700">
          {tokens.toLocaleString()}
        </span>
      </p>

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[13px] leading-relaxed text-ink-muted">
        Landing here does not award anything. It is a shortcut to the Rewards
        Hub. Shield Tokens are earned by completing activities and practising
        skills — never by a dice roll.
      </p>
    </CheckpointFrame>
  );
}

function DistrictCheckpoint({
  space,
  districtName,
  onClose,
}: {
  space: ResolvedSpace;
  districtName: string;
  onClose: () => void;
}) {
  return (
    <>
      <div className="relative h-[76px] w-full shrink-0 overflow-hidden">
        {space.districtId && (
          <DistrictScene districtId={space.districtId} className="opacity-100" />
        )}
      </div>
      <CheckpointFrame
        eyebrow="District Checkpoint"
        title={districtName}
        footer={
          <>
            {space.districtId && (
              <Link
                href={`/district/${space.districtId}`}
                onClick={onClose}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-[15px] font-extrabold text-white transition hover:bg-navy-800"
              >
                Open the district route
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
            >
              Back to the board
            </button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-ink">
          You have arrived in {districtName}. Every stop in this district is
          also reachable from the district route, so nothing here depends on the
          dice landing you on it.
        </p>
      </CheckpointFrame>
    </>
  );
}

function ShieldCentralSpace({ onClose }: { onClose: () => void }) {
  return (
    <CheckpointFrame
      eyebrow="ShieldQuest City"
      title="Shield Central"
      footer={
        <>
          <Link
            href="/shield-central"
            onClick={onClose}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-[15px] font-extrabold text-white transition hover:bg-navy-800"
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Open Shield Central
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
          >
            Back to the board
          </button>
        </>
      }
    >
      <p className="text-[14px] leading-relaxed text-ink">
        The hub of the city. Your journey, rewards, achievements, the Shield
        Casebook, trusted help and settings all live here.
      </p>
    </CheckpointFrame>
  );
}

/** Compact legend for the board space types. Shown in the city info sheet. */
export function BoardLegend({ spaces }: { spaces: ResolvedSpace[] }) {
  const seen = new Map<string, ResolvedSpace>();
  for (const space of spaces) if (!seen.has(space.kind)) seen.set(space.kind, space);

  return (
    <ul className="grid grid-cols-2 gap-2.5">
      {[...seen.values()].map((space) => (
        <li key={space.kind} className="flex items-center gap-2">
          <SpaceMark space={{ ...space, isCurrent: false, completed: false, planned: false, locked: false }} />
          <span className="min-w-0 text-[12px] font-semibold leading-tight text-ink">
            {BOARD_SPACE_LABEL[space.kind]}
          </span>
        </li>
      ))}
    </ul>
  );
}
