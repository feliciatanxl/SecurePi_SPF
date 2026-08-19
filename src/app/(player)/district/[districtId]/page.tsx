"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import { DISTRICT_SKIN } from "@/components/player/DistrictCard";
import { MissionNodeCard } from "@/components/player/MissionNode";
import { useDistrict } from "@/lib/hooks/useWorld";
import { usePlayer } from "@/lib/state/PlayerProvider";

/**
 * A district route — the middle layer of the board:
 *
 *   district → mission node → activity → learning outcome → progress
 *
 * Nodes are laid out as an ordered route so progression is legible, but the
 * player is not marched down it: everything marked open can be started in any
 * order, and locked nodes state exactly what opens them.
 */
export default function DistrictPage() {
  const params = useParams<{ districtId: string }>();
  const districtId = params.districtId;
  const district = useDistrict(districtId);
  const { guardians, travelTo } = usePlayer();

  // Arriving moves the player's marker, so the board reflects where they went.
  // `travelTo` is a no-op when the marker is already here, so this settles.
  const arrivedAt = district?.id;
  useEffect(() => {
    if (arrivedAt) travelTo(arrivedAt);
  }, [arrivedAt, travelTo]);

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
          href="/"
          className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-navy-900 px-5 text-[15px] font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the city
        </Link>
      </div>
    );
  }

  const skin = DISTRICT_SKIN[district.id];
  const Icon = skin.icon;
  const guardianName = (id?: string) =>
    id ? guardians.find((g) => g.id === id)?.name : undefined;

  return (
    <div className="animate-travel pb-8">
      {/* District header */}
      <header className="bg-navy-900 px-4 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <Link
          href="/"
          className="-ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          ShieldQuest City
        </Link>

        <div className="mt-2 flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${skin.plate}`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              District
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold uppercase leading-tight tracking-tight">
              {district.name}
            </h1>
          </div>
        </div>

        <p className="mt-3 text-[14px] leading-relaxed text-navy-100">
          {district.tagline}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {district.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-semibold text-white"
            >
              {topic}
            </li>
          ))}
        </ul>

        <p className="mt-4 flex items-center gap-2 border-t border-white/12 pt-3.5 text-[13px] font-semibold">
          <span className="tabular-nums text-amber-400">
            {district.completed} / {district.total}
          </span>
          <span className="text-navy-100">activities completed here</span>
          {district.cleared && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-leaf-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              District cleared
            </span>
          )}
        </p>
      </header>

      {/* The route */}
      <div className={`border-b px-4 py-3 ${skin.header}`}>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy-900">
          District route
        </h2>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
          Choose any open stop. Nothing here is decided by chance.
        </p>
      </div>

      <ol className="relative space-y-3 px-4 py-4 pl-11">
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
          href="/"
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to ShieldQuest City
        </Link>
      </div>
    </div>
  );
}
