import {
  GUARDIAN_BEACON,
  GUARDIAN_SHIELDFIN,
  GUARDIAN_VERIFOX,
  MULE_ENCOUNTER,
  MULE_PEER_SHIELD,
} from "@/lib/api/mock-data";
import type { District, DistrictId, MissionNode } from "@/lib/types";

/**
 * ShieldQuest City — the district board.
 *
 * The city is an engagement and navigation layer wrapped around the behavioural
 * engine, not a replacement for it. Every node still resolves to one of three
 * things: a scenario decision, a Peer Shield intervention, or a reinforcement
 * mini-game that hands the player back to a scenario.
 *
 * Progression is chosen, never rolled. A player can walk into any district from
 * the first second; only a few later nodes open through completion, and always
 * through completion *within the same district* so the requirement is legible
 * from the tile itself.
 *
 * Content marked `PLANNED` is designed but out of scope for this prototype. It
 * is labelled honestly rather than dressed up as something earnable.
 */

/* ------------------------------------------------------------------ */
/* Node ids — referenced by mini-games and by completion records        */
/* ------------------------------------------------------------------ */

export const NODE_EASY_MONEY = "nd_digi_easy_money";
export const NODE_WORD_SEARCH = "nd_digi_warning_signs";
export const NODE_DECODE = "nd_digi_decode_clue";
export const NODE_PEER_JAYDEN = "nd_community_jayden";
export const NODE_DIGI_INTRO = "nd_digi_new_opportunity";
export const NODE_DIGI_JAYDEN_BRIDGE = "nd_digi_jaydens_new_job";
export const NODE_DIGI_FINALE = "nd_digi_group_chat_job";

/*
 * The remaining node ids. Named here rather than only inline so the city board
 * track can reference a space's activity by constant and a typo becomes a
 * compile error instead of a space that silently opens nothing.
 */
export const NODE_SCHOOL_HOLD_IT = "nd_school_hold_it";
export const NODE_SCHOOL_RISK_OR_SAFE = "nd_school_risk_or_safe";
export const NODE_SCHOOL_FRIEND_PRESSURE = "nd_school_friend_pressure";
export const NODE_RETAIL_DARE = "nd_retail_dare_checkout";
export const NODE_RETAIL_CLUE_MATCH = "nd_retail_clue_match";
export const NODE_RETAIL_COVER_FOR_ME = "nd_retail_cover_for_me";
export const NODE_COMMUNITY_WHO_CAN_HELP = "nd_community_who_can_help";
export const NODE_COMMUNITY_WHAT_NEXT = "nd_community_what_next";

const SCHOOL_NODES: MissionNode[] = [
  {
    id: NODE_SCHOOL_HOLD_IT,
    districtId: "school",
    kind: "SCENARIO",
    title: "Just Hold It For Me",
    summary:
      "A classmate asks you to keep something in your bag until after class.",
    primaryCompetency: "HOLD",
    estimatedMinutes: 3,
    availability: "PLANNED",
  },
  {
    id: NODE_SCHOOL_RISK_OR_SAFE,
    districtId: "school",
    kind: "MINI_GAME",
    title: "Risk or Safe?",
    summary: "Sort situations quickly, then explain what tipped the decision.",
    primaryCompetency: "EVALUATE",
    estimatedMinutes: 2,
    availability: "PLANNED",
  },
  {
    id: NODE_SCHOOL_FRIEND_PRESSURE,
    districtId: "school",
    kind: "PEER_SHIELD",
    title: "Friend Under Pressure",
    summary:
      "Your friend is being dared in front of the group. You are not the target.",
    primaryCompetency: "DEFEND",
    guardianId: GUARDIAN_SHIELDFIN,
    estimatedMinutes: 3,
    availability: "PLANNED",
  },
];

