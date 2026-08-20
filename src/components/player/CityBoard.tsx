"use client";

import { Check, MapPin, ShieldHalf } from "lucide-react";
import { DistrictPlate } from "@/components/player/DistrictArt";
import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import { ArtSlot } from "@/components/ui/ArtSlot";
import { PLAYER_TOKEN_ART } from "@/lib/brand/assets";
import type { ResolvedDistrict } from "@/lib/hooks/useWorld";
import type { DistrictId } from "@/lib/types";

/**
 * ShieldQuest City — the mission board.
 *
 * An original board-based city route, built from CSS, SVG and the existing
 * design tokens. No map SDK, no game engine, no bitmap artwork, no board-game
 * property/card/branding conventions borrowed from anywhere.
 *
 * The board is the primary navigation surface *and* the primary gameplay
 * surface: districts are numbered stops on one continuous route, the player
 * token stands on the stop they last visited and travels when they move, and
 * the stop they should play next carries a halo. Nothing here is decided by
 * chance — a player can walk to any stop from the first second, so the route is
 * a sense of place and order, never a gate.
 *
 * Two arrangements of the same route, chosen in CSS rather than in JavaScript:
 * on a phone it runs down the screen, from tablet up it runs across. Because the
 * switch is a media query on custom properties, there is exactly one copy of
 * each stop in the DOM and in the accessibility tree.
 */

interface Point {
  x: number;
  y: number;
}

/** Snake down the phone board. */
function narrowLayout(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? 29 : 71,
    y: count === 1 ? 50 : 10 + (i * 80) / (count - 1),
  }));
}

/** Snake across the wide board. */
function wideLayout(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => ({
    x: count === 1 ? 50 : 13 + (i * 74) / (count - 1),
    y: i % 2 === 0 ? 30 : 72,
  }));
}

/** One cubic segment between two stops, bending along the board's long axis. */
function controls(a: Point, b: Point, axis: "y" | "x"): [Point, Point] {
  if (axis === "y") {
    const mid = (a.y + b.y) / 2;
    return [
      { x: a.x, y: mid },
      { x: b.x, y: mid },
    ];
  }
  const mid = (a.x + b.x) / 2;
  return [
    { x: mid, y: a.y },
    { x: mid, y: b.y },
  ];
}

function routePath(points: Point[], axis: "y" | "x"): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const [c1, c2] = controls(points[i - 1], points[i], axis);
    d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${points[i].x} ${points[i].y}`;
  }
  return d;
}

function bezierAt(p0: Point, c1: Point, c2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p3.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p3.y,
  };
}

/**
 * The spaces between stops. Drawn as elements rather than SVG circles because
 * the route SVG is stretched to the board and would squash a circle into an
 * ellipse; these stay round at every aspect ratio.
 */
function routeSpaces(points: Point[], axis: "y" | "x"): Point[] {
  const out: Point[] = [];
  for (let i = 1; i < points.length; i += 1) {
    const [c1, c2] = controls(points[i - 1], points[i], axis);
    for (const t of [0.25, 0.5, 0.75]) {
      out.push(bezierAt(points[i - 1], c1, c2, points[i], t));
    }
  }
  return out;
}

/** Positions a board element on both layouts at once. */
function stopStyle(narrow: Point, wide: Point): React.CSSProperties {
  return {
    "--bx": narrow.x,
    "--by": narrow.y,
    "--bx-md": wide.x,
    "--by-md": wide.y,
  } as React.CSSProperties;
}

export function CityBoard({
  districts,
  currentDistrictId,
  /** District holding the activity the player should play next, if any. */
  nextDistrictId,
  onOpenDistrict,
}: {
  districts: ResolvedDistrict[];
  currentDistrictId: DistrictId;
  nextDistrictId?: DistrictId;
  onOpenDistrict: (district: ResolvedDistrict) => void;
}) {
  const narrow = narrowLayout(districts.length);
  const wide = wideLayout(districts.length);
  const current =
    districts.find((d) => d.id === currentDistrictId) ?? districts[0];
  const currentIndex = Math.max(
    0,
    districts.findIndex((d) => d.id === current.id),
  );

  const spacesNarrow = routeSpaces(narrow, "y");
  const spacesWide = routeSpaces(wide, "x");

  return (
    <section
      aria-labelledby="city-board"
      className="board-ground relative flex min-h-[340px] flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-3.5 pb-1 pt-2.5">
        <h2
          id="city-board"
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400"
        >
          ShieldQuest City
        </h2>
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-navy-100">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
          <span className="truncate">You are in {current.name}</span>
        </p>
      </div>

      {/* The route surface. Every position below is a percentage of this box. */}
      <div className="relative flex-1">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={routePath(narrow, "y")}
            className="md:hidden"
            fill="none"
            stroke="rgba(242,174,51,0.30)"
            strokeWidth={10}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={routePath(wide, "x")}
            className="hidden md:block"
            fill="none"
            stroke="rgba(242,174,51,0.30)"
            strokeWidth={10}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Spaces along the route. Decoration — the stops carry the meaning. */}
        {spacesNarrow.map((p, i) => (
          <span
            key={`space-${i}`}
            aria-hidden="true"
            style={stopStyle(p, spacesWide[i] ?? p)}
            className="board-stop h-1.5 w-1.5 rounded-full bg-amber-400/45"
          />
        ))}

        <ol className="absolute inset-0">
          {districts.map((district, i) => (
            <li
              key={district.id}
              style={stopStyle(narrow[i], wide[i])}
              className="board-stop z-20"
            >
              <BoardStop
                district={district}
                stopNumber={i + 1}
                isCurrent={district.id === currentDistrictId}
                isNext={district.id === nextDistrictId}
                onOpen={() => onOpenDistrict(district)}
              />
            </li>
          ))}
        </ol>

        <div
          style={stopStyle(narrow[currentIndex], wide[currentIndex])}
          className="board-stop board-token pointer-events-none z-30"
        >
          <span className="animate-arrive block -translate-y-[42px]">
            <span className="flex items-center gap-1 rounded-full border-2 border-amber-400 bg-navy-950 px-2 py-[3px] shadow-[0_6px_16px_-6px_rgba(6,21,39,0.95)]">
              <ArtSlot
                src={PLAYER_TOKEN_ART}
                className="h-3 w-3 shrink-0 object-contain"
              >
                <ShieldHalf
                  className="h-3 w-3 shrink-0 text-amber-400"
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
              </ArtSlot>
              <span className="whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.14em] text-white">
                You
              </span>
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

/** Segmented district progress. Readable without colour. */
function StopPips({
  completed,
  total,
  fill,
}: {
  completed: number;
  total: number;
  fill: string;
}) {
  return (
    <span className="flex items-center justify-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-[5px] w-3.5 rounded-full ${
            i < completed ? fill : "bg-white/22"
          }`}
        />
      ))}
    </span>
  );
}

