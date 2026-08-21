"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Coins, Info, MapPin, Shield, ShieldHalf, Sparkles } from "lucide-react";
import { BoardMiniMap } from "@/components/player/board/BoardMiniMap";
import { CityTrack } from "@/components/player/board/CityTrack";
import { DiceRoller } from "@/components/player/board/DiceRoller";
import { SpaceSheet } from "@/components/player/board/SpaceSheet";
import { CityInfoSheet } from "@/components/player/CityInfoSheet";
import { DistrictPlate } from "@/components/player/DistrictArt";
import { DistrictSheet } from "@/components/player/DistrictSheet";
import { useBoard, type ResolvedSpace } from "@/lib/hooks/useBoard";
import { useDiceTurn } from "@/lib/hooks/useDiceTurn";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWorld, type ResolvedDistrict } from "@/lib/hooks/useWorld";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { CITY_TAGLINE } from "@/lib/api/world-data";
import type { DistrictId } from "@/lib/types";

/**
 * View 1 — ShieldQuest City.
 *
 * The board is now a real turn: roll, move, land, play. The die decides one
 * thing only — how many spaces the token moves. It cannot make a decision safe,
 * pay a Shield Token, strengthen a Guardian or declare anybody a winner. What a
 * player takes away is decided inside the activity the space opens.
 *
 * Everything on this screen is reachable without rolling. The four district
 * chips below the board open the same activities directly, which is what a
 * facilitator running a workshop, a live demonstration, or a player using a
 * screen reader needs — a game of chance is a bad way to reach a specific
 * lesson on purpose.
 */
export default function CityHome() {
  const { profile, guardians, equippedIn } = usePlayer();
  const { districts, progress } = useWorld();
  const { spaces, current, position, boardCompleted, boardPlayable } = useBoard();
  const reducedMotion = useReducedMotion(profile.settings.reducedMotion);

  const [landedSpace, setLandedSpace] = useState<ResolvedSpace | null>(null);
  const [openDistrict, setOpenDistrict] = useState<ResolvedDistrict | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const onLand = useCallback(
    (index: number) => setLandedSpace(spaces[index] ?? null),
    [spaces],
  );

  const turn = useDiceTurn({
    position,
    reducedMotion,
    sound: profile.settings.sound,
    onLand,
  });

  const districtNames = districts.reduce(
    (acc, d) => ({ ...acc, [d.id]: d.name }),
    {} as Record<DistrictId, string>,
  );

  // Equipped City Style cosmetics. Appearance only — a cosmetic never changes
  // where the token can go, how far it moves or what a space does.
  const trailEquipped = Boolean(equippedIn("routeTrail"));
  const tokenEquipped = Boolean(equippedIn("playerToken"));
  const markerEquipped = Boolean(equippedIn("boardMarker"));

  const closeSheet = () => {
    setLandedSpace(null);
    turn.endTurn();
  };

  const currentPlace = current?.districtId
    ? districtNames[current.districtId]
    : "Shield Central";

  return (
    <div className="flex min-h-full flex-col bg-navy-900">
      {/* ------------------------------ HUD ------------------------------ */}
      <header className="shrink-0 px-3.5 pb-2 pt-[max(0.6rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Project SHIELD
            </p>
            <h1 className="text-[21px] font-extrabold leading-tight tracking-tight">
              Shield<span className="text-civic-500">Quest</span>
              <span className="sr-only"> — {CITY_TAGLINE}</span>
            </h1>
          </div>

          <Link
            href="/shield-central"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Shield className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="sr-only">Shield Central</span>
          </Link>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Info className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="sr-only">About this game</span>
          </button>
        </div>

        {/* Stat strip. Coins are scenario cash; Shield Tokens are learning
            participation. They are never mixed, on this strip or anywhere. */}
        <dl className="mt-2 flex items-stretch gap-1.5">
          <Stat
            icon={<Coins className="h-3 w-3" />}
            label="Coins"
            value={profile.coins}
          />
          <Stat
            icon={<ShieldHalf className="h-3 w-3" />}
            label="Resilience"
            value={profile.resiliencePoints}
          />
          <Stat
            icon={<Sparkles className="h-3 w-3" />}
            label="Tokens"
            value={profile.shieldTokens}
          />
        </dl>
      </header>

      {/* ----------------------------- Board ----------------------------- */}
      <section
        aria-labelledby="city-board"
        className="track-ground mx-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-3.5 pb-1.5 pt-2.5">
          <h2
            id="city-board"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400"
          >
            ShieldQuest City
          </h2>
          <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-navy-100">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
            <span className="truncate">You are at {currentPlace}</span>
          </p>
        </div>

        <div className="flex min-h-0 flex-1 items-center">
          <CityTrack
            spaces={spaces}
            tokenIndex={turn.tokenIndex}
            steppingIndices={turn.steppingIndices}
            guardians={guardians}
            districtNames={districtNames}
            onOpenSpace={setLandedSpace}
            trailClass={trailEquipped ? "stroke-civic-500/45" : undefined}
            tokenClass={tokenEquipped ? "!border-civic-400" : undefined}
            markerCosmetic={markerEquipped}
          />
        </div>

        <div className="shrink-0 px-2.5 pb-2.5">
          <BoardMiniMap
            spaces={spaces}
            completed={boardCompleted}
            total={boardPlayable}
          />
        </div>
      </section>

      {/* ------------------------ Turn + direct access -------------------- */}
      <div className="shrink-0 space-y-2 px-3 pb-3 pt-2.5">
        <DiceRoller
          phase={turn.phase}
          value={turn.value}
          onRoll={turn.roll}
          disabled={landedSpace !== null}
        />

        {/*
          Direct district access, always available. Normal play is roll-and-move;
          this is how a facilitator reaches a specific lesson, how a live
          demonstration stays on script, and how anyone who would rather choose
          than roll still gets to everything.
        */}
        <nav aria-label="Go to a district">
          <ul className="flex gap-1.5">
            {districts.map((d) => (
              <li key={d.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setOpenDistrict(d)}
                  className="flex min-h-[46px] w-full flex-col items-center justify-center gap-0.5 rounded-xl border border-white/15 bg-white/8 px-1 py-1 transition hover:border-white/35"
                >
                  <DistrictPlate
                    districtId={d.id}
                    className="h-5 w-5 rounded-md"
                    iconClassName="h-3 w-3"
                  />
                  <span className="w-full truncate text-center text-[9px] font-bold uppercase tracking-wide text-white">
                    {d.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] font-bold tabular-nums text-navy-100/70">
                    {d.completed}/{d.total}
                  </span>
                  <span className="sr-only">
                    Open {d.name}. {d.completed} of {d.total} activities
                    completed.
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Plain text, not a link: Progress already has a tab of its own, and
            a 13px inline link is below a usable touch target. */}
        <p className="text-center text-[10px] leading-snug text-navy-100/60">
          The dice moves you. Your decisions decide what you learn.{" "}
          <span className="font-bold text-navy-100">
            {progress.completed}/{progress.total} activities completed
          </span>
        </p>
      </div>

      <SpaceSheet
        space={landedSpace}
        guardians={guardians}
        districtName={
          landedSpace?.districtId
            ? districtNames[landedSpace.districtId]
            : "Shield Central"
        }
        onClose={closeSheet}
      />
      <DistrictSheet
        district={openDistrict}
        onClose={() => setOpenDistrict(null)}
      />
      <CityInfoSheet
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        spaces={spaces}
      />
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