const RETAIL_NODES: MissionNode[] = [
  {
    id: NODE_RETAIL_DARE,
    districtId: "retail",
    kind: "SCENARIO",
    title: "The Dare at Checkout",
    summary:
      "Your friends are filming. One of them says nobody is watching the aisle.",
    primaryCompetency: "IDENTIFY",
    estimatedMinutes: 3,
    availability: "PLANNED",
  },
  {
    id: NODE_RETAIL_CLUE_MATCH,
    districtId: "retail",
    kind: "MINI_GAME",
    title: "Clue Match",
    summary: "Match warning signs to the situations they usually appear in.",
    primaryCompetency: "SPOT",
    estimatedMinutes: 2,
    availability: "PLANNED",
  },
  {
    id: NODE_RETAIL_COVER_FOR_ME,
    districtId: "retail",
    kind: "PEER_SHIELD",
    title: "Cover For Me",
    summary:
      "A friend wants you to say you were together. Saying yes makes it yours too.",
    primaryCompetency: "DEFEND",
    guardianId: GUARDIAN_SHIELDFIN,
    estimatedMinutes: 3,
    availability: "PLANNED",
  },
];

const DIGI_NODES: MissionNode[] = [
  {
    id: NODE_DIGI_INTRO,
    districtId: "digi",
    kind: "SCENARIO",
    title: "New Opportunity",
    summary:
      "A promising online job starts the chapter — and Jayden is listening too.",
    primaryCompetency: "IDENTIFY",
    estimatedMinutes: 2,
    availability: "PLANNED",
    chapterRole: "Chapter setup",
    story: {
      character: "Jayden",
      beat: "Jayden hears about an online job that sounds unusually easy.",
    },
  },
  {
    id: NODE_EASY_MONEY,
    districtId: "digi",
    kind: "SCENARIO",
    title: MULE_ENCOUNTER.title,
    summary: "S$300 to let money pass through your account. No risk, they say.",
    primaryCompetency: MULE_ENCOUNTER.primaryCompetency,
    guardianId: GUARDIAN_VERIFOX,
    estimatedMinutes: MULE_ENCOUNTER.estimatedMinutes,
    availability: "OPEN",
    href: "/play",
    chapterRole: "Core scenario",
    story: {
      character: "Jayden",
      beat: "The same offer asks to use a personal account to move money.",
    },
  },
  {
    id: NODE_WORD_SEARCH,
    districtId: "digi",
    kind: "MINI_GAME",
    title: "Spot the Warning Signs",
    summary: "Find the words that could signal a risky situation.",
    primaryCompetency: "SPOT",
    guardianId: GUARDIAN_VERIFOX,
    estimatedMinutes: 3,
    availability: "OPEN",
    href: "/mini-game/spot-the-warning-signs",
    chapterRole: "Clue challenge",
    story: {
      character: "Jayden",
      beat: "The clues begin to make the offer look less like a real job.",
    },
  },
  {
    id: NODE_DECODE,
    districtId: "digi",
    kind: "GUARDIAN_CHALLENGE",
    title: "Decode the Clue",
    summary: "Work out the prevention skill from a hint, one letter at a time.",
    primaryCompetency: "HOLD",
    guardianId: GUARDIAN_VERIFOX,
    estimatedMinutes: 2,
    availability: "UNLOCK",
    requiredInDistrict: 1,
    href: "/mini-game/decode-the-clue",
    chapterRole: "Situation card",
    story: {
      character: "Jayden",
      beat: "An urgent message adds pressure before there is time to verify.",
    },
  },
  {
    id: NODE_DIGI_JAYDEN_BRIDGE,
    districtId: "digi",
    kind: "PEER_SHIELD",
    title: "Jayden's New Job",
    summary:
      "Jayden mentions account use and growing pressure. A private warning could help.",
    primaryCompetency: "DEFEND",
    guardianId: GUARDIAN_SHIELDFIN,
    estimatedMinutes: 3,
    availability: "PLANNED",
    chapterRole: "Narrative bridge",
    story: {
      character: "Jayden",
      beat: "Jayden is no longer just curious — someone is pushing him to act.",
    },
  },
  {
    id: NODE_DIGI_FINALE,
    districtId: "digi",
    kind: "SCENARIO",
    title: "The Group Chat Job",
    summary:
      "District finale: the group has to decide how to protect Jayden together.",
    primaryCompetency: "LEAD",
    guardianId: GUARDIAN_BEACON,
    estimatedMinutes: 4,
    availability: "PLANNED",
    chapterRole: "District finale",
    story: {
      character: "Jayden",
      beat: "The whole thread converges in a group chat where silence has a cost.",
    },
  },
];

