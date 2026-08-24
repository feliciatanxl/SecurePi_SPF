import {
  GUARDIAN_BEACON,
  GUARDIAN_BYTEBUDDY,
  GUARDIAN_CLUEPAW,
  GUARDIAN_ECHO,
  GUARDIAN_SHIELDFIN,
  GUARDIAN_VERIFOX,
  MULE_ENCOUNTER,
} from "@/lib/api/mock-data";
import {
  ALL_NODES,
  DISTRICTS,
  NODE_COMMUNITY_WHAT_NEXT,
  NODE_COMMUNITY_WHO_CAN_HELP,
  NODE_DECODE,
  NODE_DIGI_FINALE,
  NODE_EASY_MONEY,
  NODE_PEER_JAYDEN,
  NODE_RETAIL_CLUE_MATCH,
  NODE_RETAIL_COVER_FOR_ME,
  NODE_RETAIL_DARE,
  NODE_SCHOOL_FRIEND_PRESSURE,
  NODE_SCHOOL_HOLD_IT,
  NODE_SCHOOL_RISK_OR_SAFE,
  NODE_WORD_SEARCH,
} from "@/lib/api/world-data";
import type {
  BoardSpace,
  DistrictBadge,
  DistrictId,
  SituationCard,
} from "@/lib/types";

/**
 * ShieldQuest City Board — the roll-and-move track.
 *
 * An original board built from this app's own content. It borrows one thing
 * from tabletop games — the turn rhythm of roll, move, land, play — and nothing
 * else. There is no property, no ownership, no rent, no money to win off other
 * players, no chance/community pile, no jail, no free parking, no railways or
 * utilities, and no board layout, colour banding or trade dress taken from any
 * existing commercial game.
 *
 * ## The dice decides one thing
 *
 * Movement. Nothing else. A roll cannot make a decision safe, cannot pay a
 * Shield Token, cannot level a Guardian and cannot mark anyone a winner. It
 * chooses which situation the player meets next; what they learn from it is
 * decided entirely by the choice they make once they are inside it.
 *
 * ## Why the mix of spaces looks the way it does
 *
 * Nine of the fifteen city activities are built and playable in this prototype,
 * and all four districts now carry at least one — but the six that are not built
 * are still on the track. A district also carries spaces that always have
 * something to say whether or not the player has reached its built content: a
 * district checkpoint, a Guardian checkpoint reporting real learning progress,
 * or a reward checkpoint. Unbuilt activities stay listed and stay labelled
 * "coming soon" rather than being hidden, because pretending they are earnable
 * would be worse than admitting they are not built.
 *
 * The nine playable activities are the single source of the progress figures
 * the player sees; nothing here hard-codes the count. `useWorld` derives it by
 * excluding `PLANNED` nodes, so the board and the Progress screen cannot drift.
 */

/* ------------------------------------------------------------------ */
/* Situation Cards                                                     */
/* ------------------------------------------------------------------ */

export const CARD_EASY_MONEY = "sc_easy_money";
export const CARD_URGENT_MESSAGE = "sc_urgent_message";
export const CARD_FRIEND_NEEDS_HELP = "sc_friend_needs_help";
export const CARD_WHO_CAN_HELP = "sc_who_can_help";

/**
 * Situation Cards.
 *
 * ShieldQuest's own card mechanic. They are **not** a chance draw: a card never
 * pays out, never penalises and never resolves itself. It frames a realistic
 * situation, names the skill and the Guardian it belongs to, and opens the
 * activity that teaches it. Everything the player takes away comes from the
 * decision they make inside that activity.
 *
 * Each card's warning signs and safer response are the real ones from the
 * content it opens, so the Shield Casebook entry a player keeps afterwards is
 * the same material the debrief taught them — not a separate summary that can
 * drift away from it.
 */
