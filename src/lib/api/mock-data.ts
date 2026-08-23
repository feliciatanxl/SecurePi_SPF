import { DEFAULT_SETTINGS } from "@/lib/types";
import type {
  AdminScenarioRow,
  Guardian,
  Insight,
  PlayerProfile,
  PortalSummary,
  Scenario,
  SkillCoverage,
} from "@/lib/types";

/**
 * Hardcoded prototype fixtures.
 *
 * Everything here is shaped exactly like the payloads the real API will return,
 * so swapping `MockApiClient` for `HttpApiClient` requires no component changes.
 *
 * All figures are illustrative. Nothing in this file is a real pilot result.
 */

export const PROTOTYPE_DISCLAIMER =
  "Concept prototype · simulated scenarios and data";

/* ------------------------------------------------------------------ */
/* Guardians                                                           */
/* ------------------------------------------------------------------ */

export const GUARDIAN_VERIFOX = "gd_verifox";
export const GUARDIAN_ECHO = "gd_echo";
export const GUARDIAN_CLUEPAW = "gd_cluepaw";
export const GUARDIAN_BYTEBUDDY = "gd_bytebuddy";
export const GUARDIAN_BEACON = "gd_beacon";
export const GUARDIAN_SHIELDFIN = "gd_shieldfin";

/**
 * The six Guardians — one per S.H.I.E.L.D. competency.
 *
 * The mapping is one-to-one and load-bearing, not decorative. A Guardian is the
 * visible form of a prevention skill, so an activity that practises HOLD has to
 * strengthen Echo and nothing else; a Guardian that grew from unrelated work
 * would stop being evidence of anything. `COMPETENCY_ORDER` is the order used
 * here and everywhere the six are listed together.
 *
 *   SPOT     → VeriFox    · Verification
 *   HOLD     → Echo       · Consultation
 *   IDENTIFY → Cluepaw    · Situational Awareness
 *   EVALUATE → ByteBuddy  · Cyber Hygiene
 *   LEAD     → Beacon     · Safe Reporting
 *   DEFEND   → Shieldfin  · Peer Support
 */
export const MOCK_GUARDIANS: Guardian[] = [
  {
    id: GUARDIAN_VERIFOX,
    name: "VeriFox",
    skill: "Verification",
    motto: "Check before you trust.",
    competency: "SPOT",
    target: 6,
    description:
      "Strengthens when you slow down and check who you are really dealing with.",
    unlocked: true,
  },
  {
    id: GUARDIAN_ECHO,
    name: "Echo",
    skill: "Consultation",
    motto: "Say it out loud before you act on it.",
    competency: "HOLD",
    target: 6,
    description:
      "Strengthens when you pause under pressure and talk a request through with someone before answering it.",
    unlocked: true,
  },
  {
    id: GUARDIAN_CLUEPAW,
    name: "Cluepaw",
    skill: "Situational Awareness",
    motto: "The detail that matters is already there.",
    competency: "IDENTIFY",
    target: 6,
    description:
      "Strengthens when you read what is really going on in a situation — who benefits, who is pushing, and what is being left out.",
    unlocked: true,
  },
  {
    id: GUARDIAN_BYTEBUDDY,
    name: "ByteBuddy",
    skill: "Cyber Hygiene",
    motto: "Your account, your name, your problem.",
    competency: "EVALUATE",
    target: 6,
    description:
      "Strengthens when you weigh what a digital request actually costs — accounts, logins, payments and the trail they leave.",
    unlocked: true,
  },
  {
    id: GUARDIAN_BEACON,
    name: "Beacon",
    skill: "Safe Reporting",
    motto: "Know when and where to seek help.",
    competency: "LEAD",
    target: 6,
    description:
      "Strengthens when you step out of a situation and reach the right channel for help.",
    unlocked: true,
  },
  {
    id: GUARDIAN_SHIELDFIN,
    name: "Shieldfin",
    skill: "Peer Support",
    motto: "Protect your people.",
    competency: "DEFEND",
    target: 6,
    description:
      "Strengthens when you look out for a friend without escalating the situation.",
    unlocked: true,
  },
];

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export const MOCK_PROFILE: PlayerProfile = {
  handle: "Guardian_2481",
  cohort: "Poly · Y2",
  coins: 1240,
  resiliencePoints: 85,
  trust: 62,
  risk: 28,
  missionsCompleted: 7,
  streakDays: 4,
  currentGuardianId: GUARDIAN_VERIFOX,
  // Cumulative qualifying decisions. Level and bar position are derived from
  // these, so the two can never drift apart. 10 with a target of 6 renders as
  // "Level 2 · 4 / 6".
  guardianProgress: {
    [GUARDIAN_VERIFOX]: 10,
    [GUARDIAN_ECHO]: 4,
    [GUARDIAN_CLUEPAW]: 1,
    [GUARDIAN_BYTEBUDDY]: 2,
    [GUARDIAN_BEACON]: 2,
    [GUARDIAN_SHIELDFIN]: 3,
  },
  // The city board starts unplayed so a demonstration shows progress being
  // earned rather than pre-filled. Personal progress only — never compared.
  completedActivities: [],
  // Shield Central is the starting hub. The four learning districts are
  // revealed through travel or intentional direct entry.
  discoveredDistricts: [],
  currentDistrictId: "digi",

  // The token starts on Shield Central, which is where a turn begins.
  boardPosition: 0,
  visitedSpaces: [],
  /*
   * A starting Shield Token balance, in the same spirit as the coins, streak
   * and Guardian progress above: this profile represents a youth already part
   * way through the programme, not a blank account. It also means the Rewards
   * Hub can be shown doing something in a demonstration without ten minutes of
   * play first. Tokens are participation credit for cosmetics — never money,
   * never redeemable, never a measure of anyone.
   */
  shieldTokens: 480,
  tokenGrants: [],
  unlockedRewards: [],
  equippedRewards: {},
  earnedAchievements: [],
  districtBadges: [],
  casebook: [],
  onboardingComplete: false,
  // Matches PLAYER_TOKENS[0] in rewards-data. Written as a literal so the
  // fixtures do not have to import from a module that imports them back.
  playerTokenId: "pt_shield",
  settings: DEFAULT_SETTINGS,
  joinedSession: null,
  learningChecks: {
    pre: { id: "pre", completed: false, responses: [] },
    post: { id: "post", completed: false, responses: [] },
  },
};

