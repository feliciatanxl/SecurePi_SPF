"use client";

import { useEffect, useMemo, useRef } from "react";
import { DistrictScene } from "@/components/player/DistrictArt";
import { SpaceMark, spaceStateLabel } from "@/components/player/board/SpaceMark";
import {
  bandBox,
  routePath,
  spaceX,
  spaceY,
  TRACK_HEIGHT,
  TRACK_WIDTH,
} from "@/components/player/board/trackGeometry";
import { PlayerTokenMark } from "@/components/player/board/PlayerTokenMark";
import type { ResolvedSpace } from "@/lib/hooks/useBoard";
import {
  BOARD_SPACE_LABEL,
  type DistrictId,
  type Guardian,
} from "@/lib/types";

/**
 * The ShieldQuest City track.
 *
 * One continuous route of 22 original spaces running through the four
 * districts and back to Shield Central. The viewport pans along it — the
 * board camera — so a phone shows six or seven readable spaces around the
 * token instead of 22 unreadable dots, and a laptop shows more of the same
 * route rather than a different board.
 *
 * The camera is the container's own horizontal scroll. That is deliberate:
 * the browser clamps it at both ends for free, the player can pan ahead to
 * see what is coming, and a keyboard user gets the same panning without a
 * single extra control.
 */
/** Sets the camera position instantly, overriding the stylesheet's easing. */
function snap(el: HTMLDivElement, left: number) {
  const inline = el.style.scrollBehavior;
  el.style.scrollBehavior = "auto";
  el.scrollLeft = left;
  el.style.scrollBehavior = inline;
}