export const SITUATION_CARDS: SituationCard[] = [
  {
    id: CARD_EASY_MONEY,
    title: "Easy Money",
    blurb:
      "Someone offers you S$200 to receive and forward money through your account.",
    competency: "SPOT",
    guardianId: GUARDIAN_VERIFOX,
    nodeId: NODE_EASY_MONEY,
    actionLabel: "Face the situation",
    // Lifted from the scenario's own delayed consequence so the Casebook entry
    // and the debrief can never say different things.
    warningSigns: MULE_ENCOUNTER.choices.find((c) => c.delayed)?.delayed
      ?.warningSigns ?? [],
    saferResponse:
      "Do not allow other people to use your bank account to receive or move money. Disengage, and seek help through appropriate official channels where necessary.",
  },
  {
    id: CARD_URGENT_MESSAGE,
    title: "Urgent Message",
    // The card face already renders the blurb in quotation marks, so the text
    // itself carries none — otherwise the message quotes itself twice over.
    blurb:
      "A message says your account will be suspended tonight unless you verify it immediately.",
    competency: "HOLD",
    guardianId: GUARDIAN_ECHO,
    nodeId: NODE_DECODE,
    actionLabel: "Work it out",
    warningSigns: [
      "A deadline attached to a request",
      "Pressure to act before checking",
      "A channel you cannot verify",
    ],
    saferResponse:
      "Urgency is the pressure, not the problem. Stop, and check the claim through a channel you already trust rather than the one that contacted you.",
  },
  {
    id: CARD_FRIEND_NEEDS_HELP,
    title: "Your Friend Needs Help",
    blurb: "Jayden says someone online wants to use his account.",
    competency: "DEFEND",
    guardianId: GUARDIAN_SHIELDFIN,
    nodeId: NODE_PEER_JAYDEN,
    actionLabel: "Help your friend",
    warningSigns: [
      "His account, someone else's money",
      "He has never met the person asking",
      "Several people saw it and nobody said anything",
    ],
    saferResponse:
      "Raise it privately so your friend can step back without losing face, and bring in a trusted adult if it has already gone further than advice can fix.",
  },
  {
    id: CARD_WHO_CAN_HELP,
    title: "Who Can Help?",
    blurb: "You are unsure whether a situation is safe, and unsure who to ask.",
    competency: "LEAD",
    guardianId: GUARDIAN_BEACON,
    nodeId: NODE_COMMUNITY_WHO_CAN_HELP,
    actionLabel: "Find the right help",
    warningSigns: [
      "Not knowing who to ask is itself a reason to ask",
      "Handling it alone keeps the pressure on you",
    ],
    saferResponse:
      "Pause, step out of the situation, and speak to someone you trust or an appropriate school or community support channel.",
  },
];

export function findSituationCard(id: string): SituationCard | undefined {
  return SITUATION_CARDS.find((c) => c.id === id);
}

/* ------------------------------------------------------------------ */
/* The track                                                           */
/* ------------------------------------------------------------------ */

/**
 * 26 spaces on one continuous loop:
 *
 *   Shield Central → School Street → Retail District → Digi-District →
 *   Community Hub → back to Shield Central
 *
 * Districts appear in the order the city route has always used, so the board
 * and the district pages agree about where things are.
 */
export const BOARD_SPACES: BoardSpace[] = (
  [
    {
      kind: "SHIELD_CENTRAL",
      title: "Shield Central",
    },

    /* --- School Street ------------------------------------------------ */
    {
      kind: "DISTRICT_CHECKPOINT",
      districtId: "school",
      title: "School Street",
    },
    {
      kind: "SCENARIO",
      districtId: "school",
      title: "Just Hold It For Me",
      nodeId: NODE_SCHOOL_HOLD_IT,
    },
    {
      kind: "GUARDIAN_CHECKPOINT",
      districtId: "school",
      title: "Shieldfin Checkpoint",
      guardianId: GUARDIAN_SHIELDFIN,
    },
    {
      kind: "MINI_GAME",
      districtId: "school",
      title: "Risk or Safe?",
      nodeId: NODE_SCHOOL_RISK_OR_SAFE,
    },
    {
      kind: "GUARDIAN_CHECKPOINT",
      districtId: "school",
      title: "Echo Checkpoint",
      guardianId: GUARDIAN_ECHO,
    },
    {
      kind: "PEER_SHIELD",
      districtId: "school",
      title: "Friend Under Pressure",
      nodeId: NODE_SCHOOL_FRIEND_PRESSURE,
    },

    /* --- Retail District ---------------------------------------------- */
    {
      kind: "DISTRICT_CHECKPOINT",
      districtId: "retail",
      title: "Retail District",
    },
    {
      kind: "SCENARIO",
      districtId: "retail",
      title: "The Dare at Checkout",
      nodeId: NODE_RETAIL_DARE,
    },
    {
      kind: "REWARD_CHECKPOINT",
      districtId: "retail",
      title: "Rewards Checkpoint",
    },
    {
      kind: "GUARDIAN_CHECKPOINT",
      districtId: "retail",
      title: "Cluepaw Checkpoint",
      guardianId: GUARDIAN_CLUEPAW,
    },
    {
      kind: "MINI_GAME",
      districtId: "retail",
      title: "Clue Match",
      nodeId: NODE_RETAIL_CLUE_MATCH,
    },
    {
      kind: "PEER_SHIELD",
      districtId: "retail",
      title: "Cover For Me",
      nodeId: NODE_RETAIL_COVER_FOR_ME,
    },

    /* --- Digi-District ------------------------------------------------ */
    {
      kind: "DISTRICT_CHECKPOINT",
      districtId: "digi",
      title: "Digi-District",
    },
    {
      kind: "SITUATION_CARD",
      districtId: "digi",
      title: "Easy Money",
      situationCardId: CARD_EASY_MONEY,
      nodeId: NODE_EASY_MONEY,
    },
    {
      kind: "MINI_GAME",
      districtId: "digi",
      title: "Spot the Warning Signs",
      nodeId: NODE_WORD_SEARCH,
    },
    {
      kind: "GUARDIAN_CHECKPOINT",
      districtId: "digi",
      title: "VeriFox Checkpoint",
      guardianId: GUARDIAN_VERIFOX,
    },
    {
      kind: "SITUATION_CARD",
      districtId: "digi",
      title: "Urgent Message",
      situationCardId: CARD_URGENT_MESSAGE,
      nodeId: NODE_DECODE,
    },
    {
      kind: "GROUP_DECISION",
      districtId: "digi",
      title: "The Group Chat Job",
      nodeId: NODE_DIGI_FINALE,
    },

    /* --- Community Hub ------------------------------------------------ */
    {
      kind: "DISTRICT_CHECKPOINT",
      districtId: "community",
      title: "Community Hub",
    },
    {
      kind: "SITUATION_CARD",
      districtId: "community",
      title: "Your Friend Needs Help",
      situationCardId: CARD_FRIEND_NEEDS_HELP,
      nodeId: NODE_PEER_JAYDEN,
    },
    {
      kind: "GUARDIAN_CHECKPOINT",
      districtId: "community",
      title: "Beacon Checkpoint",
      guardianId: GUARDIAN_BEACON,
    },
    {
      kind: "SITUATION_CARD",
      districtId: "community",
      title: "Who Can Help?",
      situationCardId: CARD_WHO_CAN_HELP,
      nodeId: NODE_COMMUNITY_WHO_CAN_HELP,
    },
    {
      kind: "GUARDIAN_CHECKPOINT",
      districtId: "community",
      title: "ByteBuddy Checkpoint",
      guardianId: GUARDIAN_BYTEBUDDY,
    },
    {
      kind: "MINI_GAME",
      districtId: "community",
      title: "What Happens Next?",
      nodeId: NODE_COMMUNITY_WHAT_NEXT,
    },
    {
      kind: "REWARD_CHECKPOINT",
      districtId: "community",
      title: "Rewards Checkpoint",
    },
  ] satisfies Omit<BoardSpace, "index">[]
).map((space, index) => ({ ...space, index }));

