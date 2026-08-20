import {
  GUARDIAN_BEACON,
  GUARDIAN_SHIELDFIN,
  GUARDIAN_VERIFOX,
} from "@/lib/api/mock-data";
import type { DistrictId, NodeKind } from "@/lib/types";

/**
 * Art slots.
 *
 * Every illustrated element in the player app resolves its artwork through this
 * one registry. Nothing here ships artwork: each slot is `null` until a file is
 * dropped into `public/assets/` and named below, at which point the matching
 * component swaps its CSS/icon placeholder for the image — same box, same
 * position, no layout change and no component edit.
 *
 * That is deliberate. The illustrated ShieldQuest set (Guardians, districts,
 * the player token, mission-type marks) is being drawn in Figma, and none of
 * the layouts here are built around the placeholders they currently use.
 *
 * Conventions for the files themselves are in `public/assets/README.md`.
 */

/** A path under `public/`, or null while the slot is still a placeholder. */
export type ArtSlotSource = string | null;

/** Square Guardian portraits. Rendered inside a rounded plate. */
export const GUARDIAN_ART: Record<string, ArtSlotSource> = {
  [GUARDIAN_VERIFOX]: null, // "/assets/guardians/verifox.svg"
  [GUARDIAN_BEACON]: null, // "/assets/guardians/beacon.svg"
  [GUARDIAN_SHIELDFIN]: null, // "/assets/guardians/shieldfin.svg"
};

/** Square district marks, shown on board stops and district headers. */
export const DISTRICT_ART: Record<DistrictId, ArtSlotSource> = {
  school: null, // "/assets/districts/school-street.svg"
  retail: null, // "/assets/districts/retail-district.svg"
  digi: null, // "/assets/districts/digi-district.svg"
  community: null, // "/assets/districts/community-hub.svg"
};

/** The marker that travels the city route. */
export const PLAYER_TOKEN_ART: ArtSlotSource = null; // "/assets/player-token.svg"

/** Mission-type marks used on route stops and in the district sheet. */
export const NODE_KIND_ART: Record<NodeKind, ArtSlotSource> = {
  SCENARIO: null, // "/assets/mission-types/scenario.svg"
  MINI_GAME: null, // "/assets/mission-types/mini-game.svg"
  PEER_SHIELD: null, // "/assets/mission-types/peer-shield.svg"
  GUARDIAN_CHALLENGE: null, // "/assets/mission-types/guardian-challenge.svg"
};

/** Mini-game badges, keyed by the mini-game id from `minigame-data.ts`. */
export const MINI_GAME_BADGE_ART: Record<string, ArtSlotSource> = {
  "spot-the-warning-signs": null, // "/assets/mini-games/spot-the-warning-signs.svg"
  "decode-the-clue": null, // "/assets/mini-games/decode-the-clue.svg"
};