/* ------------------------------------------------------------------ */
/* Scenario Encounter — money mule recruitment                         */
/* ------------------------------------------------------------------ */

export const MULE_ENCOUNTER: Scenario = {
  id: "scn_money_mule_01",
  mode: "ENCOUNTER",
  title: "Easy Money?",
  category: "Money Mule Recruitment",
  hook: "Can you spot the risk before the reward?",
  difficulty: "Medium",
  estimatedMinutes: 3,
  primaryCompetency: "SPOT",
  competencies: ["SPOT", "HOLD", "EVALUATE"],
  step: 2,
  totalSteps: 4,
  prompt:
    "Someone online offers you S$300 to receive money into your bank account.",
  messages: [
    {
      id: "m1",
      author: "system",
      body: "Message request from an unknown contact",
      meta: "You have not spoken to this account before",
    },
    {
      id: "m2",
      author: "them",
      displayName: "Unknown contact",
      body: "Bro easy $300.",
    },
    {
      id: "m3",
      author: "them",
      displayName: "Unknown contact",
      body: "Just let money enter your account then transfer it out.",
    },
    {
      id: "m4",
      author: "them",
      displayName: "Unknown contact",
      body: "No risk. Takes 5 mins only. Need your answer tonight.",
    },
  ],
  clueQuestion: "Why does this seem suspicious?",
  clues: [
    {
      id: "cl_easy",
      label: "Easy money",
      note: "A large payment for almost no work is a recruitment tactic, not a job.",
    },
    {
      id: "cl_urgency",
      label: "Urgency",
      note: "A deadline is there to stop you checking. Real offers survive a delay.",
    },
    {
      id: "cl_account",
      label: "Using my account",
      note: "Nobody legitimate needs your personal account to move their money.",
    },
    {
      id: "cl_unknown",
      label: "Unknown sender",
      note: "You cannot verify who this is, so you cannot verify what you are agreeing to.",
    },
  ],
  choices: [
    {
      id: "ch_accept",
      label: "Accept",
      hint: "Share your account details and take the S$300",
      reply: "Ok deal. Sending you my account number now.",
      outcome: "RISKY",
      immediate: {
        deltas: { coins: 300 },
        flashTitle: "Payment received",
        flashAmount: "+300 Coins",
      },
      delayed: {
        delayMs: 3000,
        timeLabel: "3 days later",
        headline: "Account access restricted",
        body: "Transactions through your account were flagged as suspicious. The account is now restricted while the transfers are reviewed.",
        deltas: { coins: -300, trust: -20, risk: 25 },
        changedImmediate: ["+300 Coins"],
        changedLater: [
          "Account restricted",
          "Trust decreased",
          "Risk increased",
        ],
        warningSigns: [
          "Payment offered for use of your personal account",
          "Unknown sender you could not verify",
          "Easy-money promise for almost no work",
          "Request to transfer the funds onward",
        ],
        saferResponse:
          "Do not allow other people to use your bank account to receive or move money. Disengage, and seek help through appropriate official channels where necessary.",
        competency: "EVALUATE",
      },
      debrief: {
        headline: "You took the offer",
        body: "The payment arrived straight away, which is exactly why this approach works on people.",
        competency: "EVALUATE",
      },
    },
    {
      id: "ch_proof",
      label: "Ask for proof",
      hint: "Ask who they are before deciding anything",
      reply: "Which company is this? Send me your registration details first.",
      outcome: "CAUTIOUS",
      immediate: {
        deltas: { coins: 10, trust: 4 },
        flashTitle: "You slowed it down",
        flashAmount: "+10 Coins",
      },
      debrief: {
        headline: "Partly there",
        body: "Slowing the conversation down was the right instinct. But documents are easy to fake, and staying in the chat keeps the pressure on you. The offer is unsafe regardless of who is asking, so verifying the sender is weaker than stepping away.",
        spotted: ["Unverified sender"],
        saferResponse:
          "You do not need to establish who they are. Decline the use of your account and disengage.",
        competency: "HOLD",
        guardianId: GUARDIAN_VERIFOX,
      },
    },
    {
      id: "ch_reject",
      label: "Reject & seek help",
      hint: "Decline, disengage, and tell someone you trust",
      reply:
        "No — I'm not letting anyone use my account. Blocking this and telling someone.",
      outcome: "SAFE",
      immediate: {
        deltas: { coins: 50, resilience: 10, trust: 10, risk: -10 },
        flashTitle: "Good call",
        flashAmount: "+50 Coins",
      },
      debrief: {
        headline: "Good call",
        body: "You disengaged instead of negotiating, and you brought someone else in. That is the response that holds up even when the offer is dressed up convincingly.",
        spotted: [
          "Unverified sender",
          "Easy-money incentive",
          "Request to use your personal account",
        ],
        saferResponse:
          "Letting someone else move money through your account can make you responsible for it. Decline, disengage, and raise it through an appropriate official channel if you are unsure.",
        competency: "SPOT",
        guardianId: GUARDIAN_VERIFOX,
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Peer Shield Mode                                                    */
/* ------------------------------------------------------------------ */

export const MULE_PEER_SHIELD: Scenario = {
  id: "scn_money_mule_peer_01",
  mode: "PEER_SHIELD",
  title: "Jayden's Offer",
  category: "Money Mule Recruitment",
  hook: "Sometimes the risky choice isn't yours.",
  difficulty: "Medium",
  estimatedMinutes: 2,
  primaryCompetency: "DEFEND",
  competencies: ["DEFEND", "LEAD"],
  step: 1,
  totalSteps: 3,
  prompt: "You notice your friend agreeing to transfer unknown funds.",
  messages: [
    {
      id: "p1",
      author: "system",
      body: "Group chat · 6 members",
      meta: "Jayden posted 2 minutes ago",
    },
    {
      id: "p2",
      author: "them",
      displayName: "Jayden",
      body: "Bro this guy says he'll pay me $300. I just need to receive the money first.",
    },
    {
      id: "p3",
      author: "them",
      displayName: "Jayden",
      body: "Sending him my account number now. Free money sia.",
    },
  ],
  clueQuestion: "What stands out about Jayden's situation?",
  clues: [
    {
      id: "pcl_account",
      label: "His account, their money",
      note: "Jayden would be the named account holder for funds that are not his.",
    },
    {
      id: "pcl_stranger",
      label: "He hasn't met them",
      note: "There is no way for Jayden to check who he is actually helping.",
    },
    {
      id: "pcl_public",
      label: "Six people are watching",
      note: "The more people who see it, the less likely any one of them says something.",
    },
  ],
  choices: [
    {
      id: "pc_ignore",
      label: "Ignore it",
      hint: "Say nothing and scroll past",
      reply: "(You say nothing and close the chat.)",
      outcome: "RISKY",
      immediate: {
        deltas: { resilience: -10, risk: 5 },
        flashTitle: "You stayed quiet",
        flashAmount: "−10 Resilience",
      },
      debrief: {
        headline: "Silence reads as agreement",
        body: "Six people saw the message and nobody gave Jayden a reason to stop. The more witnesses there are, the less likely any single one of them speaks up — which is exactly why saying something matters.",
        competency: "DEFEND",
      },
    },
    {
      id: "pc_private",
      label: "Warn them privately",
      hint: "Message Jayden directly, away from the group",
      reply:
        "(Direct message to Jayden) Hey — hold off on that one, I don't think it's safe.",
      outcome: "SAFE",
      immediate: {
        deltas: { coins: 40, resilience: 30, trust: 8 },
        flashTitle: "Peer Shield success",
        flashAmount: "+30 Community Resilience",
      },
      debrief: {
        headline: "Peer Shield success",
        body: "You challenged the risky behaviour without escalating the situation. A private message lets Jayden step back without losing face in front of the group, which is the single biggest barrier to a friend changing their mind.",
        spotted: [
          "Raised it privately, not publicly",
          "Named the risk without shaming him",
          "Gave him a clear next step",
        ],
        sampleScript:
          "This sounds risky. Why does he need YOUR account? Don't send anything first — let's check it properly.",
        competency: "DEFEND",
        guardianId: GUARDIAN_SHIELDFIN,
      },
    },
    {
      id: "pc_help",
      label: "Get appropriate help",
      hint: "Bring in a trusted adult or an official channel",
      reply:
        "(You speak to someone you trust and point Jayden to the right place to check.)",
      outcome: "SAFE",
      immediate: {
        deltas: { coins: 35, resilience: 25, trust: 10 },
        flashTitle: "Peer Shield success",
        flashAmount: "+25 Community Resilience",
      },
      debrief: {
        headline: "Peer Shield success",
        body: "Some situations are bigger than a group chat. Bringing in a trusted adult or an official channel is the right call when a friend has already shared their details — and it does not require you to confront anyone yourself.",
        spotted: [
          "Recognised it had gone past peer advice",
          "Chose a trusted adult over confrontation",
        ],
        sampleScript:
          "I'm not sure how to fix this one — let's ask someone who actually knows what to do before anything gets transferred.",
        competency: "LEAD",
        guardianId: GUARDIAN_BEACON,
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Scenario Management Portal                                          */
/* ------------------------------------------------------------------ */

/**
 * The demonstration content library.
 *
 * Every row is illustrative. The figures are not pilot results, the scenarios
 * are not all built, and nothing here has been through the review a real
 * prevention programme would require — the library exists to show what the
 * portal *does* with content, not to claim a catalogue exists.
 *
 * The spread of categories deliberately mirrors the scam-prevention scope the
 * programme is designed around — phishing, job scams, money mule recruitment,
 * impersonation, e-commerce scams and suspicious credential or payment requests
 * — alongside the offline behaviours the city districts cover. Audience bands
 * use the shared `TargetGroup` vocabulary so the library, the filters, the
 * Flash Mission form and the youth-submission queue all speak the same one.
 */
export const MOCK_ADMIN_SCENARIOS: AdminScenarioRow[] = [
  {
    id: "scn_shop_theft_01",
    title: "The Dare at Checkout",
    category: "Shop Theft & Peer Pressure",
    targetGroup: "Secondary",
    status: "LIVE",
    safeDecisionRate: 74,
    previousSafeDecisionRate: 65,
    responses: 3960,
    competencies: ["SPOT", "IDENTIFY", "LEAD"],
    updatedBy: "Content Team",
    updatedOn: "09 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_money_mule_01",
    title: "Easy Money?",
    category: "Money Mule Recruitment",
    targetGroup: "Post-Secondary / Tertiary",
    status: "LIVE",
    safeDecisionRate: 61,
    previousSafeDecisionRate: 54,
    responses: 2841,
    competencies: ["SPOT", "HOLD", "EVALUATE"],
    updatedBy: "Content Team",
    updatedOn: "12 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_account_sharing_01",
    title: "Just Use Mine",
    category: "Account Sharing",
    targetGroup: "Secondary",
    status: "LIVE",
    safeDecisionRate: 58,
    previousSafeDecisionRate: 60,
    responses: 2210,
    competencies: ["EVALUATE", "HOLD"],
    updatedBy: "Content Team",
    updatedOn: "14 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_ecom_01",
    title: "Concert Tickets, Cash Only",
    category: "E-Commerce Scam",
    targetGroup: "All Youth Bands",
    status: "LIVE",
    safeDecisionRate: 82,
    previousSafeDecisionRate: 80,
    responses: 5120,
    competencies: ["SPOT", "HOLD"],
    updatedBy: "Content Team",
    updatedOn: "02 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_peer_mule_01",
    title: "Jayden's Offer",
    category: "Peer Shield · Money Mule",
    targetGroup: "Post-Secondary / Tertiary",
    status: "LIVE",
    safeDecisionRate: 71,
    previousSafeDecisionRate: 68,
    responses: 1902,
    competencies: ["DEFEND", "LEAD"],
    updatedBy: "Content Team",
    updatedOn: "11 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_job_scam_01",
    title: "No Experience Needed",
    category: "Job Scam",
    targetGroup: "Post-Secondary / Tertiary",
    status: "LIVE",
    safeDecisionRate: 66,
    previousSafeDecisionRate: 62,
    responses: 1874,
    competencies: ["IDENTIFY", "EVALUATE"],
    updatedBy: "Content Team",
    updatedOn: "07 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_vape_01",
    title: "Just Hold It For Me",
    category: "Vape Possession",
    targetGroup: "Secondary",
    status: "LIVE",
    safeDecisionRate: 79,
    previousSafeDecisionRate: 76,
    responses: 3315,
    competencies: ["HOLD", "DEFEND"],
    updatedBy: "Content Team",
    updatedOn: "05 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_qr_01",
    title: "Carpark QR Swap",
    category: "Phishing QR",
    targetGroup: "All Youth Bands",
    status: "LIVE",
    safeDecisionRate: 55,
    previousSafeDecisionRate: 55,
    responses: 812,
    competencies: ["SPOT", "IDENTIFY"],
    updatedBy: "Content Team",
    updatedOn: "18 Aug 2026",
    isFlashMission: true,
  },
  {
    id: "scn_gaming_01",
    title: "Free Skins, Just Log In",
    category: "Account Takeover",
    targetGroup: "Primary / Early Secondary",
    status: "LIVE",
    safeDecisionRate: 69,
    previousSafeDecisionRate: 64,
    responses: 4408,
    competencies: ["SPOT", "EVALUATE"],
    updatedBy: "Content Team",
    updatedOn: "01 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_loan_01",
    title: "Runner for a Day",
    category: "Unlicensed Moneylending",
    targetGroup: "Post-Secondary / Tertiary",
    status: "LIVE",
    safeDecisionRate: 63,
    previousSafeDecisionRate: 58,
    responses: 1544,
    competencies: ["EVALUATE", "LEAD"],
    updatedBy: "Content Team",
    updatedOn: "10 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_peer_theft_01",
    title: "Cover For Me",
    category: "Peer Shield · Shop Theft",
    targetGroup: "Secondary",
    status: "LIVE",
    safeDecisionRate: 77,
    previousSafeDecisionRate: 73,
    responses: 2670,
    competencies: ["DEFEND"],
    updatedBy: "Content Team",
    updatedOn: "08 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_deepfake_01",
    title: "That's Not Really Them",
    category: "Impersonation",
    targetGroup: "Secondary",
    status: "LIVE",
    safeDecisionRate: 61,
    previousSafeDecisionRate: 57,
    responses: 1180,
    competencies: ["IDENTIFY", "HOLD"],
    updatedBy: "Content Team",
    updatedOn: "16 Aug 2026",
    isFlashMission: true,
  },
  {
    id: "scn_parcel_01",
    title: "Your Parcel Is Held",
    category: "Phishing Link",
    targetGroup: "Primary / Early Secondary",
    status: "LIVE",
    safeDecisionRate: 64,
    previousSafeDecisionRate: 59,
    responses: 2054,
    competencies: ["SPOT", "HOLD"],
    updatedBy: "Content Team",
    updatedOn: "13 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_otp_01",
    title: "Just Read Me the Code",
    category: "Credential Request",
    targetGroup: "All Youth Bands",
    status: "LIVE",
    safeDecisionRate: 57,
    previousSafeDecisionRate: 52,
    responses: 1663,
    competencies: ["EVALUATE", "HOLD"],
    updatedBy: "Content Team",
    updatedOn: "15 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_group_chat_01",
    title: "The Group Chat Job",
    category: "Money Mule · Think–Vote–Explain",
    targetGroup: "Secondary",
    status: "LIVE",
    safeDecisionRate: 68,
    previousSafeDecisionRate: 61,
    responses: 946,
    competencies: ["LEAD", "DEFEND"],
    updatedBy: "Content Team",
    updatedOn: "19 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_draft_01",
    title: "Borrowed Login",
    category: "Account Sharing",
    targetGroup: "Secondary",
    status: "DRAFT",
    safeDecisionRate: 0,
    previousSafeDecisionRate: 0,
    responses: 0,
    competencies: ["HOLD"],
    updatedBy: "Content Team",
    updatedOn: "17 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_sched_01",
    title: "The Group Buy",
    category: "E-Commerce Scam",
    targetGroup: "All Youth Bands",
    status: "SCHEDULED",
    safeDecisionRate: 0,
    previousSafeDecisionRate: 0,
    responses: 0,
    competencies: ["SPOT", "EVALUATE"],
    updatedBy: "Content Team",
    updatedOn: "16 Aug 2026",
    isFlashMission: false,
  },
];

/**
 * Participants is a distinct count of youths in the demonstration cohort — not
 * the sum of responses, since one participant answers many scenarios.
 */
export const MOCK_PORTAL_PARTICIPANTS = 1248;

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: "in_support",
    kind: "SUPPORT",
    label: "Topic requiring more support",
    subject: "Account Sharing",
    value: "58%",
    note: "Safer-decision rate is the lowest across live content. Consider an additional teaching scenario.",
  },
  {
    id: "in_improved",
    kind: "IMPROVED",
    label: "Most improved",
    subject: "Shop Theft & Peer Pressure",
    value: "+9 pts",
    note: "Improvement since the revised debrief was published this cycle.",
  },
  {
    id: "in_peer",
    kind: "PEER_SHIELD",
    label: "Peer Shield",
    subject: "Appropriate intervention chosen",
    value: "72%",
    note: "Across all Peer Shield content. Private-warning and seek-help options combined.",
  },
];

/**
 * Aggregate S.H.I.E.L.D. skill coverage across live content.
 *
 * This answers "which prevention skills is our content actually teaching well?"
 * — a content-authoring question. It is not, and must never become, a per-youth
 * competency profile.
 */
export const MOCK_SKILL_COVERAGE: SkillCoverage[] = [
  { competency: "SPOT", coverage: 82, scenarios: 7 },
  { competency: "HOLD", coverage: 65, scenarios: 7 },
  { competency: "IDENTIFY", coverage: 71, scenarios: 3 },
  { competency: "EVALUATE", coverage: 67, scenarios: 6 },
  { competency: "LEAD", coverage: 79, scenarios: 4 },
  { competency: "DEFEND", coverage: 73, scenarios: 4 },
];

export const SAFEGUARDS: string[] = [
  "Aggregate learning analytics only",
  "No crime prediction",
  "No individual youth profiling",
  "No real banking or Singpass credentials used in scenarios",
  "Simulated scenario data",
  "Youth-submitted ideas reviewed before drafting — no direct publication",
  "Youth submissions carry a pseudonym and a band, never an identity",
  "Group discussion figures are simulated, never participant records",
];

export function derivePortalSummary(rows: AdminScenarioRow[]): PortalSummary {
  const live = rows.filter((r) => r.status === "LIVE");
  const scored = live.filter((r) => r.responses > 0);
  const average = scored.length
    ? Math.round(
        scored.reduce((sum, r) => sum + r.safeDecisionRate, 0) / scored.length,
      )
    : 0;
  return {
    activeScenarios: live.length,
    participants: MOCK_PORTAL_PARTICIPANTS,
    averageSafeDecisionRate: average,
    needsReview: scored.filter((r) => r.safeDecisionRate < 60).length,
  };
}
