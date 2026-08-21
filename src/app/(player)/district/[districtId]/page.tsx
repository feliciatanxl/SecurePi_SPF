"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, MessageCircle } from "lucide-react";
import { DistrictPlate, DistrictScene } from "@/components/player/DistrictArt";
import { DistrictDiscovery } from "@/components/player/DistrictDiscovery";
import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import { MissionNodeCard } from "@/components/player/MissionNode";
import { PlayerSheet, sheetMeasure } from "@/components/player/PlayerSheet";
import { useDistrict } from "@/lib/hooks/useWorld";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { DISTRICT_CHAPTER } from "@/lib/api/world-data";

/**
 * A district route — the middle layer of the board:
 *
 *   district → mission stop → activity → learning outcome → progress
 *
 * Stops are laid out as an ordered route so progression is legible, but the
 * player is not marched down it: everything marked open can be started in any
 * order, and locked stops state exactly what opens them.
 *
 * The framing copy — what this district is about, which topics it covers — sits
 * behind one tap rather than above the route, so the stops themselves are what
 * a phone opens on.
 */
export default function DistrictPage() {
  const params = useParams<{ districtId: string }>();
  const districtId = params.districtId;
  const district = useDistrict(districtId);
  const { guardians, hydrated, profile, travelTo } = usePlayer();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const evaluatedVisit = useRef<string | null>(null);

  // Arriving moves the player's marker, so the board reflects where they went.
  // `travelTo` is a no-op when the marker is already here, so this settles.
  const arrivedAt = district?.id;
  useEffect(() => {
    if (!hydrated || !arrivedAt || evaluatedVisit.current === arrivedAt) return;
    evaluatedVisit.current = arrivedAt;
    const firstVisit = !profile.discoveredDistricts.includes(arrivedAt);
    travelTo(arrivedAt);
    if (firstVisit) setDiscoveryOpen(true);
  }, [arrivedAt, hydrated, profile.discoveredDistricts, travelTo]);

  if (!district) {
    return (
      <div className="px-5 py-16 text-center">
        <h1 className="text-xl font-extrabold text-navy-900">
          District not found
        </h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          That part of ShieldQuest City does not exist yet.
        </p>
        <Link
          href="/game"
          className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-navy-900 px-5 text-[15px] font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the city
        </Link>
      </div>
    );
  }

  const skin = DISTRICT_SKIN[district.id];
  const chapter = DISTRICT_CHAPTER[district.id];
  const guardianName = (id?: string) =>
    id ? guardians.find((g) => g.id === id)?.name : undefined;

  return (
    <>
      <PlayerSheet
        className="animate-travel pb-6"
        /*
          The bar and the district hero span the shell; the activity route below
          keeps a measure. A chapter should own the screen on a laptop — that is
          what makes it feel like arriving somewhere — without the stop cards
          being dragged 2000px apart from the titles they belong to.
        */
        header={
          <>
            {/* One compact bar: where you are, how far in, and the way back. */}
            <header className="sticky top-0 z-20 bg-navy-900 px-3 pb-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] text-white xl:px-6">
              <div className={`${sheetMeasure()} flex items-center gap-2`}>
          <Link
            href="/game"
            aria-label="Back to ShieldQuest City"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>

          <DistrictPlate
            districtId={district.id}
            className="h-10 w-10 rounded-xl"
            iconClassName="h-5 w-5"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              {chapter.label}
            </p>
            <h1 className="truncate text-[18px] font-extrabold uppercase leading-tight tracking-tight">
              {district.name}
            </h1>
          </div>

          {district.cleared && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-leaf-600 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              Cleared
            </span>
          )}
          <span className="shrink-0 rounded-lg bg-white/12 px-2.5 py-1 text-[12px] font-bold tabular-nums text-white">
            {district.total > 0
              ? `${district.completed}/${district.total}`
              : "Chapter"}
              </span>
              </div>
            </header>

            <section className="relative isolate h-[148px] overflow-hidden text-white xl:h-[300px] 2xl:h-[340px]">
              <DistrictScene districtId={district.id} className="-z-20 opacity-100" />
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/95 via-navy-950/20 to-transparent"
              />
              <div className="absolute inset-x-4 bottom-4 xl:inset-x-6 xl:bottom-7">
                <div className={sheetMeasure()}>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-300">
            {chapter.label} · {district.completed} / {district.total} activities
          </p>
                  <h2 className="mt-0.5 text-[25px] font-extrabold uppercase leading-none tracking-tight xl:text-[44px]">
                    {chapter.title}
                  </h2>
                  <p className="mt-1 max-w-xl text-[12px] font-semibold leading-snug text-white/80 xl:text-[14px]">
                    {chapter.intro}
                  </p>
                </div>
              </div>
            </section>
          </>
        }
      >

      {district.id === "digi" && (
        <div className="flex items-start gap-2 border-b border-civic-200 bg-civic-50 px-4 py-2.5 text-civic-800">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-[12px] leading-snug">
            <span className="font-extrabold uppercase tracking-wide">Jayden story thread</span>
            <span className="block mt-0.5 text-ink-muted">
              An easy online job becomes account pressure, then a chance to protect a friend.
            </span>
          </p>
        </div>
      )}

      {/* Route band, with the district briefing folded away behind it. */}
      <div className={`border-b ${skin.header}`}>
        {/*
          The district scene washes the route band. Behind this row only, and
          never behind the briefing that unfolds under it — that is body copy,
          and body copy gets a plain surface.
        */}
        <div className="relative isolate flex items-center justify-between gap-2 overflow-hidden px-4 py-1.5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy-900">
            Chapter activities
          </h2>
          <button
            type="button"
            onClick={() => setAboutOpen((v) => !v)}
            aria-expanded={aboutOpen}
            aria-controls="district-about"
            className="-my-1 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-[12px] font-bold text-navy-900/75 transition hover:text-navy-900"
          >
            About this district
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${aboutOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {aboutOpen && (
          <div
            id="district-about"
            className="border-t border-navy-900/10 px-4 py-3"
          >
            <p className="text-[13px] leading-relaxed text-ink-muted">
              {district.tagline}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {district.topics.map((topic) => (
                <li
                  key={topic}
                  className="rounded-md border border-navy-900/15 bg-surface px-2 py-0.5 text-[11px] font-semibold text-navy-900"
                >
                  {topic}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
              Choose any open activity. Planned story beats are labelled coming soon, and nothing here is decided by chance.
            </p>
          </div>
        )}
      </div>

      <ol className="relative space-y-2.5 px-4 py-3.5 pl-11 xl:px-6 xl:py-5 xl:pl-12">
        {/* The route line the stops hang off. */}
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-[26px] top-6 w-[3px] rounded-full bg-line"
        />
        {district.nodes.map((node, i) => (
          <li key={node.id} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-7 top-5 h-3 w-3 rounded-full border-2 border-surface ${
                node.completed
                  ? "bg-leaf-600"
                  : node.playable
                    ? skin.fill
                    : "bg-line-strong"
              }`}
            />
            <MissionNodeCard
              node={node}
              index={i}
              guardianName={guardianName(node.guardianId)}
            />
          </li>
        ))}
      </ol>

      <div className="px-4">
        <Link
          href="/game"
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to ShieldQuest City
        </Link>
      </div>
      </PlayerSheet>
      <DistrictDiscovery
        district={discoveryOpen ? district : null}
        onExplore={() => setDiscoveryOpen(false)}
      />
    </>
  );
}
