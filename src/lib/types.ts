/**
 * ShieldQuest — shared domain types.
 *
 * These mirror the contracts the Node.js/TypeScript backend will expose. In the
 * production system this file lives in a shared `@shieldquest/contracts` package
 * consumed by both the API service and this client, so the two can never drift.
 * Nothing in here depends on React or on the mock layer.
 */

/* ------------------------------------------------------------------ */
/* S.H.I.E.L.D. behavioural framework                                  */
/* ------------------------------------------------------------------ */

/** The six S.H.I.E.L.D. competencies every piece of content is tagged against. */
export type Competency =
  | "SPOT"
  | "HOLD"
  | "IDENTIFY"
  | "EVALUATE"
  | "LEAD"
  | "DEFEND";

export const COMPETENCY_LABEL: Record<Competency, string> = {
  SPOT: "Spot the Risk",
  HOLD: "Hold Before Acting",
  IDENTIFY: "Identify the Influence",
  EVALUATE: "Evaluate the Consequences",
  LEAD: "Lead the Right Choice",
  DEFEND: "Defend Your Community",
};

/** Framework order, used anywhere the six skills are listed together. */
export const COMPETENCY_ORDER: Competency[] = [
  "SPOT",
  "HOLD",
  "IDENTIFY",
  "EVALUATE",
  "LEAD",
  "DEFEND",
];

/** The single letter shown on in-gameplay skill badges. */
export const COMPETENCY_LETTER: Record<Competency, string> = {
  SPOT: "S",
  HOLD: "H",
  IDENTIFY: "I",
  EVALUATE: "E",
  LEAD: "L",
  DEFEND: "D",
};

/* ------------------------------------------------------------------ */
/* Player-facing scenarios                                             */
/* ------------------------------------------------------------------ */

/** How a choice is judged. Drives scoring, analytics and the debrief copy. */
export type ChoiceOutcome = "SAFE" | "CAUTIOUS" | "RISKY";

export type ScenarioMode = "ENCOUNTER" | "PEER_SHIELD";

export type Difficulty = "Easy" | "Medium" | "Hard";

/** Every stat the player can move in one decision. */
export interface Deltas {
  coins?: number;
  resilience?: number;
  trust?: number;
  risk?: number;
}

export interface ScenarioMessage {
  id: string;
  /** `system` frames the scene, `them` is the other party, `you` is the player. */
  author: "system" | "them" | "you";
  displayName?: string;
  body: string;
  /** Rendered under the sender name on the first message of a run. */
  meta?: string;
}

/** An optional, non-blocking hint the player can tag before deciding. */
export interface Clue {
  id: string;
  label: string;
  /** Shown once the clue is tagged. */
  note: string;
}

/**
 * A consequence that is deliberately *not* shown at decision time. The engine
 * schedules it and surfaces it after `delayMs`, which is the core teaching
 * mechanic: risky choices pay out now and charge later.
 */
export interface DelayedConsequence {
  /** Milliseconds after the choice before the consequence surfaces. */
  delayMs: number;
  /** e.g. "3 days later" — the time-passage framing. */
  timeLabel: string;
  headline: string;
  body: string;
  /** Applied to the player's stats when the consequence fires. */
  deltas: Deltas;
  /** "What changed" — what the player was given at the time. */
  changedImmediate: string[];
  /** "What changed" — what it cost afterwards. */
  changedLater: string[];
  /** "Why this mattered" — the signals present in the scenario. */
  warningSigns: string[];
  saferResponse: string;
  competency: Competency;
}

/** The teaching payload shown after any decision resolves. */
export interface DecisionDebrief {
  /** e.g. "Good call", "Peer Shield success", "You took the offer". */
  headline: string;
  body: string;
  /** Ticked list of signals the decision correctly acted on. */
  spotted?: string[];
  /** A worked example of what the player could say. Peer Shield only. */
  sampleScript?: string;
  saferResponse?: string;
  competency: Competency;
  /** Guardian strengthened by this decision, if any. */
  guardianId?: string;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  /** Short line explaining the shape of the option, shown under the label. */
  hint?: string;
  /** What gets appended to the transcript as the player's reply. */
  reply: string;
  outcome: ChoiceOutcome;
  /**
   * The immediate, visible payoff. Risky options intentionally pay the most —
   * the reward has to feel genuinely good before the delayed cost lands.
   */
  immediate: {
    deltas: Deltas;
    /** Toast headline, e.g. "Payment received". */
    flashTitle: string;
    /** Toast figure, e.g. "+300 Coins". */
    flashAmount?: string;
  };
  /** Present only when the true cost is deferred. */
  delayed?: DelayedConsequence;
  debrief: DecisionDebrief;
}

export interface Scenario {
  id: string;
  mode: ScenarioMode;
  title: string;
  /** e.g. "Money Mule Recruitment" — the threat classification. */
  category: string;
  /** One-line hook shown in the mission header. */
  hook: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  primaryCompetency: Competency;
  competencies: Competency[];
  /** Position of the decision within the mission, e.g. 2 of 4. */
  step: number;
  totalSteps: number;
  /** Framing line rendered above the transcript. */
  prompt: string;
  messages: ScenarioMessage[];
  /** Optional clue inspection. Never required to progress. */
  clueQuestion?: string;
  clues?: Clue[];
  choices: ScenarioChoice[];
}

