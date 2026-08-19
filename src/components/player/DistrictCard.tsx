import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  ShieldHalf,
  Smartphone,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { ResolvedDistrict } from "@/lib/hooks/useWorld";
import type { DistrictId } from "@/lib/types";

/**
 * Each district gets its own identity inside one coherent city palette — the
 * tokens are all from the existing ShieldQuest design system, so four visually
 * distinct districts still read as the same place. Nothing here references any
 * existing commercial board game's artwork, names or visual identity.
 */
export interface DistrictSkin {
  icon: LucideIcon;
  /** Tile surface on the dark board. */
  tile: string;
  /** Accent for the icon plate and headings. */
  plate: string;
  /** Route marker and progress fill. */
  fill: string;
  /** Light-surface accents used on the district page header. */
  header: string;
  ring: string;
}

export const DISTRICT_SKIN: Record<DistrictId, DistrictSkin> = {
  school: {
    icon: GraduationCap,
    tile: "bg-amber-50 border-amber-200",
    plate: "bg-amber-500 text-navy-900",
    fill: "bg-amber-500",
    header: "bg-amber-50 border-amber-200",
    ring: "ring-amber-500",
  },
  retail: {
    icon: Store,
    tile: "bg-coral-50 border-coral-200",
    plate: "bg-coral-600 text-white",
    fill: "bg-coral-600",
    header: "bg-coral-50 border-coral-200",
    ring: "ring-coral-600",
  },
  digi: {
    icon: Smartphone,
    tile: "bg-civic-50 border-civic-200",
    plate: "bg-civic-600 text-white",
    fill: "bg-civic-600",
    header: "bg-civic-50 border-civic-200",
    ring: "ring-civic-600",
  },
  community: {
    icon: ShieldHalf,
    tile: "bg-teal-50 border-teal-200",
    plate: "bg-teal-600 text-white",
    fill: "bg-teal-600",
    header: "bg-teal-50 border-teal-200",
    ring: "ring-teal-600",
  },
};

export const CITY_HUB_ICON = Building2;

/** Segmented district progress. Readable without colour. */
function NodePips({
  completed,
  total,
  fill,
}: {
  completed: number;
  total: number;
  fill: string;
}) {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-4 rounded-full ${i < completed ? fill : "bg-navy-900/15"}`}
        />
      ))}
    </span>
  );
}

/**
 * A district tile on the city board.
 *
 * Tapping it travels into the district route rather than expanding in place —
 * the change of surface is what gives the board its sense of movement without
 * any pathfinding animation.
 */
export function DistrictCard({
  district,
  isCurrent,
  peerShieldCount,
}: {
  district: ResolvedDistrict;
  /** The player's marker is standing here. */
  isCurrent: boolean;
  peerShieldCount: number;
}) {
  const skin = DISTRICT_SKIN[district.id];
  const Icon = skin.icon;

  return (
    <Link
      href={`/district/${district.id}`}
      aria-current={isCurrent ? "location" : undefined}
      className={`group relative flex min-h-[132px] flex-col rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(6,21,39,0.9)] ${skin.tile} ${
        isCurrent ? `ring-2 ring-offset-2 ring-offset-navy-900 ${skin.ring}` : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${skin.plate}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-extrabold uppercase leading-tight tracking-wide text-navy-900">
            {district.name}
          </h3>
          <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-ink-muted">
            {district.completed} / {district.total} activities
          </p>
        </div>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-navy-900/40 transition group-hover:translate-x-0.5 group-hover:text-navy-900"
          aria-hidden="true"
        />
      </div>

      <p className="mt-2 flex-1 text-[12px] leading-relaxed text-ink-muted">
        {district.tagline}
      </p>

      <div className="mt-2.5 space-y-2">
        {peerShieldCount > 0 && (
          <p className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-surface px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
            <ShieldHalf className="h-2.5 w-2.5" aria-hidden="true" />
            Peer Shield
          </p>
        )}
        <NodePips
          completed={district.completed}
          total={district.total}
          fill={skin.fill}
        />
      </div>

      {isCurrent && (
        <span className="sr-only">You are here</span>
      )}
    </Link>
  );
}