export const BOARD_LENGTH = BOARD_SPACES.length;

/** Wraps a position onto the loop, so the last space leads back to the first. */
export function normaliseBoardPosition(position: number): number {
  const n = Number.isFinite(position) ? Math.trunc(position) : 0;
  return ((n % BOARD_LENGTH) + BOARD_LENGTH) % BOARD_LENGTH;
}

/** The spaces a token passes through for a roll, destination last. */
export function stepsForRoll(from: number, roll: number): number[] {
  return Array.from({ length: roll }, (_, i) =>
    normaliseBoardPosition(from + i + 1),
  );
}

/* ------------------------------------------------------------------ */
/* Board identity and the v1 → v2 track migration                      */
/* ------------------------------------------------------------------ */

/**
 * A stable identity for a board space, independent of where it sits.
 *
 * A saved profile stores `boardPosition` and `visitedSpaces` as plain indices,
 * because that is what a position on a track is. The moment the track gains a
 * space, every index after the insertion point means something different — so a
 * restored session would silently move the player to whatever now occupies
 * their old number. That is worse than losing the position: it looks like it
 * worked.
 *
 * The key is derived from what the space *is*, not from where it is:
 *
 *   - an activity space is its `nodeId` (unique across the track, guarded below)
 *   - a district checkpoint is its district
 *   - a Guardian checkpoint is its Guardian
 *   - a reward checkpoint is its district
 *   - Shield Central is a singleton
 *
 * Situation Card spaces key off their `nodeId` like any other activity space:
 * the card is the presentation of the activity behind it, and no two cards open
 * the same activity.
 */
export function boardSpaceKey(space: Omit<BoardSpace, "index">): string {
  if (space.kind === "SHIELD_CENTRAL") return "hub";
  if (space.nodeId) return `node:${space.nodeId}`;
  if (space.kind === "DISTRICT_CHECKPOINT") return `district:${space.districtId}`;
  if (space.kind === "GUARDIAN_CHECKPOINT") return `guardian:${space.guardianId}`;
  return `reward:${space.districtId}`;
}

/** Current track identities, in board order. Index i is `BOARD_SPACES[i]`. */
export const BOARD_SPACE_KEYS: string[] = BOARD_SPACES.map(boardSpaceKey);

const KEY_TO_INDEX = new Map(BOARD_SPACE_KEYS.map((key, index) => [key, index]));

/** Where a stable key sits on the current track, or null if it is gone. */
export function indexForBoardKey(key: string): number | null {
  return KEY_TO_INDEX.get(key) ?? null;
}

