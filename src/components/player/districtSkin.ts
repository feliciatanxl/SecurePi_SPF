import {
  GraduationCap,
  ShieldHalf,
  Smartphone,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { DistrictId } from "@/lib/types";

/**
 * Each district gets its own identity inside one coherent city palette — the
 * tokens are all from the existing ShieldQuest design system, so four visually
 * distinct districts still read as the same place. Nothing here references any
 * existing commercial board game's artwork, names or visual identity.
 */
export interface DistrictSkin {
  icon: LucideIcon;
  /** Tile surface on a light background. */
  tile: string;
  /** Accent for the icon plate and headings. */
  plate: string;
  /** Board stop marker and progress fill. */
  fill: string;
  /** Light-surface accents used on district headers and sheets. */
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
