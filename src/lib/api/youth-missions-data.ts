import type { GroupDecisionSignal, YouthMissionSubmission } from "@/lib/types";

/**
 * Youth-Created Missions — a simulated moderation pipeline.
 *
 * ## What this is
 *
 * Project SHIELD's design has young people proposing the situations they
 * actually meet, because a prevention programme written entirely by adults
 * tends to teach the scams adults get. This queue demonstrates what has to
 * happen between a young person's idea and anything a player ever sees.
 *
 * ## What this is not
 *
 * There is no submission form, no intake service, no database and no real
 * young person behind any row below. Every entry is fictionalised. The
 * "submitter" is a programme pseudonym and a cohort band — deliberately the
 * only two fields present, because a real intake should not be collecting a
 * name, a school, a class or a contact detail to accept an idea about a scam.
 *
 * ## The safeguarding rules the shape enforces
 *
 *  - Nothing publishes itself. Every route out of `AWAITING_REVIEW` requires a
 *    reviewer to act, and `CONVERTED` produces a **draft**, never live content.
 *  - Every row carries the safeguarding points a reviewer has to weigh, filled
 *    in up front rather than being a tick box at the end.
 *  - There is no anonymous-publish path, and no state that skips review.
 */
export const MOCK_YOUTH_SUBMISSIONS: YouthMissionSubmission[] = [
  {
    id: "ym_001",
    title: "The Study Group That Wanted My Login",
    category: "Credential Request",
    suggestedBand: "Secondary",
    proposedCompetency: "EVALUATE",
    summary:
      "Someone in a study group chat asks for your school portal login so they can “download the notes for everyone”. It sounds helpful and everyone in the chat agrees it is fine.",
    intendedLesson:
      "A request can be socially normal and still be a bad idea. Whatever happens on that login is under your name.",
    submittedBy: "Contributor 7F2A",
    submittedOn: "18 Aug 2026",
    submitterBand: "Secondary",
    status: "AWAITING_REVIEW",
    safeguardingFlags: [
      "Uses a school system as the setting — check it cannot identify a real school",
      "No credential format or real portal should appear in the scenario text",
    ],
  },
  {
    id: "ym_002",
    title: "Reselling Concert Tickets I Never Had",
    category: "E-Commerce Scam",
    suggestedBand: "Post-Secondary / Tertiary",
    proposedCompetency: "IDENTIFY",
    summary:
      "You are offered a “bulk buy” of resale tickets to flip for profit. The seller wants payment first and says the tickets transfer after.",
    intendedLesson:
      "Being the seller in a scam is a role people fall into, not only one they choose. Handling money for someone else's listing makes it yours.",
    submittedBy: "Contributor B41C",
    submittedOn: "17 Aug 2026",
    submitterBand: "Post-Secondary / Tertiary",
    status: "AWAITING_REVIEW",
    safeguardingFlags: [
      "Frames the player as a potential participant — the debrief must not read as instructions",
      "Avoid naming a real ticketing platform",
    ],
  },
  {
    id: "ym_003",
    title: "My Cousin Needs a Bank Account",
    category: "Money Mule Recruitment",
    suggestedBand: "Post-Secondary / Tertiary",
    proposedCompetency: "HOLD",
    summary:
      "A family member — not a stranger — asks to use your account “just this once” because theirs is frozen. Saying no feels like accusing them of something.",
    intendedLesson:
      "The hardest version of this is not a stranger. Family pressure removes the option of just blocking them.",
    submittedBy: "Contributor 9D0E",
    submittedOn: "16 Aug 2026",
    submitterBand: "Post-Secondary / Tertiary",
    status: "AWAITING_REVIEW",
    safeguardingFlags: [
      "Family setting — the debrief must not push a young person to confront a relative",
      "Needs a route to trusted help that does not require accusing anybody",
    ],
  },
  {
    id: "ym_004",
    title: "Free Robux Generator",
    category: "Account Takeover",
    suggestedBand: "Primary / Early Secondary",
    proposedCompetency: "SPOT",
    summary:
      "A video promises free in-game currency if you log in through a link in the description. Half the class has already tried it.",
    intendedLesson:
      "If everyone is doing it, that is not evidence it works — it is evidence the approach is working on people.",
    submittedBy: "Contributor 22B8",
    submittedOn: "15 Aug 2026",
    submitterBand: "Secondary",
    status: "CHANGES_REQUESTED",
    reviewedBy: "Content Lead (prototype)",
    reviewNote:
      "Good instinct and the right age band. Needs rewriting without the branded currency name, and the debrief should not describe how the generator page works.",
    safeguardingFlags: [
      "Names a real game currency — must be genericised before drafting",
      "Younger band: keep the language simple and avoid technical detail",
    ],
  },
  {
    id: "ym_005",
    title: "The Group Chat That Turned On Someone",
    category: "Peer Shield · Harassment",
    suggestedBand: "Secondary",
    proposedCompetency: "DEFEND",
    summary:
      "A class chat starts piling on one person. You have not said anything, but you are still in the chat and you have not left either.",
    intendedLesson:
      "Being a silent witness is a position, not a neutral one. There is something to do that is not a confrontation.",
    submittedBy: "Contributor 5A17",
    submittedOn: "14 Aug 2026",
    submitterBand: "Secondary",
    status: "CONVERTED",
    reviewedBy: "Content Lead (prototype)",
    reviewNote:
      "Converted to a Peer Shield draft. Held for a safeguarding read before it goes any further — harassment content needs a support route in the debrief.",
    safeguardingFlags: [
      "Harassment theme — debrief must route to trusted help, not to retaliation",
      "Must not model the pile-on language itself in the transcript",
    ],
  },
  {
    id: "ym_006",
    title: "Selling My Old Account for Cash",
    category: "Account Sharing",
    suggestedBand: "Secondary",
    proposedCompetency: "EVALUATE",
    summary:
      "Someone offers to buy a gaming account you have stopped using. It feels like selling something you own.",
    intendedLesson:
      "An account is not a possession you can hand over cleanly. It stays linked to the person who made it.",
    submittedBy: "Contributor E3C9",
    submittedOn: "13 Aug 2026",
    submitterBand: "Secondary",
    status: "AWAITING_REVIEW",
    safeguardingFlags: [
      "Check the debrief does not read as advice on how to sell an account safely",
    ],
  },
  {
    id: "ym_007",
    title: "Rate My Friend's Scam Message",
    category: "Uncategorised",
    suggestedBand: "All Youth Bands",
    proposedCompetency: "SPOT",
    summary:
      "A submission proposing that players upload real messages they have received and have other players rate how suspicious they are.",
    intendedLesson:
      "Submitter's stated aim was to use real examples so the content stays current.",
    submittedBy: "Contributor 08FD",
    submittedOn: "11 Aug 2026",
    submitterBand: "Post-Secondary / Tertiary",
    status: "REJECTED",
    reviewedBy: "Content Lead (prototype)",
    reviewNote:
      "Not taken forward as proposed. Player-uploaded real messages would put personal data and identifiable third parties into the platform, and youth-rating-youth content is outside what this programme will do. The underlying idea — keeping examples current — is being picked up through the authored library instead.",
    safeguardingFlags: [
      "User-generated uploads would carry personal data and identifiable third parties",
      "Peer rating of peer content is out of scope for this programme",
    ],
  },
];

