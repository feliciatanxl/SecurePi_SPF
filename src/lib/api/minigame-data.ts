import {
  GUARDIAN_BEACON,
  GUARDIAN_BYTEBUDDY,
  GUARDIAN_CLUEPAW,
  GUARDIAN_ECHO,
  GUARDIAN_VERIFOX,
} from "@/lib/api/mock-data";
import {
  NODE_COMMUNITY_WHAT_NEXT,
  NODE_COMMUNITY_WHO_CAN_HELP,
  NODE_DECODE,
  NODE_RETAIL_CLUE_MATCH,
  NODE_SCHOOL_RISK_OR_SAFE,
  NODE_WORD_SEARCH,
} from "@/lib/api/world-data";
import type {
  DecodeClueGame,
  MatchGame,
  MiniGame,
  PredictGame,
  SortGame,
  WordSearchGame,
} from "@/lib/types";

/**
 * Mini-game content.
 *
 * Mini-games are reinforcement, never a replacement for the scenario engine.
 * Each one is deliberately short, pays a small reward next to a scenario
 * decision, and closes by handing the player back to a situation they have
 * played — recognition on its own is trivia.
 *
 * The word-search grid is authored, not generated. Two reasons: a server render
 * and the first client render must be byte-identical (a randomised grid would
 * cause a hydration mismatch), and an authored board can be checked to contain
 * each target word exactly once, so no selection is ambiguous.
 *
 *   col  0 1 2 3 4 5 6 7
 *   row0 A H D R P B A P
 *   row1 C U T H N S M A
 *   row2 C V N H Y C E S
 *   row3 O E E C P R G S
 *   row4 U V O R A A A W
 *   row5 N Y E D I E E O
 *   row6 T R A N S F E R
 *   row7 U R G E N C Y D
 *
 * ACCOUNT  ↓ from (0,0)   PASSWORD ↓ from (0,7)
 * TRANSFER → from (6,0)   URGENCY  → from (7,0)
 * VERIFY   ↘ from (2,1)   DARE     ↗ from (5,3)
 */

export const WORD_SEARCH_GAME: WordSearchGame = {
  id: "spot-the-warning-signs",
  kind: "WORD_SEARCH",
  nodeId: NODE_WORD_SEARCH,
  title: "Spot the Warning Signs",
  instruction: "Find the words that could signal a risky situation.",
  primaryCompetency: "SPOT",
  skillName: "VeriFox skill",
  skillTitle: "Recognition",
  skillLine: "The signals show up long before the loss does.",
  // Small on purpose. A mini-game is worth a fraction of a scenario decision.
  reward: {
    deltas: { coins: 60, trust: 4 },
    guardianId: GUARDIAN_VERIFOX,
  },
  grid: [
    "AHDRPBAP",
    "CUTHNSMA",
    "CVNHYCES",
    "OEECPRGS",
    "UVORAAAW",
    "NYEDIEEO",
    "TRANSFER",
    "URGENCYD",
  ],
  words: [
    {
      word: "URGENCY",
      row: 7,
      col: 0,
      dRow: 0,
      dCol: 1,
      meaning:
        "Pressure to act immediately can stop you from checking properly.",
    },
    {
      word: "ACCOUNT",
      row: 0,
      col: 0,
      dRow: 1,
      dCol: 0,
      meaning:
        "Nobody legitimate needs your personal account to move their money.",
    },
    {
      word: "TRANSFER",
      row: 6,
      col: 0,
      dRow: 0,
      dCol: 1,
      meaning:
        "Being asked to pass money onward is what turns a favour into an offence.",
    },
    {
      word: "PASSWORD",
      row: 0,
      col: 7,
      dRow: 1,
      dCol: 0,
      meaning:
        "A login you share is a login you no longer control. It stays your name on it.",
    },
    {
      word: "DARE",
      row: 5,
      col: 3,
      dRow: -1,
      dCol: 1,
      meaning:
        "A dare moves the decision from you to the group. The consequence does not move with it.",
    },
    {
      word: "VERIFY",
      row: 2,
      col: 1,
      dRow: 1,
      dCol: 1,
      meaning:
        "The one step that costs nothing and breaks most of these situations.",
    },
  ],
  transfer: {
    prompt: "Which warning sign appeared in the Easy Money scenario?",
    options: [
      "A deadline — “need your answer tonight”",
      "A signed employment contract",
      "A request to meet in person first",
    ],
    answerIndex: 0,
    explanation:
      "“Need your answer tonight” is urgency. The deadline was not about their schedule — it was there so you would not have time to check who you were dealing with.",
  },
};

