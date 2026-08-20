"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  Flame,
  Info,
  ShieldHalf,
  TrendingUp,
} from "lucide-react";
import { CityBoard } from "@/components/player/CityBoard";
import { CityInfoSheet } from "@/components/player/CityInfoSheet";
import { DistrictSheet } from "@/components/player/DistrictSheet";
import { WorldProgress } from "@/components/player/WorldProgress";
import { CITY_TAGLINE } from "@/lib/api/world-data";
import { useWorld, type ResolvedDistrict } from "@/lib/hooks/useWorld";
import { usePlayer, guardianStanding } from "@/lib/state/PlayerProvider";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  COMPETENCY_ORDER,
} from "@/lib/types";

/**
 * View 1 — ShieldQuest City.
 *
 * Gameplay-first on a phone: a compact HUD, the board itself taking the rest of
 * the screen, one obvious next move pinned above the tab bar, and everything
 * explanatory one tap away in a sheet. The framework, the structure and the
 * prototype framing are all still here — they are simply no longer the first
 * thing a fifteen-year-old has to scroll past to play.
 *
 * The board is an engagement layer, not the product: every route out of here
 * leads to a behavioural decision, a peer intervention or a reinforcement
 * activity that hands the player back to one of those.
 */
export default function CityHome() {
  const { profile, guardians } = usePlayer();
  const { districts, progress, currentDistrictId } = useWorld();

  const [openDistrict, setOpenDistrict] = useState<ResolvedDistrict | null>(
    null,
  );
  const [aboutOpen, setAboutOpen] = useState(false);

  const currentGuardian =
    guardians.find((g) => g.id === profile.currentGuardianId) ?? guardians[0];
  const standing = guardianStanding(
    currentGuardian,
    profile.guardianProgress[currentGuardian.id] ?? 0,
  );

  // The first thing the player has not finished, so there is always one obvious
  // next step rather than making them hunt the board for it.
  const nextUp =
    districts
      .flatMap((d) => d.nodes.map((n) => ({ node: n, district: d })))
      .find((x) => x.node.playable && !x.node.completed) ?? null;

  const pct = progress.total
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div className="flex min-h-full flex-col bg-navy-900">
      {/* ------------------------------ HUD ------------------------------ */}
      <header className="shrink-0 px-3.5 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Project SHIELD
            </p>
            {/* The wordmark carries the page heading. The city’s framing line
                rides with it for screen readers rather than taking a block of
                the board’s space. */}
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">
              Shield<span className="text-civic-500">Quest</span>
              <span className="sr-only"> — {CITY_TAGLINE}</span>
            </h1>
          </div>

          <p className="hidden text-right text-[12px] font-semibold text-civic-400 sm:block">
            Choose Right.
            <br />
            Protect Together.
          </p>

          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Info className="h-4.5 w-4.5" aria-hidden="true" />
            <span className="sr-only">About this game</span>
          </button>
        </div>

        {/* Stat strip. Three numbers, one line, always visible. */}
        <dl className="mt-2 flex items-stretch gap-1.5">
          <Stat
            icon={<ShieldHalf className="h-3 w-3" />}
            label="Resilience"
            value={profile.resiliencePoints}
          />
          <Stat
            icon={<Coins className="h-3 w-3" />}
            label="Coins"
            value={profile.coins}
          />
          <Stat
            icon={<Flame className="h-3 w-3" />}
            label="Streak"
            value={profile.streakDays}
          />
        </dl>

        {/* Compact progress + current Guardian. Expandable on the Progress tab. */}
        <Link
          href="/progress"
          className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/8 px-2.5 py-2 transition hover:border-white/25"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-[13px] font-extrabold text-navy-900"
          >
            {COMPETENCY_LETTER[currentGuardian.competency]}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[11px] font-bold uppercase tracking-wide text-white">
                {currentGuardian.name} · Lv {standing.level}
              </span>
              <span className="shrink-0 text-[11px] font-bold tabular-nums text-navy-100">
                {progress.completed}/{progress.total}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/15"
            >
              <span
                className="block h-full rounded-full bg-amber-500 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
          </span>
          <TrendingUp
            className="h-4 w-4 shrink-0 text-navy-100/70"
            aria-hidden="true"
          />
          <span className="sr-only">
            City progress: {progress.completed} of {progress.total} activities.
            Open the progress page.
          </span>
        </Link>
      </header>

      {/* ----------------------------- Board ----------------------------- */}
      <div className="flex min-h-0 flex-1 flex-col px-3">
        <CityBoard
          districts={districts}
          currentDistrictId={currentDistrictId}
          nextDistrictId={nextUp?.district.id}
          onOpenDistrict={setOpenDistrict}
        />
      </div>

      {/* --------------------------- Next move --------------------------- */}
      <div className="shrink-0 px-3 pb-3 pt-2.5">
        <div className="flex gap-2">
          {nextUp?.node.href ? (
            <Link
              href={nextUp.node.href}
              className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 text-[14px] font-extrabold text-navy-900 shadow-[0_6px_20px_-8px_rgba(224,147,15,0.9)] transition hover:bg-amber-400"
            >
              <span className="truncate">Play: {nextUp.node.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : (
            <p className="flex min-h-[52px] flex-1 items-center justify-center rounded-xl border border-white/20 px-3 text-center text-[13px] font-semibold text-navy-100">
              Every open activity is complete — replay any stop
            </p>
          )}
          <Link
            href="/peer-shield"
            className="flex min-h-[52px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/30 px-3 text-[13px] font-bold text-white transition hover:bg-white/10"
          >
            <ShieldHalf className="h-4 w-4 shrink-0" aria-hidden="true" />
            Peer Shield
          </Link>
        </div>
      </div>

      {/*
        Tablet context. Laptops get the same material permanently in the shell's
        context rail, so it is not repeated there.
      */}
      <div className="hidden space-y-4 rounded-t-3xl bg-surface px-5 pb-5 pt-5 md:block xl:hidden">
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
          <ul className="mt-3 grid grid-cols-2 gap-1.5">
            {COMPETENCY_ORDER.map((c) => (
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
      </div>

      <DistrictSheet
        district={openDistrict}
        onClose={() => setOpenDistrict(null)}
      />
      <CityInfoSheet open={aboutOpen} onClose={() => setAboutOpen(false)} />
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
    <div className="flex-1 rounded-xl border border-white/12 bg-white/8 px-2 py-1.5">
      <dt className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em] text-navy-100/70">
        <span aria-hidden="true">{icon}</span>
        <span className="truncate">{label}</span>
      </dt>
      <dd className="text-[16px] font-extrabold leading-tight tabular-nums text-white">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}
