import {
  GUARDIAN_BEACON,
  GUARDIAN_SHIELDFIN,
  GUARDIAN_VERIFOX,
} from "@/lib/api/mock-data";
import type { Achievement, Reward } from "@/lib/types";

/**
 * Shield Tokens, rewards and achievements.
 *
 * ## Shield Tokens are not money
 *
 * Coins are virtual cash *inside* a scenario — the S$300 an offer dangles in
 * front of you is part of the lesson, and it is supposed to feel good before it
 * costs you. Shield Tokens are the opposite kind of thing: a record of learning
 * participation, spent only on expression. They are kept apart deliberately.
 * Merging them would mean a risky in-scenario payout could buy something, which
 * is precisely the association this programme exists to break.
 *
 * Tokens are never awarded for a dice value, for luck, for taking a risky
 * option, or for doing better than anybody else. Every award is keyed and paid
 * once — see `tokenGrants` on the player profile — so replaying an activity or
 * reloading the page cannot mint more.
 */

/** How many Shield Tokens each kind of completion is worth. */
export const TOKEN_AWARD = {
  /** Any scenario or Peer Shield mission completed. */
  mission: 40,
  /** A Peer Shield mission where the player intervened constructively. */
  peerShieldSuccess: 10,
  miniGame: 25,
  district: 100,
  achievement: 50,
} as const;

/** Grant keys. Idempotency depends on these being stable, so they live here. */
export const tokenKey = {
  mission: (nodeId: string) => `mission:${nodeId}`,
  peerShieldSuccess: (nodeId: string) => `peer-success:${nodeId}`,
  district: (districtId: string) => `district:${districtId}`,
  achievement: (achievementId: string) => `achievement:${achievementId}`,
};

/* ------------------------------------------------------------------ */
/* Rewards                                                             */
/* ------------------------------------------------------------------ */

/**
 * The rewards catalogue.
 *
 * Cosmetic only, with no exceptions: nothing here changes a scenario, an
 * outcome, a Guardian's level, what content is available or how fast anything
 * progresses. There are no random rewards, no crates, no draws and no
 * duplicates — a player sees the price, decides, and gets exactly the thing
 * they chose.
 *
 * The Guardian rewards are expression treatments — an aura and a frame around
 * the Guardian's portrait — rather than new poses. The V2.2 export supplies one
 * neutral portrait per Guardian and no pose variants, and inventing substitute
 * artwork for a reward a player pays for would be worse than shipping an honest
 * treatment of the art that exists. The descriptions say what is actually
 * unlocked.
 */
export const REWARDS: Reward[] = [
  {
    id: "rw_verifox_success",
    category: "GUARDIANS",
    slot: "guardianAura",
    name: "VeriFox Success Pose",
    description:
      "A warm celebration aura around VeriFox wherever the portrait appears.",
    cost: 250,
    featured: true,
    guardianId: GUARDIAN_VERIFOX,
    swatch: "from-amber-400 to-amber-200",
  },
  {
    id: "rw_beacon_glow",
    category: "GUARDIANS",
    slot: "guardianAura",
    name: "Beacon Guiding Glow",
    description: "A steady guiding glow around Beacon's portrait.",
    cost: 250,
    guardianId: GUARDIAN_BEACON,
    swatch: "from-civic-400 to-civic-200",
  },
  {
    id: "rw_shieldfin_protector",
    category: "GUARDIANS",
    slot: "guardianAura",
    name: "Shieldfin Peer Protector Pose",
    description: "A protective halo around Shieldfin's portrait.",
    cost: 250,
    guardianId: GUARDIAN_SHIELDFIN,
    swatch: "from-teal-500 to-teal-200",
  },
  {
    id: "rw_token_digi_navigator",
    category: "CITY_STYLE",
    slot: "playerToken",
    name: "Digi Navigator",
    description: "A cool-toned player token for the city board.",
    cost: 150,
    swatch: "from-civic-500 to-teal-500",
  },
  {
    id: "rw_trail_civic_blue",
    category: "CITY_STYLE",
    slot: "routeTrail",
    name: "Civic Blue Trail",
    description: "Recolours the route your token travels along.",
    cost: 120,
    swatch: "from-civic-500 to-civic-200",
  },
  {
    id: "rw_frame_community_defender",
    category: "CITY_STYLE",
    slot: "profileFrame",
    name: "Community Defender Frame",
    description: "A frame around your Shield Central header.",
    cost: 200,
    swatch: "from-leaf-600 to-leaf-200",
  },
  {
    id: "rw_marker_shield",
    category: "CITY_STYLE",
    slot: "boardMarker",
    name: "Shield Board Marker",
    description: "Marks the spaces you have completed with a shield.",
    cost: 100,
    swatch: "from-navy-700 to-civic-400",
  },
];

export function findReward(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id);
}

/* ------------------------------------------------------------------ */
/* Player tokens (chosen during onboarding, always free)               */
/* ------------------------------------------------------------------ */

/**
 * Onboarding token choices.
 *
 * Shape and colour only. No avatars, no names, no gender, no age, nothing that
 * asks a young person to describe themselves in order to play.
 */
export const PLAYER_TOKENS = [
  { id: "pt_shield", name: "Shield", swatch: "bg-amber-500", ring: "ring-amber-400" },
  { id: "pt_beacon", name: "Beacon", swatch: "bg-civic-600", ring: "ring-civic-400" },
  { id: "pt_wave", name: "Wave", swatch: "bg-teal-600", ring: "ring-teal-400" },
  { id: "pt_leaf", name: "Leaf", swatch: "bg-leaf-600", ring: "ring-leaf-200" },
] as const;

export const DEFAULT_PLAYER_TOKEN = PLAYER_TOKENS[0].id;

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

/**
 * Achievements.
 *
 * Personal milestones against the player's own practice. There is no
 * leaderboard, no percentile, no cohort comparison and no visibility of anyone
 * else's progress anywhere in this app — a crime-prevention programme has no
 * business ranking the young people taking part in it against each other.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach_risk_spotter",
    title: "Risk Spotter",
    description: "Practise Spot the Risk five times.",
    target: 5,
    metric: { kind: "COMPETENCY", competency: "SPOT" },
  },
  {
    id: "ach_pause_first",
    title: "Pause First",
    description: "Practise Hold Before Acting five times.",
    target: 5,
    metric: { kind: "COMPETENCY", competency: "HOLD" },
  },
  {
    id: "ach_peer_protector",
    title: "Peer Protector",
    description: "Complete three Peer Shield missions.",
    target: 3,
    metric: { kind: "NODE_KIND", nodeKind: "PEER_SHIELD" },
  },
  {
    id: "ach_trusted_helper",
    title: "Trusted Helper",
    description: "Strengthen Beacon through help-seeking decisions.",
    target: 3,
    metric: { kind: "GUARDIAN", guardianId: GUARDIAN_BEACON },
  },
  {
    id: "ach_community_defender",
    title: "Community Defender",
    description: "Practise all six S.H.I.E.L.D. skills.",
    target: 6,
    metric: { kind: "SKILL_BREADTH" },
  },
];
