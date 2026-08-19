"use client";

import Link from "next/link";
import { ArrowRight, Coins, Flame, ShieldHalf, Target } from "lucide-react";
import { GuardianMini } from "@/components/player/GuardianCard";
import { MissionCard, TodaysMissionCard } from "@/components/player/MissionCard";
import {
  PROTOTYPE_DISCLAIMER,
  TODAYS_MISSION,
  UPCOMING_MISSIONS,
} from "@/lib/api/mock-data";
import { usePlayer } from "@/lib/state/PlayerProvider";

/**
 * View 1 — Mission Home.
 *
 * The product's front door, not an index of demos. A youth should understand
 * what this is and be one tap from playing.
 */
export default function MissionHome() {
  const { profile, guardians } = usePlayer();
  const currentGuardian =
    guardians.find((g) => g.id === profile.currentGuardianId) ?? guardians[0];

  return (
    <div className="pb-6">
      {/* Hero */}
      <header className="rounded-b-3xl bg-navy-900 px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
          Project SHIELD
        </p>
        <p className="mt-1.5 text-3xl font-extrabold tracking-tight">
          Shield<span className="text-civic-500">Quest</span>
        </p>
        <p className="mt-1 text-[14px] font-semibold text-civic-500">
          Choose Right. Protect Together.
        </p>

        <h1 className="mt-6 text-[26px] font-extrabold leading-[1.15] tracking-tight">
          Think fast when the choice gets real.
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-navy-100">
          Practise recognising risk, handling pressure and protecting your
          friends before the situation happens in real life.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/play"
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-[15px] font-extrabold text-navy-900 shadow-[0_6px_20px_-8px_rgba(224,147,15,0.9)] transition hover:bg-amber-400"
          >
            Start today&rsquo;s mission
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
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
          className="mt-6 rounded-2xl border border-white/12 bg-white/8 p-3.5"
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
              icon={<Target className="h-3.5 w-3.5" />}
              label="Missions"
              value={profile.missionsCompleted}
            />
            <Stat
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Day streak"
              value={profile.streakDays}
            />
          </dl>

          <p className="mt-3 flex items-center gap-1.5 border-t border-white/12 pt-3 text-[12px] font-semibold text-amber-400">
            <Coins className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">
              {profile.coins.toLocaleString()}
            </span>
            <span className="font-medium text-navy-100">coins earned</span>
          </p>
        </section>
      </header>

      {/* Missions */}
      <div className="space-y-4 px-5 pt-6">
        <TodaysMissionCard mission={TODAYS_MISSION} />

        <section aria-labelledby="next-up">
          <h2
            id="next-up"
            className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Next up
          </h2>
          <div className="space-y-2.5">
            {UPCOMING_MISSIONS.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </div>
        </section>

        <p className="pt-2 text-center text-[12px] leading-relaxed text-ink-soft">
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
        {value}
      </dd>
    </div>
  );
}
