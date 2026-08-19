"use client";

import Link from "next/link";
import { ArrowRight, Coins, Flame, ShieldHalf } from "lucide-react";
import { GuardianMini } from "@/components/player/GuardianCard";
import { WorldMap } from "@/components/player/WorldMap";
import { WorldProgress } from "@/components/player/WorldProgress";
import { CITY_TAGLINE } from "@/lib/api/world-data";
import { PROTOTYPE_DISCLAIMER } from "@/lib/api/mock-data";
import { useWorld } from "@/lib/hooks/useWorld";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { COMPETENCY_LABEL, COMPETENCY_LETTER, type Competency } from "@/lib/types";

const FRAMEWORK: Competency[] = [
  "SPOT",
  "HOLD",
  "IDENTIFY",
  "EVALUATE",
  "LEAD",
  "DEFEND",
];

/**
 * View 1 — ShieldQuest City.
 *
 * The city board is the front door and the primary navigation surface. It is an
 * engagement layer, not the product: every route out of here leads to a
 * behavioural decision, a peer intervention or a reinforcement activity that
 * hands the player back to one of those.
 */
export default function CityHome() {
  const { profile, guardians } = usePlayer();
  const { districts, progress, currentDistrictId } = useWorld();

  const currentGuardian =
    guardians.find((g) => g.id === profile.currentGuardianId) ?? guardians[0];

  // The first thing the player has not finished, so the hero always has one
  // obvious next step rather than making them hunt the board for it.
  const nextUp =
    districts
      .flatMap((d) => d.nodes.map((n) => ({ node: n, district: d })))
      .find((x) => x.node.playable && !x.node.completed) ?? null;

  return (
    <div className="pb-6">
      {/* Hero */}
      <header className="bg-navy-900 px-5 pb-5 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
          Project SHIELD
        </p>
        <p className="mt-1.5 text-3xl font-extrabold tracking-tight">
          Shield<span className="text-civic-500">Quest</span>
        </p>
        <p className="mt-1 text-[14px] font-semibold text-civic-400">
          Choose Right. Protect Together.
        </p>

        <h1 className="mt-5 text-[22px] font-extrabold leading-[1.2] tracking-tight">
          {CITY_TAGLINE}
        </h1>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          {nextUp?.node.href && (
            <Link
              href={nextUp.node.href}
              className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-[15px] font-extrabold text-navy-900 shadow-[0_6px_20px_-8px_rgba(224,147,15,0.9)] transition hover:bg-amber-400"
            >
              <span className="truncate">Continue: {nextUp.node.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
          <Link
            href="/peer-shield"
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 px-4 text-[15px] font-semibold text-white transition hover:bg-white/10"
          >
            <ShieldHalf className="h-4 w-4" aria-hidden="true" />
            Peer Shield
          </Link>
        </div>

        {/* Player overview */}
        <section
          aria-label="Your progress"
          className="mt-5 rounded-2xl border border-white/12 bg-white/8 p-3.5"
        >
          <GuardianMini
            guardian={currentGuardian}
            cumulative={profile.guardianProgress[currentGuardian.id] ?? 0}
          />

          <dl className="mt-3.5 grid grid-cols-3 gap-2 border-t border-white/12 pt-3.5">
            <Stat
              icon={<ShieldHalf className="h-3.5 w-3.5" />}
              label="Resilience"
              value={profile.resiliencePoints}
            />
            <Stat
              icon={<Coins className="h-3.5 w-3.5" />}
              label="Coins"
              value={profile.coins}
            />
            <Stat
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Day streak"
              value={profile.streakDays}
            />
          </dl>
        </section>
      </header>

      {/* The board */}
      <div className="bg-navy-900 pb-5">
        <WorldMap districts={districts} currentDistrictId={currentDistrictId} />
      </div>

      <div className="space-y-4 rounded-t-3xl bg-surface px-5 pt-5">
        <WorldProgress progress={progress} />

        <section
          aria-labelledby="framework"
          className="rounded-2xl border border-line bg-surface-sunk p-4"
        >
          <h2
            id="framework"
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            The six skills you practise
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            Every activity in the city is tagged with the skill it builds. You
            will see the tag on the mission, not a lecture about the framework.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {FRAMEWORK.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[c]}
                </span>
                <span className="text-[13px] font-medium text-ink">
                  {COMPETENCY_LABEL[c]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="pt-1 text-center text-[12px] leading-relaxed text-ink-soft">
          {PROTOTYPE_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-navy-100/70">
        <span aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 text-lg font-extrabold tabular-nums text-white">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}