/**
 * Simulated Think–Vote–Explain signals.
 *
 * Aggregate, content-level and fictional. These say how a *question* behaved
 * in a demonstration session — never how any participant behaved. There is no
 * individual response anywhere in this shape and deliberately nowhere to put
 * one, which is the same rule the rest of the portal follows.
 */
export const MOCK_GROUP_DECISION_SIGNALS: GroupDecisionSignal[] = [
  {
    id: "gds_group_chat_job",
    question: "The Group Chat Job — what should the group do?",
    band: "Secondary",
    responses: 168,
    initialSafePct: 25,
    finalSafePct: 61,
    reconsideredPct: 44,
    topFactor: "He would lose face in front of the group",
  },
  {
    id: "gds_mule_family",
    question: "A relative asks to use your bank account — do you agree?",
    band: "Post-Secondary / Tertiary",
    responses: 124,
    initialSafePct: 48,
    finalSafePct: 66,
    reconsideredPct: 27,
    topFactor: "Saying no feels like accusing them",
  },
  {
    id: "gds_ecom",
    question: "A seller wants payment off-platform for a discount — pay?",
    band: "All Youth Bands",
    responses: 211,
    initialSafePct: 63,
    finalSafePct: 71,
    reconsideredPct: 15,
    topFactor: "The discount is the whole reason to leave the platform",
  },
];