/**
 * A flat mission teaser. Superseded on the home screen by the city board's
 * `MissionNode`, and retained because the backend contract still exposes it for
 * list-style surfaces (notifications, a cohort digest) outside the board.
 */
export interface MissionSummary {
  id: string;
  /** Set when the mission is playable in this prototype. */
  scenarioId?: string;
  category: string;
  title: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  primaryCompetency: Competency;
  /** Locked missions are shown but not playable. */
  locked: boolean;
  lockedNote?: string;
}

/* ------------------------------------------------------------------ */
/* Player state                                                        */
/* ------------------------------------------------------------------ */

/** Running player state. Server-authoritative in production. */
export interface PlayerProfile {
  handle: string;
  cohort: string;
  coins: number;
  /** Earned through Peer Shield — the bystander-intervention currency. */
  resiliencePoints: number;
  /** 0–100. Rises with verified, considered decisions. */
  trust: number;
  /** 0–100. Rises with exposure the player accepted. */
  risk: number;
  missionsCompleted: number;
  streakDays: number;
  currentGuardianId: string;
  /** Guardian id → decisions completed toward the next level. */
  guardianProgress: Record<string, number>;
  /**
   * Ids of city activities the player has finished. Drives World Progress and
   * district unlocks. Personal learning progress only — never ranked or
   * compared against another participant.
   */
  completedActivities: string[];
  /** Where the player's marker currently sits on the city board. */
  currentDistrictId: DistrictId;
}

export interface Guardian {
  id: string;
  name: string;
  /** e.g. "Verification". */
  skill: string;
  motto: string;
  competency: Competency;
  /** Qualifying decisions needed to reach the next level. */
  target: number;
  description: string;
  unlocked: boolean;
}

/** What the client sends when a choice is committed. */
export interface ChoiceSubmission {
  scenarioId: string;
  choiceId: string;
  /** Milliseconds from scenario render to commit — feeds the impulse-control metric. */
  deliberationMs: number;
  /** Clues the player tagged before deciding. Aggregated, never attributed. */
  cluesTagged: string[];
}

export interface ChoiceResult {
  outcome: ChoiceOutcome;
  flashTitle: string;
  flashAmount?: string;
  deltas: Deltas;
  debrief: DecisionDebrief;
  /** The engine echoes this back so the client can schedule the reveal. */
  delayed?: DelayedConsequence;
}

/* ------------------------------------------------------------------ */
/* Admin · Scenario Management Portal                                  */
/* ------------------------------------------------------------------ */

export type ScenarioStatus = "LIVE" | "DRAFT" | "SCHEDULED" | "ARCHIVED";

export type TargetGroup =
  | "Secondary"
  | "ITE / Poly / JC"
  | "Secondary / Tertiary"
  | "All youth cohorts";

export interface AdminScenarioRow {
  id: string;
  title: string;
  category: string;
  targetGroup: TargetGroup;
  status: ScenarioStatus;
  /**
   * Percentage of responses selecting a safer option. This measures CONTENT
   * difficulty — which topics need more teaching support — never individual
   * participants.
   */
  safeDecisionRate: number;
  /** Same measure one review cycle earlier, for direction of travel. */
  previousSafeDecisionRate: number;
  responses: number;
  competencies: Competency[];
  updatedBy: string;
  updatedOn: string;
  isFlashMission: boolean;
}

export interface PortalSummary {
  activeScenarios: number;
  participants: number;
  averageSafeDecisionRate: number;
  needsReview: number;
}

export type InsightKind = "SUPPORT" | "IMPROVED" | "PEER_SHIELD";

export interface Insight {
  id: string;
  kind: InsightKind;
  /** e.g. "Topic requiring more support". */
  label: string;
  /** e.g. "Account Sharing". */
  subject: string;
  /** e.g. "58%". */
  value: string;
  note: string;
}

/** Payload for the no-code "Deploy Flash Mission" form. */
export interface FlashMissionDraft {
  title: string;
  category: string;
  targetGroup: TargetGroup;
  prompt: string;
  choices: [string, string, string];
  safeResponse: string;
  competency: Competency;
  debrief: string;
  status: Extract<ScenarioStatus, "LIVE" | "DRAFT">;
}

/* ------------------------------------------------------------------ */
/* ShieldQuest City — districts, mission nodes, progression            */
/* ------------------------------------------------------------------ */

/** The four districts of ShieldQuest City. */
export type DistrictId = "school" | "retail" | "digi" | "community";

/**
 * What kind of activity a node on the city board represents. The distinction is
 * pedagogical, not cosmetic: SCENARIO carries the behavioural decision engine,
 * MINI_GAME reinforces recognition, PEER_SHIELD practises bystander
 * intervention, GUARDIAN_CHALLENGE targets one named prevention skill.
 */
