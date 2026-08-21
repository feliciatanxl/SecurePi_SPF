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
 * one registry. A slot holds a path under `public/` once the file exists, and
 * `null` while it is still a placeholder — at which point the matching component
 * renders its CSS/icon placeholder instead. Both render into the same box, so a
 * slot can be filled or emptied without touching a layout.
 *
 * The illustrated ShieldQuest set arrives in waves. The V2.2 wave supplied the
 * three Guardian portraits, the four district scenes, the player token and the
 * board node marks; the mission-type marks, mini-game badges and the Guardian
 * pose variants are not drawn yet and stay null below rather than being faked
 * with substitute artwork.
 *
 * Conventions for the files themselves are in `public/assets/README.md`.
 */

/** A path under `public/`, or null while the slot is still a placeholder. */
export type ArtSlotSource = string | null;

const SHIELDQUEST = "/assets/shieldquest";

/**
 * Square Guardian portraits. Rendered inside a rounded plate, from the 28px
 * selector tile up to the 44px plate on a Guardian card.
 *
 * V2.2 supplies one neutral pose each. The success/action poses the debrief and
 * reward surfaces would use are not drawn yet, so those surfaces keep showing
 * the neutral portrait rather than a stand-in.
 */
export const GUARDIAN_ART: Record<string, ArtSlotSource> = {
  [GUARDIAN_VERIFOX]: `${SHIELDQUEST}/guardians/verifox-neutral.svg`,
  [GUARDIAN_BEACON]: `${SHIELDQUEST}/guardians/beacon-neutral.svg`,
  [GUARDIAN_SHIELDFIN]: `${SHIELDQUEST}/guardians/shieldfin-neutral.svg`,
};

/**
 * Square district marks, shown on board stops and district headers.
 *
 * Still null, deliberately. V2.2 drew the districts as wide 800×300 scenes, not
 * as square marks — see `DISTRICT_SCENE_ART` below. Cropping a scene to the
 * 46px board stop leaves an unreadable fragment of one building, so the small
 * plates keep their lucide mark on the district's palette plate, which is what
 * actually distinguishes four stops at that size. This slot stays open for the
 * square district icons when they are drawn.
 */
export const DISTRICT_ART: Record<DistrictId, ArtSlotSource> = {
  school: null,
  retail: null,
  digi: null,
  community: null,
};

/**
 * Wide district scenes (≈800×300). Used only where there is enough horizontal
 * room to read one — the district sheet header and the district route band —
 * and never squeezed into a square plate.
 */
export const DISTRICT_SCENE_ART: Record<DistrictId, ArtSlotSource> = {
  school: `${SHIELDQUEST}/districts/school-street.svg`,
  retail: `${SHIELDQUEST}/districts/retail-district.svg`,
  digi: `${SHIELDQUEST}/districts/digi-district.svg`,
  community: `${SHIELDQUEST}/districts/community-hub.svg`,
};

/**
 * The V2.2 board marker — a single blue disc.
 *
 * Registered but no longer rendered. The player chooses one of four Explorers
 * during onboarding, and the marker has to be the one they chose: a fixed disc
 * made that choice invisible the moment the game started. `PlayerAvatarMark`
 * draws the four instead, so the marker varies by colour *and* crest and stays
 * legible at 24px. Kept for the wider board treatments it was drawn for.
 */
export const PLAYER_TOKEN_ART: ArtSlotSource = `${SHIELDQUEST}/board/player-token.svg`;

/**
 * Board node marks from the V2.2 set.
 *
 * Registered so they are one line from use, but not currently rendered. Node
 * status in this app is carried by a rounded plate in the district/status
 * palette plus a lucide mark *and* a text label, and it has to stay legible at
 * 12–36px, in greyscale and on a projector. These marks are circular discs in
 * their own palette (teal, rose, slate), so swapping them in would replace a
 * state that reads three ways with one that reads by colour alone. Kept for the
 * larger board treatments they were drawn for.
 */
export const BOARD_NODE_ART = {
  current: `${SHIELDQUEST}/board/node-current.svg`,
  completed: `${SHIELDQUEST}/board/node-completed.svg`,
  locked: `${SHIELDQUEST}/board/node-locked.svg`,
  miniGame: `${SHIELDQUEST}/board/node-minigame.svg`,
  checkpoint: `${SHIELDQUEST}/board/checkpoint.svg`,
} satisfies Record<string, ArtSlotSource>;

/**
 * The ShieldQuest mark, as exported in the V2.2 brand set.
 *
 * The tab icon, the maskable icon and the iOS touch icon are *not* driven from
 * here — they are `public/icon.svg`, `public/icon-maskable.svg` and
 * `src/app/apple-icon.tsx`, and they still carry the shipped navy/amber mark.
 * See `public/assets/README.md` for why the V2.2 export is not a drop-in
 * replacement for them.
 */
export const BRAND_MARK_ART = {
  icon: `${SHIELDQUEST}/brand/shieldquest-icon.svg`,
  icon512: `${SHIELDQUEST}/brand/shieldquest-icon-512.svg`,
} satisfies Record<string, ArtSlotSource>;

/** Mission-type marks used on route stops and in the district sheet. */
export const NODE_KIND_ART: Record<NodeKind, ArtSlotSource> = {
  SCENARIO: null, // not in the V2.2 export
  MINI_GAME: null, // not in the V2.2 export
  PEER_SHIELD: null, // not in the V2.2 export
  GUARDIAN_CHALLENGE: null, // not in the V2.2 export
};

/** Mini-game badges, keyed by the mini-game id from `minigame-data.ts`. */
export const MINI_GAME_BADGE_ART: Record<string, ArtSlotSource> = {
  "spot-the-warning-signs": null, // not in the V2.2 export
  "decode-the-clue": null, // not in the V2.2 export
};