export function CityTrack({
  spaces,
  /** Where the token is drawn. Steps ahead of the persisted position mid-move. */
  tokenIndex,
  /** Spaces currently being counted across, in order. */
  steppingIndices,
  guardians,
  districtNames,
  onOpenSpace,
  /** Cosmetic route colour, if one is equipped. */
  trailClass,
  tokenClass,
  /** An equipped board-marker cosmetic. */
  markerCosmetic,
}: {
  spaces: ResolvedSpace[];
  tokenIndex: number;
  steppingIndices: number[];
  guardians: Guardian[];
  districtNames: Record<DistrictId, string>;
  onOpenSpace: (space: ResolvedSpace) => void;
  trailClass?: string;
  tokenClass?: string;
  markerCosmetic?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);

  /** Contiguous runs of spaces belonging to the same district. */
  const bands = useMemo(() => {
    const out: { districtId?: DistrictId; first: number; last: number }[] = [];
    for (const space of spaces) {
      const last = out[out.length - 1];
      if (last && last.districtId === space.districtId) last.last = space.index;
      else out.push({ districtId: space.districtId, first: space.index, last: space.index });
    }
    return out;
  }, [spaces]);

  /*
   * Keep the token in view. This is the whole camera.
   *
   * The pan is a plain `scrollLeft` assignment and the easing lives in CSS
   * (`.board-camera { scroll-behavior: smooth }`). That matters for two
   * reasons: the six assignments of a six-space move land as one continuous
   * pan instead of six competing scroll animations, and the reduced-motion
   * rule in globals.css already forces `scroll-behavior: auto`, so a player
   * who has asked for less movement gets an instant camera without this
   * component having to know about it.
   *
   * Only a single-space change is animated. A jump of more than one space is
   * not a move — it is the first paint, a restored session landing the token
   * mid-city, or a return from a mission — and it is snapped instantly. That
   * keeps the animation for the one case it is actually describing, and means
   * the token can never be left off-screen because an animated pan was
   * interrupted or never ran.
   */
  const lastPan = useRef<number | null>(null);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const previous = lastPan.current;
    lastPan.current = tokenIndex;
    const stepped = previous !== null && Math.abs(tokenIndex - previous) === 1;

    const target = spaceX(tokenIndex) - el.clientWidth / 2;
    if (stepped) {
      el.scrollLeft = target;
      return;
    }
    snap(el, target);
  }, [tokenIndex]);

  /*
   * And once the walk is over, land the camera exactly. An animated pan can be
   * cut short — the player drags the board mid-move, or the tab is backgrounded
   * — and a turn that ends with the token off-screen is the one failure this
   * component must not have.
   */
  const walking = steppingIndices.length > 0;
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || walking) return;
    snap(el, spaceX(tokenIndex) - el.clientWidth / 2);
  }, [walking, tokenIndex]);

  const path = useMemo(() => routePath(), []);
  const exploredPercent = Math.max(
    0,
    Math.min(100, (tokenIndex / Math.max(1, spaces.length - 1)) * 100),
  );

  return (
    <div
      ref={viewportRef}
      className="thin-scroll board-camera relative w-full overflow-x-auto overflow-y-hidden overscroll-x-contain"
      style={{ height: TRACK_HEIGHT }}
      aria-label="ShieldQuest City camera. Pan horizontally to look ahead."
    >
      <div
        className="relative"
        style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT }}
      >
        {/* District scenery. The V2.2 scenes sit under the route they belong
            to, so the track visibly travels through four places. */}
        {bands.map((band) => {
          const box = bandBox(band.first, band.last);
          return (
            <div
              key={`${band.districtId ?? "central"}-${band.first}`}
              className={`district-world absolute inset-y-0 overflow-hidden ${
                band.districtId ? `district-world-${band.districtId}` : "district-world-central"
              }`}
              style={{ left: box.left, width: box.width }}
            >
              {band.districtId ? (
                <>
                  <DistrictScene
                    districtId={band.districtId}
                    className="opacity-[0.9]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-b from-white/0 via-navy-950/5 to-navy-950/45"
                  />
                  <span aria-hidden="true" className="city-horizon absolute inset-x-0 bottom-0 h-[46%]" />
                  <p
                    aria-hidden="true"
                    className="absolute left-2.5 top-2 truncate rounded-md border border-white/30 bg-navy-950/78 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white shadow-sm"
                  >
                    {districtNames[band.districtId]}
                  </p>
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="city-central-beacon absolute inset-0" />
                  <p
                    aria-hidden="true"
                    className="absolute left-2.5 top-2 truncate rounded-md border border-amber-400/50 bg-navy-950/80 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-400"
                  >
                    Shield Central
                  </p>
                </>
              )}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 right-0 w-px bg-white/12"
              />
            </div>
          );
        })}

        {/* The route the token walks. */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={TRACK_WIDTH}
          height={TRACK_HEIGHT}
          viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`}
          aria-hidden="true"
        >
          <path
            d={path}
            fill="none"
            stroke="rgba(6,21,39,0.55)"
            strokeWidth={38}
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke="rgba(238,241,246,0.82)"
            strokeWidth={31}
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            className={trailClass ?? "stroke-amber-400/55"}
            strokeWidth={27}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${exploredPercent} 100`}
          />
          <path
            d={path}
            fill="none"
            stroke="rgba(11,37,69,0.28)"
            strokeWidth={2}
            strokeDasharray="5 8"
            strokeLinecap="round"
          />
        </svg>

        <ol className="absolute inset-0">
          {spaces.map((space) => {
            const stepOrder = steppingIndices.indexOf(space.index);
            const guardian = space.guardianId
              ? guardians.find((g) => g.id === space.guardianId)
              : undefined;

            return (
              <li
                key={space.index}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: spaceX(space.index), top: spaceY(space.index) }}
              >
                <button
                  type="button"
                  onClick={() => onOpenSpace(space)}
                  aria-current={space.isCurrent ? "location" : undefined}
                  className="relative grid h-[54px] w-[54px] place-items-center rounded-2xl transition hover:-translate-y-0.5 focus-visible:z-10"
                >
                  <SpaceMark
                    space={space}
                    guardian={guardian}
                    stepping={stepOrder >= 0}
                    markerCosmetic={markerCosmetic}
                    relation={
                      space.index === tokenIndex
                        ? "current"
                        : space.index < tokenIndex || space.visited
                          ? "behind"
                          : "ahead"
                    }
                  />
                  {/* Movement feedback: 1 → 2 → 3 → 4 as the token counts across. */}
                  {stepOrder >= 0 && (
                    <span
                      aria-hidden="true"
                      className="animate-pop absolute -bottom-2 grid h-[18px] w-[18px] place-items-center rounded-full border border-navy-950 bg-amber-400 text-[10px] font-extrabold text-navy-900"
                    >
                      {stepOrder + 1}
                    </span>
                  )}
                  <span className="sr-only">
                    Space {space.index + 1} of {spaces.length}.{" "}
                    {BOARD_SPACE_LABEL[space.kind]}. {space.title}.{" "}
                    {spaceStateLabel(space)}.
                    {space.isCurrent ? " You are here." : ""}
                  </span>
                  {space.index === tokenIndex && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-7 left-1/2 max-w-[92px] -translate-x-1/2 truncate rounded-md bg-navy-950/85 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white"
                    >
                      {space.title}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {/* The player token. Rides above the route rather than replacing a space. */}
        <div
          className="board-token pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
          style={{
            left: spaceX(tokenIndex),
            top: spaceY(tokenIndex) - 22,
          }}
        >
          <PlayerTokenMark className={tokenClass} />
        </div>
      </div>
    </div>
  );
}