/**
 * The 22-space track, as it shipped before the Guardian roster grew to six.
 *
 * Written out as identities rather than reconstructed from anything, because
 * the whole point is that it records a board that no longer exists. It must not
 * be edited to follow the current track — a session saved against the old one
 * is the only thing it describes.
 *
 * The four spaces added since are the Echo, Cluepaw and ByteBuddy checkpoints
 * and the Think · Vote · Explain finale. Every one of these 22 identities still
 * exists on the current track, so no legacy position is orphaned.
 */
export const LEGACY_BOARD_V1_KEYS: string[] = [
  "hub",
  /* School Street */
  "district:school",
  "node:nd_school_hold_it",
  "guardian:gd_shieldfin",
  "node:nd_school_risk_or_safe",
  "node:nd_school_friend_pressure",
  /* Retail District */
  "district:retail",
  "node:nd_retail_dare_checkout",
  "reward:retail",
  "node:nd_retail_clue_match",
  "node:nd_retail_cover_for_me",
  /* Digi-District */
  "district:digi",
  "node:nd_digi_easy_money",
  "node:nd_digi_warning_signs",
  "guardian:gd_verifox",
  "node:nd_digi_decode_clue",
  /* Community Hub */
  "district:community",
  "node:nd_community_jayden",
  "guardian:gd_beacon",
  "node:nd_community_who_can_help",
  "node:nd_community_what_next",
  "reward:community",
];

/**
 * Translates one index on the old 22-space track to the same logical space on
 * the current one.
 *
 * Returns null for anything the old track never had — a corrupt value, or an
 * index from a board this function does not describe. A null is a signal to
 * fall back, never to guess: mapping an unknown number onto whatever activity
 * now occupies it is exactly the failure this exists to prevent.
 */
export function migrateLegacyBoardPosition(position: unknown): number | null {
  if (typeof position !== "number" || !Number.isInteger(position)) return null;
  if (position < 0 || position >= LEGACY_BOARD_V1_KEYS.length) return null;
  return indexForBoardKey(LEGACY_BOARD_V1_KEYS[position]);
}

/* ------------------------------------------------------------------ */
/* District badges                                                     */
/* ------------------------------------------------------------------ */

/** Earned by finishing every playable activity in a district. Never ranked. */
export const DISTRICT_BADGES: Record<DistrictId, DistrictBadge> = {
  school: {
    districtId: "school",
    name: "Street Guardian",
    blurb: "You practised holding your ground where the pressure is personal.",
  },
  retail: {
    districtId: "retail",
    name: "Retail Watch",
    blurb: "You practised reading a dare for what it actually costs.",
  },
  digi: {
    districtId: "digi",
    name: "Digi Defender",
    blurb: "You practised spotting an easy-money offer for what it is.",
  },
  community: {
    districtId: "community",
    name: "Community Champion",
    blurb: "You practised stepping in for someone else, and finding help.",
  },
};

/* ------------------------------------------------------------------ */
/* Development guard                                                   */
/* ------------------------------------------------------------------ */

/*
 * Every space that claims an activity must point at one that exists, and every
 * district must appear on the track. Both are cheap to get wrong in a data file
 * and expensive to notice in a demonstration, so they fail loudly in dev and
 * are stripped from the production bundle.
 */
if (process.env.NODE_ENV !== "production") {
  const nodeIds = new Set(ALL_NODES.map((n) => n.id));
  for (const space of BOARD_SPACES) {
    if (space.nodeId && !nodeIds.has(space.nodeId)) {
      throw new Error(
        `Board space ${space.index} points at unknown activity "${space.nodeId}"`,
      );
    }
  }
  for (const card of SITUATION_CARDS) {
    if (!nodeIds.has(card.nodeId)) {
      throw new Error(
        `Situation Card ${card.id} points at unknown activity "${card.nodeId}"`,
      );
    }
  }
  for (const district of DISTRICTS) {
    if (!BOARD_SPACES.some((s) => s.districtId === district.id)) {
      throw new Error(`District ${district.id} is missing from the board`);
    }
  }

  /*
   * Two invariants the save migration depends on. A duplicate identity would
   * make `indexForBoardKey` answer with whichever space happened to be first,
   * and a dropped legacy identity would strand a restored session — both are
   * silent at runtime and cheap to introduce by editing the track above.
   */
  const seen = new Set<string>();
  for (const key of BOARD_SPACE_KEYS) {
    if (seen.has(key)) {
      throw new Error(`Board space identity "${key}" is not unique`);
    }
    seen.add(key);
  }
  for (const key of LEGACY_BOARD_V1_KEYS) {
    if (!seen.has(key)) {
      throw new Error(
        `Legacy board identity "${key}" no longer exists on the current track — a saved v1 session cannot be migrated`,
      );
    }
  }
}