/**
 * One stop on the city route.
 *
 * Tapping opens the district's stops in a sheet rather than navigating away, so
 * the board stays on screen and choosing where to go keeps the rhythm of a
 * board rather than of a website. The sheet still offers the full district
 * route, which is where a longer read belongs.
 */
function BoardStop({
  district,
  stopNumber,
  isCurrent,
  isNext,
  onOpen,
}: {
  district: ResolvedDistrict;
  stopNumber: number;
  isCurrent: boolean;
  isNext: boolean;
  onOpen: () => void;
}) {
  const skin = DISTRICT_SKIN[district.id];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={isCurrent ? "location" : undefined}
      className="group flex w-[116px] flex-col items-center gap-1 rounded-2xl p-1 text-center transition hover:-translate-y-0.5 md:w-[132px]"
    >
      <span className="relative">
        {isNext && (
          <span className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-md bg-amber-400 px-1.5 py-[1px] text-[9px] font-extrabold uppercase tracking-[0.14em] text-navy-900">
            Next
          </span>
        )}
        <DistrictPlate
          districtId={district.id}
          className={`h-[46px] w-[46px] rounded-2xl border-2 border-navy-950/25 shadow-[0_8px_18px_-8px_rgba(6,21,39,0.95)] transition group-hover:scale-105 md:h-[52px] md:w-[52px] ${
            isNext ? "animate-node-pulse" : ""
          } ${isCurrent ? "ring-2 ring-white/70 ring-offset-2 ring-offset-navy-950" : ""}`}
          iconClassName="h-5 w-5 md:h-6 md:w-6"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -left-1.5 grid h-5 w-5 place-items-center rounded-full border border-white/25 bg-navy-950 text-[10px] font-extrabold tabular-nums text-amber-400"
        >
          {stopNumber}
        </span>
        {district.cleared && (
          <span
            aria-hidden="true"
            className="animate-stamp absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border border-navy-950 bg-leaf-600 text-white"
          >
            <Check className="h-3 w-3" strokeWidth={3.5} />
          </span>
        )}
      </span>

      <span className="mt-0.5 block w-full truncate text-[11px] font-extrabold uppercase tracking-wide text-white md:text-[12px]">
        {district.name}
      </span>
      <StopPips
        completed={district.completed}
        total={district.total}
        fill={skin.fill}
      />
      <span className="sr-only">
        Stop {stopNumber}. {district.completed} of {district.total} activities
        completed.
        {district.cleared ? " District cleared." : ""}
        {isCurrent ? " You are here." : ""}
        {isNext ? " Your next activity is here." : ""}
      </span>
    </button>
  );
}