const COMMUNITY_NODES: MissionNode[] = [
  {
    id: NODE_PEER_JAYDEN,
    districtId: "community",
    kind: "PEER_SHIELD",
    title: MULE_PEER_SHIELD.title,
    summary: "Six people saw the message. Nobody has said anything yet.",
    primaryCompetency: MULE_PEER_SHIELD.primaryCompetency,
    guardianId: GUARDIAN_SHIELDFIN,
    estimatedMinutes: MULE_PEER_SHIELD.estimatedMinutes,
    availability: "OPEN",
    href: "/peer-shield",
  },
  {
    id: NODE_COMMUNITY_WHO_CAN_HELP,
    districtId: "community",
    kind: "MINI_GAME",
    title: "Who Can Help?",
    summary: "Match a situation to a help source that actually fits it.",
    primaryCompetency: "LEAD",
    guardianId: GUARDIAN_BEACON,
    estimatedMinutes: 2,
    availability: "PLANNED",
  },
  {
    id: NODE_COMMUNITY_WHAT_NEXT,
    districtId: "community",
    kind: "MINI_GAME",
    title: "What Happens Next?",
    summary: "Predict the delayed consequence before the scenario shows it.",
    primaryCompetency: "EVALUATE",
    estimatedMinutes: 2,
    availability: "PLANNED",
  },
];

export const DISTRICTS: District[] = [
  {
    id: "school",
    name: "School Street",
    tagline: "Where the pressure comes from people you know.",
    topics: ["Peer pressure", "Dares", "Harmful behaviour"],
    position: { x: 22, y: 20 },
    nodes: SCHOOL_NODES,
  },
  {
    id: "retail",
    name: "Retail District",
    tagline: "A small dare with a permanent record.",
    topics: ["Shop theft", "Peer dares", "Consequences"],
    position: { x: 76, y: 27 },
    nodes: RETAIL_NODES,
  },
  {
    id: "digi",
    name: "Digi-District",
    tagline: "Easy money is the oldest trick with the newest interface.",
    topics: ["Money mule recruitment", "Account misuse", "Impersonation"],
    position: { x: 24, y: 71 },
    nodes: DIGI_NODES,
  },
  {
    id: "community",
    name: "Community Hub",
    tagline: "Sometimes the risky choice isn't yours.",
    topics: ["Peer Shield", "Help-seeking", "Community responsibility"],
    position: { x: 74, y: 78 },
    nodes: COMMUNITY_NODES,
  },
];

export const CITY_TAGLINE = "Explore the city. Spot the risk. Make the choice.";

/** Narrative framing layered over the existing geographic districts. */
export const DISTRICT_CHAPTER: Record<
  DistrictId,
  { label: string; title: string; intro: string }
> = {
  school: {
    label: "Chapter 1",
    title: "Pressure Close to Home",
    intro:
      "Explore situations about peer pressure, risky requests and everyday choices.",
  },
  retail: {
    label: "Chapter 2",
    title: "The Cost of a Dare",
    intro: "Look past the moment and evaluate what a small dare can set in motion.",
  },
  digi: {
    label: "Chapter 3",
    title: "Too Good to Be True",
    intro: "Follow one suspicious opportunity from its first promise to the pressure that follows.",
  },
  community: {
    label: "Chapter 4",
    title: "Protect Together",
    intro: "Notice when someone else needs a quiet warning or trusted help.",
  },
};

/** Short Guardian lines used as personality cues, never as a lecture. */
export const GUARDIAN_DIALOGUE: Record<
  string,
  { briefing: string; success: string; checkpoint: string }
> = {
  [GUARDIAN_VERIFOX]: {
    briefing: "Something feels off. Check the clues.",
    success: "Good catch. You checked before you trusted.",
    checkpoint: "Slow down. The detail that matters is usually already there.",
  },
  [GUARDIAN_SHIELDFIN]: {
    briefing: "A quiet warning can protect a friend.",
    success: "You made space for a friend to step back.",
    checkpoint: "Protect the person without escalating the pressure.",
  },
  [GUARDIAN_BEACON]: {
    briefing: "You don't have to handle it alone.",
    success: "Good call. Trusted help is part of the plan.",
    checkpoint: "When you are unsure, the next step can be asking for help.",
  },
};

/** Every node across the city, flattened. Used for progress and lookups. */
export const ALL_NODES: MissionNode[] = DISTRICTS.flatMap((d) => d.nodes);

export function findNode(id: string): MissionNode | undefined {
  return ALL_NODES.find((n) => n.id === id);
}
