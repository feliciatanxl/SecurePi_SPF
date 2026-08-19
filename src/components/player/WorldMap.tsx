"use client";

import { MapPin, ShieldHalf } from "lucide-react";
import {
  CITY_HUB_ICON,
  DISTRICT_SKIN,
  DistrictCard,
} from "@/components/player/DistrictCard";
import type { ResolvedDistrict } from "@/lib/hooks/useWorld";
import type { DistrictId } from "@/lib/types";

/** Where the hub sits on the board, in board percentage units. */
const HUB = { x: 50, y: 49 };

/**
 * ShieldQuest City.
 *
 * An original illustrated district board, built entirely from CSS, SVG and the
 * existing design tokens — no map SDK, no game engine, no bitmap artwork.
 *
 * Two layouts, one board:
 *
 *  • Narrow (phones): a vertical illustrated route. Districts stack along a
 *    single road, so nothing is ever off-screen and the page never scrolls
 *    sideways.
 *  • Wide (tablet, laptop, projector): the same four districts spread into a
 *    city-board layout around a central hub, connected by visible roads.
 *
 * The two layouts render the same data and the same components; only the
 * arrangement changes, so there is no second implementation to keep in sync.
 */
export function WorldMap({
  districts,
  currentDistrictId,
}: {
  districts: ResolvedDistrict[];
  currentDistrictId: DistrictId;
}) {
  const peerShieldCount = (d: ResolvedDistrict) =>
    d.nodes.filter((n) => n.kind === "PEER_SHIELD").length;

  const current =
    districts.find((d) => d.id === currentDistrictId) ?? districts[0];

  return (
    <section aria-labelledby="city-board" className="px-4 pb-2 pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="city-board"
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400"
        >
          ShieldQuest City
        </h2>
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-navy-100">
          <MapPin className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          You are in {current.name}
        </p>
      </div>

      {/* ---------------- Narrow: vertical illustrated route ---------------- */}
      <div className="city-ground relative overflow-hidden rounded-3xl border border-white/10 p-4 md:hidden">
        <ol className="relative space-y-3.5 pl-9">
          {/* The road every district hangs off. */}
          <span
            aria-hidden="true"
            className="city-route absolute bottom-3 left-[13px] top-3 w-[3px] rounded-full"
          />

          {districts.map((district) => {
            const skin = DISTRICT_SKIN[district.id];
            const isCurrent = district.id === currentDistrictId;
            return (
              <li key={district.id} className="relative">
                {/* Route marker. The player token sits on the current one. */}
                <span
                  aria-hidden="true"
                  className={`absolute -left-9 top-6 grid h-[26px] w-[26px] place-items-center rounded-full border-2 border-navy-900 ${
                    district.completed > 0 ? skin.fill : "bg-navy-700"
                  }`}
                >
                  {isCurrent ? (
                    <ShieldHalf
                      className="h-3.5 w-3.5 text-white"
                      strokeWidth={2.6}
                    />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  )}
                </span>
                <DistrictCard
                  district={district}
                  isCurrent={isCurrent}
                  peerShieldCount={peerShieldCount(district)}
                />
              </li>
            );
          })}
        </ol>
      </div>

      {/* ---------------- Wide: spread city-board layout ---------------- */}
      <div className="city-ground relative hidden min-h-[540px] overflow-hidden rounded-3xl border border-white/10 md:block">
        {/* Roads. Drawn behind everything, stroke width kept constant. */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {districts.map((d) => (
            <line
              key={d.id}
              x1={HUB.x}
              y1={HUB.y}
              x2={d.position.x}
              y2={d.position.y}
              stroke="rgba(242,174,51,0.35)"
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Central hub — the framing device, not a playable node. */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
        >
          <p className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/15 bg-navy-950/70 px-4 py-3 text-center backdrop-blur">
            <CITY_HUB_ICON
              className="h-5 w-5 text-amber-400"
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
              Shield Central
            </span>
            <span className="text-[11px] font-semibold text-navy-100">
              Choose a district
            </span>
          </p>
        </div>

        {districts.map((district) => (
          <div
            key={district.id}
            className="absolute z-20 w-[42%] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${district.position.x}%`,
              top: `${district.position.y}%`,
            }}
          >
            <DistrictCard
              district={district}
              isCurrent={district.id === currentDistrictId}
              peerShieldCount={peerShieldCount(district)}
            />
          </div>
        ))}

        <PlayerToken district={current} />
      </div>
    </section>
  );
}

/**
 * The player's marker.
 *
 * A ShieldQuest shield on the road into the district the player last visited —
 * deliberately a wayfinding marker rather than a game piece, and positioned on
 * the connecting road so it never covers a district's content.
 */
function PlayerToken({ district }: { district: ResolvedDistrict }) {
  // Sit two-thirds of the way along the road from the hub to the district.
  const x = HUB.x + (district.position.x - HUB.x) * 0.58;
  const y = HUB.y + (district.position.y - HUB.y) * 0.58;

  return (
    <div
      // Keyed on the district so re-entering a district replays the arrival.
      key={district.id}
      className="animate-arrive absolute z-30"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <p className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border-2 border-amber-400 bg-navy-900 px-2.5 py-1 shadow-[0_6px_18px_-6px_rgba(6,21,39,0.95)]">
        <ShieldHalf
          className="h-3.5 w-3.5 shrink-0 text-amber-400"
          strokeWidth={2.6}
          aria-hidden="true"
        />
        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] text-white">
          You are here
        </span>
      </p>
    </div>
  );
}
