import {
  Award,
  Check,
  Shield as ShieldMark,
  Gamepad2,
  Landmark,
  Lock,
  MessageSquareWarning,
  ScrollText,
  Shield,
  ShieldHalf,
  type LucideIcon,
} from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import type { ResolvedSpace } from "@/lib/hooks/useBoard";
import type { BoardSpaceKind, Guardian } from "@/lib/types";

/**
 * The mark for one space on the city track.
 *
 * Space type is carried by **shape and icon**, state by an overlay and a text
 * label in the accessible name. Colour is the last of the three, never the
 * only one — the board has to survive a projector, greyscale and a screen
 * reader, and a board where the difference between "mini-game" and "completed"
 * is a hue fails all three.
 */

export const SPACE_ICON: Record<BoardSpaceKind, LucideIcon> = {
  SHIELD_CENTRAL: Shield,
  DISTRICT_CHECKPOINT: Landmark,
  SCENARIO: MessageSquareWarning,
  PEER_SHIELD: ShieldHalf,
  MINI_GAME: Gamepad2,
  SITUATION_CARD: ScrollText,
  GUARDIAN_CHECKPOINT: Shield,
  REWARD_CHECKPOINT: Award,
};

/** Shape + surface per space type. The radius is doing as much work as the hue. */
const SPACE_SKIN: Record<BoardSpaceKind, string> = {
  SHIELD_CENTRAL: "rounded-2xl bg-navy-800 text-amber-400 border-amber-400/70",
  DISTRICT_CHECKPOINT: "rounded-2xl bg-navy-700 text-white border-white/45",
  SCENARIO: "rounded-lg bg-civic-600 text-white border-civic-200/70",
  PEER_SHIELD: "rounded-full bg-teal-600 text-white border-teal-200/80",
  MINI_GAME: "rounded-[10px] bg-amber-500 text-navy-900 border-amber-200/80",
  SITUATION_CARD: "rounded-md bg-coral-600 text-white border-coral-200/80",
  GUARDIAN_CHECKPOINT: "rounded-full bg-navy-900 text-white border-amber-400/70",
  REWARD_CHECKPOINT: "rounded-[14px] bg-leaf-600 text-white border-leaf-200/80",
};

export function SpaceMark({
  space,
  guardian,
  /** Highlighted while the token is stepping across this space. */
  stepping,
  /** An equipped City Style marker. Changes the completed mark, nothing else. */
  markerCosmetic = false,
  relation = "ahead",
}: {
  space: ResolvedSpace;
  guardian?: Guardian;
  stepping?: boolean;
  markerCosmetic?: boolean;
  /** Exploration state relative to the player's current position. */
  relation?: "behind" | "current" | "ahead";
}) {
  const Icon = SPACE_ICON[space.kind];
  const dim = space.planned || space.locked;

  return (
    <span className="relative block">
      <span
        aria-hidden="true"
        className={`grid h-[42px] w-[42px] place-items-center border-2 shadow-[0_5px_12px_-6px_rgba(6,21,39,0.95)] transition ${
          SPACE_SKIN[space.kind]
        } ${dim ? "opacity-45 saturate-50" : ""} ${
          stepping ? "scale-110 ring-4 ring-amber-300/60" : ""
        } ${
          space.isCurrent
            ? "animate-node-pulse scale-110 ring-2 ring-white ring-offset-2 ring-offset-navy-950"
            : ""
        } ${relation === "ahead" && !space.isCurrent && !dim ? "opacity-75" : ""} ${
          relation === "behind" && !space.completed ? "brightness-90" : ""
        }`}
      >
        {space.kind === "GUARDIAN_CHECKPOINT" && guardian ? (
          <GuardianPlate
            guardian={guardian}
            className="h-[34px] w-[34px] rounded-full text-[13px]"
            tone="amber"
          />
        ) : (
          <Icon className="h-[19px] w-[19px]" strokeWidth={2.3} />
        )}
      </span>

      {/* State overlay. Always a shape, never a recolour of the mark itself. */}
      {space.completed && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 grid h-[19px] w-[19px] place-items-center rounded-full border-2 border-navy-950 bg-leaf-600 text-white"
        >
          {markerCosmetic ? (
            <ShieldMark className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            <Check className="h-2.5 w-2.5" strokeWidth={4} />
          )}
        </span>
      )}
      {dim && !space.completed && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 grid h-[19px] w-[19px] place-items-center rounded-full border-2 border-navy-950 bg-navy-800 text-navy-100"
        >
          <Lock className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      )}
      <span
        aria-hidden="true"
        className={`absolute -bottom-3 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full ${
          relation === "behind"
            ? "bg-leaf-200/80"
            : relation === "current"
              ? "bg-amber-400"
              : "bg-white/30"
        }`}
      />
    </span>
  );
}

/** The state sentence read to assistive technology, and shown in the legend. */
export function spaceStateLabel(space: ResolvedSpace): string {
  if (space.completed) return "Completed";
  if (space.planned) return "Coming soon";
  if (space.locked) return "Locked";
  if (space.visited) return "Visited";
  return "Not visited yet";
}
