import {
  Gamepad2,
  MessageSquareWarning,
  ShieldHalf,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ArtSlot } from "@/components/ui/ArtSlot";
import { MINI_GAME_BADGE_ART, NODE_KIND_ART } from "@/lib/brand/assets";
import type { NodeKind } from "@/lib/types";

/**
 * The mark for each kind of mission stop. Shared by the district route, the
 * district sheet and anywhere else a stop is listed, so a stop looks the same
 * wherever it appears.
 */
export const KIND_ICON: Record<NodeKind, LucideIcon> = {
  SCENARIO: MessageSquareWarning,
  MINI_GAME: Gamepad2,
  PEER_SHIELD: ShieldHalf,
  GUARDIAN_CHALLENGE: Sparkles,
};

/**
 * Peer Shield is styled distinctly from every other node type, on the board and
 * everywhere else. It is a signature mode, not one mini-game among several, and
 * a youth should be able to pick it out of the route at a glance.
 */
export const KIND_CHIP: Record<NodeKind, string> = {
  SCENARIO: "border-civic-200 bg-civic-50 text-civic-700",
  MINI_GAME: "border-amber-200 bg-amber-50 text-amber-700",
  PEER_SHIELD: "border-teal-200 bg-teal-50 text-teal-700",
  GUARDIAN_CHALLENGE: "border-leaf-200 bg-leaf-50 text-leaf-700",
};

/** Mission-type mark: registered artwork if there is any, the icon until then. */
export function MissionKindMark({
  kind,
  className = "h-4 w-4",
}: {
  kind: NodeKind;
  className?: string;
}) {
  const Icon = KIND_ICON[kind];
  return (
    <ArtSlot src={NODE_KIND_ART[kind]} className={className}>
      <Icon className={className} />
    </ArtSlot>
  );
}

/** Mini-game badge, keyed by mini-game id. Falls back to the mini-game mark. */
export function MiniGameBadge({
  gameId,
  className = "h-5 w-5",
}: {
  gameId: string;
  className?: string;
}) {
  return (
    <ArtSlot src={MINI_GAME_BADGE_ART[gameId] ?? null} className={className}>
      <Gamepad2 className={className} />
    </ArtSlot>
  );
}