export type NodeKind =
  | "SCENARIO"
  | "MINI_GAME"
  | "PEER_SHIELD"
  | "GUARDIAN_CHALLENGE";

export const NODE_KIND_LABEL: Record<NodeKind, string> = {
  SCENARIO: "Scenario Mission",
  MINI_GAME: "Mini-Game",
  PEER_SHIELD: "Peer Shield",
  GUARDIAN_CHALLENGE: "Guardian Challenge",
};

/**
 * Why a node is not yet playable.
 *
 * `UNLOCK` is earned through completion inside the same district. `PLANNED` is
 * content that is designed but deliberately out of scope for this prototype —
 * it is labelled as such rather than pretending to be earnable.
 */
export type NodeAvailability = "OPEN" | "UNLOCK" | "PLANNED";

/** One stop on a district's route. */
export interface MissionNode {
  id: string;
  districtId: DistrictId;
  kind: NodeKind;
  title: string;
  /** One line describing what the player will practise. */
  summary: string;
  primaryCompetency: Competency;
  /** Guardian whose skill this node strengthens, when there is one. */
  guardianId?: string;
  estimatedMinutes: number;
  availability: NodeAvailability;
  /**
   * Activities that must be completed in this district before an `UNLOCK` node
   * opens. Progress is always the player's own — never compared to anyone else.
   */
  requiredInDistrict?: number;
  /** Where the node leads once open. Absent for PLANNED content. */
  href?: string;
}

export interface District {
  id: DistrictId;
  name: string;
  /** Short hook shown on the board tile. */
  tagline: string;
  /** What this district teaches, in plain language. */
  topics: string[];
  /**
   * Board position as a percentage of the map frame, used on the wide board
   * layout. The vertical mobile route ignores it and uses document order.
   */
  position: { x: number; y: number };
  nodes: MissionNode[];
}

/** Per-district slice of the player's own learning progress. */
export interface DistrictProgress {
  districtId: DistrictId;
  name: string;
  completed: number;
  total: number;
}

export interface WorldProgress {
  completed: number;
  total: number;
  districts: DistrictProgress[];
}

/* ------------------------------------------------------------------ */
/* Mini-games                                                          */
/* ------------------------------------------------------------------ */

export type MiniGameId = "spot-the-warning-signs" | "decode-the-clue";

export type MiniGameKind = "WORD_SEARCH" | "DECODE";

/** Reward for finishing a mini-game. Deliberately small next to a scenario. */
export interface MiniGameReward {
  deltas: Deltas;
  guardianId: string;
}

interface MiniGameBase {
  id: MiniGameId;
  kind: MiniGameKind;
  /** Matches the `MissionNode.id` so completion is recorded against the board. */
  nodeId: string;
  title: string;
  instruction: string;
  primaryCompetency: Competency;
  reward: MiniGameReward;
  /** Eyebrow on the completion card, e.g. "VeriFox skill". */
  skillName: string;
  /** The named skill this activity built, e.g. "Verification". */
  skillTitle: string;
  /** One line on what that skill means in practice. */
  skillLine: string;
}

/** A word the player has to find, with the meaning revealed on discovery. */
export interface WordSearchWord {
  word: string;
  /** Row of the first letter, zero-indexed. */
  row: number;
  col: number;
  /** Unit step per letter, so any of the eight directions can be authored. */
  dRow: number;
  dCol: number;
  /** Why this word signals risk. Shown the moment it is found. */
  meaning: string;
}

/**
 * A short multiple-choice question that ties the mini-game back to a scenario.
 *
 * This is the point of the mini-game: recognition on its own is trivia, so the
 * activity always closes by asking the player to place the pattern back into a
 * situation they have played.
 */
export interface TransferQuestion {
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answerIndex: number;
  /** Explanation shown after answering, whichever option was chosen. */
  explanation: string;
}

export interface WordSearchGame extends MiniGameBase {
  kind: "WORD_SEARCH";
  /** Square grid, one string per row. Authored, never generated at runtime. */
  grid: string[];
  words: WordSearchWord[];
  transfer: TransferQuestion;
}

/** One round of Decode the Clue. */
export interface DecodeRound {
  answer: string;
  hint: string;
  /** Shown once the round is solved. */
  meaning: string;
}

export interface DecodeClueGame extends MiniGameBase {
  kind: "DECODE";
  rounds: DecodeRound[];
  /** Wrong guesses allowed per round, shown as signal strength. */
  attempts: number;
}

export type MiniGame = WordSearchGame | DecodeClueGame;

/* ------------------------------------------------------------------ */
/* Admin · aggregate skill coverage                                    */
/* ------------------------------------------------------------------ */

/**
 * How well each S.H.I.E.L.D. skill is being exercised across live content.
 * Aggregate and content-level only — this says nothing about any participant.
 */
export interface SkillCoverage {
  competency: Competency;
  /** Percentage of responses on that skill's content choosing a safer option. */
  coverage: number;
  /** Live scenarios currently teaching this skill. */
  scenarios: number;
}
