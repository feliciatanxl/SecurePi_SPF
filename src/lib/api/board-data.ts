import {
  GUARDIAN_BEACON,
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
 * Two of the four districts have no playable content in this prototype — their
 * scenarios are designed but not built. A track that sent a player into School
 * Street and handed them three dead ends in a row would be a bad demonstration
 * *and* a bad game, so every district also carries spaces that always have
 * something to say: a district checkpoint, a Guardian checkpoint reporting real
 * learning progress, or a reward checkpoint. Unbuilt activities are still
 * listed and still labelled "coming soon" rather than hidden, because pretending
 * they are earnable would be worse than admitting they are not built.
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
      "Someone offers you S$300 to receive and forward money through your account.",
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
    guardianId: GUARDIAN_VERIFOX,
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
 * 22 spaces on one continuous loop:
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
}