export const DECODE_CLUE_GAME: DecodeClueGame = {
  id: "decode-the-clue",
  kind: "DECODE",
  nodeId: NODE_DECODE,
  title: "Decode the Clue",
  instruction: "Work out the prevention skill from the hint. Pick letters.",
  primaryCompetency: "HOLD",
  skillName: "Echo skill",
  skillTitle: "Consultation",
  skillLine: "Say it out loud before you act on it.",
  reward: {
    deltas: { coins: 40, trust: 3 },
    guardianId: GUARDIAN_ECHO,
  },
  attempts: 5,
  rounds: [
    {
      answer: "VERIFY",
      hint: "What should you do before trusting an unexpected request?",
      meaning:
        "Check the source through a channel you already trust — not the one that contacted you.",
    },
    {
      answer: "PRESSURE",
      hint: "What is being applied when you are told to decide right now?",
      meaning:
        "Naming it as pressure is what lets you step out of it. A real offer survives a delay.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Risk or Safe? — ByteBuddy · EVALUATE                                */
/* ------------------------------------------------------------------ */

/**
 * Six everyday digital requests, called one at a time.
 *
 * The call is the cheap part. What this activity is actually for is the line
 * underneath it: a player who marks "someone offers to pay you to receive
 * money" as risky because it *sounds* dodgy has learned nothing they can reuse,
 * so the explanation always names the specific signal rather than
 * congratulating them.
 *
 * Two of the six are genuinely safe. A set where everything is a scam teaches
 * suspicion rather than judgement — and a young person who treats every request
 * as a threat is no better protected than one who treats none of them as one.
 */
export const RISK_OR_SAFE_GAME: SortGame = {
  id: "risk-or-safe",
  kind: "SORT",
  nodeId: NODE_SCHOOL_RISK_OR_SAFE,
  title: "Risk or Safe?",
  instruction: "Call each request, then read what actually made it what it was.",
  primaryCompetency: "EVALUATE",
  skillName: "ByteBuddy skill",
  skillTitle: "Cyber Hygiene",
  skillLine: "Your account, your name, your problem.",
  reward: {
    deltas: { coins: 55, trust: 4 },
    guardianId: GUARDIAN_BYTEBUDDY,
  },
  cards: [
    {
      id: "ros_mule",
      situation:
        "Someone you met in a game chat offers to pay you if money can pass through your bank account first.",
      answer: "RISK",
      explanation:
        "This is money mule recruitment. The account is in your name, so the transfers are traced to you — not to whoever paid you to allow them.",
    },
    {
      id: "ros_school_login",
      situation:
        "Your school portal asks you to log in again, after a maintenance notice you saw on the school noticeboard.",
      answer: "SAFE",
      explanation:
        "You went to the service yourself and the notice came from a channel you can check. Not every login prompt is an attack — the question is always who started the contact.",
    },
    {
      id: "ros_job",
      situation:
        "A part-time job advert promises S$800 a week for “simple transfers”. No experience, no interview.",
      answer: "RISK",
      explanation:
        "Job scam. Real work pays for effort or skill; pay this far above the task is paying for the use of your identity and your account.",
    },
    {
      id: "ros_link",
      situation:
        "A text says your parcel is held, and links to a page asking for your card number to release it.",
      answer: "RISK",
      explanation:
        "Phishing. A courier does not need your card to release a parcel, and a link in an unexpected message is the least verifiable way to reach any company.",
    },
    {
      id: "ros_seller",
      situation:
        "A ticket seller you found on a marketplace asks you to pay outside the platform, by bank transfer, right now.",
      answer: "RISK",
      explanation:
        "E-commerce scam. Moving off the platform removes the only protection you had, and the urgency is there so you do not notice you have removed it.",
    },
    {
      id: "ros_friend",
      situation:
        "A friend asks you to look at a suspicious message with them before either of you replies to it.",
      answer: "SAFE",
      explanation:
        "This is the behaviour the whole programme is trying to build. Two people reading a message before anyone replies is the cheapest control there is.",
    },
  ],
  transfer: {
    prompt:
      "Across those six, what most reliably separated a risky request from a safe one?",
    options: [
      "Whether it needed your account, your login, or money moved through you",
      "Whether the message had spelling mistakes in it",
      "Whether the sender had a profile photo",
    ],
    answerIndex: 0,
    explanation:
      "Spelling and profile photos are easy to fix, and scams increasingly do fix them. What does not change is the ask: if a request needs your account, your login or money moved through you, that is the signal worth acting on.",
  },
};

/* ------------------------------------------------------------------ */
/* Clue Match — Cluepaw · IDENTIFY                                     */
/* ------------------------------------------------------------------ */

/**
 * Warning signs matched to the situations they usually turn up in.
 *
 * The right-hand column is authored in a fixed order rather than shuffled at
 * runtime, for the same reason the word-search grid is authored: a server
 * render and the first client render have to be identical, and a shuffle would
 * make them differ.
 */
export const CLUE_MATCH_GAME: MatchGame = {
  id: "clue-match",
  kind: "MATCH",
  nodeId: NODE_RETAIL_CLUE_MATCH,
  title: "Clue Match",
  instruction: "Pick a warning sign, then the situation it usually shows up in.",
  primaryCompetency: "IDENTIFY",
  skillName: "Cluepaw skill",
  skillTitle: "Situational Awareness",
  skillLine: "The detail that matters is already there.",
  reward: {
    deltas: { coins: 50, trust: 4 },
    guardianId: GUARDIAN_CLUEPAW,
  },
  promptLabel: "Warning sign",
  matchLabel: "Where it shows up",
  pairs: [
    {
      id: "cm_urgency",
      prompt: "“Answer tonight or the offer is gone”",
      match: "Money mule recruitment",
      note: "The deadline is not about their schedule. It is there so you cannot check who you are dealing with.",
    },
    {
      id: "cm_offplatform",
      prompt: "“Pay me directly, not through the app”",
      match: "E-commerce scam",
      note: "Leaving the platform removes the only record and the only protection either side had.",
    },
    {
      id: "cm_nointerview",
      prompt: "“No experience, no interview, paid weekly”",
      match: "Job scam",
      note: "Pay far above the task is not generosity. It is the price of using your name and your account.",
    },
    {
      id: "cm_link",
      prompt: "“Your account is suspended — verify here”",
      match: "Phishing link",
      note: "A real service is reachable the way you normally reach it. A link in an unexpected message is not that way.",
    },
    {
      id: "cm_voice",
      prompt: "“It is me, I lost my phone — send it to this number”",
      match: "Impersonation",
      note: "The account can be real while the person behind it is not. Check on a channel you already had.",
    },
    {
      id: "cm_nobody",
      prompt: "“Nobody is watching, just do it”",
      match: "Peer dare in a shop",
      note: "A dare moves the decision to the group. It does not move the consequence with it.",
    },
  ],
  /*
   * Deliberately not the order of `pairs`, so the activity is a match rather
   * than a row-by-row read down two aligned columns.
   */
  matchOrder: [
    "cm_link",
    "cm_nobody",
    "cm_urgency",
    "cm_voice",
    "cm_offplatform",
    "cm_nointerview",
  ],
  transfer: {
    prompt: "What do all six of those warning signs have in common?",
    options: [
      "Each one removes a step where you could have checked",
      "Each one comes from someone you have never met",
      "Each one involves money",
    ],
    answerIndex: 0,
    explanation:
      "Some come from strangers, some from people you know, and not all of them are about money. What they share is that each one removes a chance to check — the deadline, the direct payment, the link, the dare.",
  },
};

/* ------------------------------------------------------------------ */
/* Who Can Help? — Beacon · LEAD                                       */
/* ------------------------------------------------------------------ */

/**
 * Situations matched to the help that actually fits them.
 *
 * Deliberately generic. There are no hotline numbers, agency names or reporting
 * instructions anywhere in this fixture — inventing those in a prototype would
 * be worse than useless to a young person in a real situation. What it teaches
 * is the shape of the judgement: how far has this gone, and who is in a
 * position to act on it.
 */
export const WHO_CAN_HELP_GAME: MatchGame = {
  id: "who-can-help",
  kind: "MATCH",
  nodeId: NODE_COMMUNITY_WHO_CAN_HELP,
  title: "Who Can Help?",
  instruction: "Pick a situation, then the help that actually fits it.",
  primaryCompetency: "LEAD",
  skillName: "Beacon skill",
  skillTitle: "Safe Reporting",
  skillLine: "Know when and where to seek help.",
  reward: {
    deltas: { coins: 50, resilience: 8, trust: 4 },
    guardianId: GUARDIAN_BEACON,
  },
  promptLabel: "Situation",
  matchLabel: "Who fits",
  pairs: [
    {
      id: "wch_unsure",
      prompt: "A message feels off but you cannot say why.",
      match: "Someone you trust, before you reply",
      note: "Describing it out loud usually answers it. You do not need to be sure before you ask.",
    },
    {
      id: "wch_friend",
      prompt: "A friend has already sent their bank details to a stranger.",
      match: "A trusted adult, now rather than later",
      note: "This has gone past what peer advice can fix. Bringing an adult in is not telling on them.",
    },
    {
      id: "wch_school",
      prompt: "Someone at school keeps pressuring you to hold things for them.",
      match: "A teacher or school counsellor",
      note: "It is happening somewhere that already has people whose job is exactly this.",
    },
    {
      id: "wch_account",
      prompt: "You think someone else has got into your account.",
      match: "The service itself, through the app you already use",
      note: "Reach the service the way you normally do — never through a link someone sent you about it.",
    },
    {
      id: "wch_unsafe",
      prompt: "You feel unsafe right now, physically.",
      match: "An adult who is near you",
      note: "Distance matters more than expertise in this one. Reach whoever can actually get to you.",
    },
  ],
  matchOrder: [
    "wch_school",
    "wch_unsafe",
    "wch_unsure",
    "wch_account",
    "wch_friend",
  ],
  transfer: {
    prompt: "What decides which kind of help fits?",
    options: [
      "How far it has already gone, and who is in a position to act",
      "How embarrassing it would be to explain",
      "Whether you can prove what happened",
    ],
    answerIndex: 0,
    explanation:
      "You never need proof to ask, and embarrassment is the thing these situations rely on. The two questions that matter are how far it has gone, and who can actually do something about it.",
  },
};

/* ------------------------------------------------------------------ */
/* What Happens Next? — ByteBuddy · EVALUATE                           */
/* ------------------------------------------------------------------ */

/**
 * The Delayed Consequence Engine, turned into practice.
 *
 * Every round shows a decision that has already been made and what the person
 * got for it, then asks what follows. The engine's premise is that the reward
 * arrives before the cost; being able to name the cost while the reward is
 * still on screen is exactly the skill that premise is trying to build.
 *
 * The last round is deliberately not a loss. Peer intervention pays nothing
 * visible at the time, and a set where every prediction ends badly would teach
 * that caution is pointless rather than that consequences are delayed.
 */
export const WHAT_HAPPENS_NEXT_GAME: PredictGame = {
  id: "what-happens-next",
  kind: "PREDICT",
  nodeId: NODE_COMMUNITY_WHAT_NEXT,
  title: "What Happens Next?",
  instruction: "The choice is already made. Work out what follows it.",
  primaryCompetency: "EVALUATE",
  skillName: "ByteBuddy skill",
  skillTitle: "Consequence Reasoning",
  skillLine: "The payment arrives first. That is the design.",
  reward: {
    deltas: { coins: 55, trust: 5 },
    guardianId: GUARDIAN_BYTEBUDDY,
  },
  rounds: [
    {
      id: "whn_mule",
      setup:
        "Rina let a stranger send money into her account, and forwarded it on the same evening.",
      immediate: "+S$300, paid within the hour",
      prompt: "What is most likely to happen next?",
      options: [
        "Her account is restricted while the transfers are reviewed, and the questions come to her",
        "Nothing — the money already left her account",
        "The sender is contacted instead, because it was their money",
      ],
      answerIndex: 0,
      explanation:
        "The account is in Rina's name, so the trail stops at her. That the funds moved straight on is exactly what makes it look deliberate rather than accidental.",
    },
    {
      id: "whn_login",
      setup:
        "Marcus shared his game login with someone who promised free skins for the account.",
      immediate: "Skins delivered, visible in-game that night",
      prompt: "What is most likely to happen next?",
      options: [
        "The login is used or resold, and everything done on it still reads as Marcus",
        "The account stays safe, because he can change the password whenever he likes",
        "The skins are removed and nothing else changes",
      ],
      answerIndex: 0,
      explanation:
        "A shared login is a login you no longer control. Anything done on it — purchases, messages, approaching the next person — is done under his name.",
    },
    {
      id: "whn_tickets",
      setup:
        "Nadia paid a marketplace seller by bank transfer, because they offered a discount for paying off-platform.",
      immediate: "S$40 saved on two concert tickets",
      prompt: "What is most likely to happen next?",
      options: [
        "The seller stops replying, and the platform has no record of a sale to help with",
        "The platform refunds her, because the seller was listed there",
        "Her bank reverses the transfer on request",
      ],
      answerIndex: 0,
      explanation:
        "The discount was the price of leaving the only system that kept a record. A bank transfer you authorised is not a card payment — it does not simply come back on request.",
    },
    {
      id: "whn_speak",
      setup:
        "Wei saw the same offer in a group chat, and messaged his friend privately to hold off before replying.",
      immediate: "Nothing visible. No reward, no reaction in the chat.",
      prompt: "What is most likely to happen next?",
      options: [
        "His friend gets a way to step back without losing face in front of the group",
        "His friend is embarrassed, and goes ahead anyway",
        "Nothing, because one message never changes anyone's mind",
      ],
      answerIndex: 0,
      explanation:
        "Peer intervention almost never looks like a win at the time — that is what makes it hard. Raising it privately removes the audience, which is the single biggest reason people carry on with something they already doubt.",
    },
  ],
};

export const MINI_GAMES: MiniGame[] = [
  WORD_SEARCH_GAME,
  DECODE_CLUE_GAME,
  RISK_OR_SAFE_GAME,
  CLUE_MATCH_GAME,
  WHO_CAN_HELP_GAME,
  WHAT_HAPPENS_NEXT_GAME,
];

export function findMiniGame(id: string): MiniGame | undefined {
  return MINI_GAMES.find((g) => g.id === id);
}
