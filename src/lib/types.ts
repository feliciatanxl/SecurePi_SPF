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

  /* ---- Board, rewards and hub state (added with the roll-and-move layer) -- */

  /** Index of the board space the player token is standing on. */
  boardPosition: number;
  /**
   * Board spaces the player has landed on. Activity spaces take their
   * completed state from `completedActivities`; this covers the checkpoints,
   * which are visited rather than completed.
   */
  visitedSpaces: number[];
  /**
   * The learning/participation currency. Deliberately separate from `coins`,
   * which is virtual cash inside a scenario and part of the lesson — merging
   * the two would let a risky in-scenario payout buy cosmetics.
   */
  shieldTokens: number;
  /**
   * Grant keys already paid out, e.g. `mission:nd_digi_easy_money`. Every
   * award is keyed and checked here first, so replaying an activity or
   * reloading mid-run can never mint tokens twice.
   */
  tokenGrants: string[];
  unlockedRewards: string[];
  /** Slot → reward id. A slot with no entry is wearing nothing. */
  equippedRewards: Partial<Record<RewardSlot, string>>;
  /** Achievement ids already banked, so the +50 milestone pays once. */
  earnedAchievements: string[];
  /** District ids whose badge has been earned. */
  districtBadges: DistrictId[];
  /** Situation Card ids the player has met. Drives the Shield Casebook. */
  casebook: string[];
  onboardingComplete: boolean;
  /** Cosmetic marker chosen during onboarding. No personal data. */
  playerTokenId: string;
  settings: PlayerSettings;
  joinedSession: JoinedSession | null;
  learningChecks: Record<LearningCheckId, LearningCheckRecord>;
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

/**
 * Simulated distribution groups in the prototype's Deploy Flash Mission flow.
 *
 * These are demonstration cohorts. There is no participant database behind
 * them, and the portal never claims otherwise.
 */
export type SimulatedCohortId = "secondary" | "tertiary" | "community";

export const SIMULATED_COHORTS: { id: SimulatedCohortId; label: string }[] = [
  { id: "secondary", label: "Secondary Cohort" },
  { id: "tertiary", label: "ITE / Poly / JC Cohort" },
  { id: "community", label: "Community Pilot" },
];

/** Payload for the no-code "Deploy Flash Mission" form. */
export interface FlashMissionDraft {
  title: string;
  category: string;
  targetGroup: TargetGroup;
  prompt: string;
  choices: [string, string, string];
  /**
   * Which choice is the intended learning response.
   *
   * Author-facing only. It is recorded so the content team can see at a glance
   * what a scenario is teaching towards — it is never sent to a participant
   * before they answer, because a visibly correct option turns a judgement
   * exercise into a colour-matching one.
   */
  safeChoiceIndex: 0 | 1 | 2;
  safeResponse: string;
  competency: Competency;
  /** Guardian whose prevention skill this mission strengthens. */
  guardianId: string;
  debrief: string;
  /** Signals the debrief will point to. Short phrases, not sentences. */
  warningSigns: string[];
  /** Simulated distribution groups. No real participant list exists. */
  cohorts: SimulatedCohortId[];
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
  /**
   * Optional connective tissue for a recurring fictional character. This is
   * presentation metadata, not a dialogue engine: it gives chapter surfaces a
   * short story beat without changing how an activity runs or unlocks.
   */
  story?: {
    character: string;
    beat: string;
  };
  /** Optional chapter-facing role, e.g. "District finale". */
  chapterRole?: string;
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

/* ------------------------------------------------------------------ */
/* ShieldQuest City Board — roll-and-move gameplay layer               */
/* ------------------------------------------------------------------ */

/**
 * What a single space on the ShieldQuest City board represents.
 *
 * The board is an original roll-and-move track: it borrows the *rhythm* of a
 * tabletop game — take a turn, move, land, play — and nothing else. There is no
 * property, no rent, no chance/community pile, no jail and no board-game
 * trade dress of any kind. Every space resolves to something in the learning
 * model or to a piece of the player's own progress.
 */
export type BoardSpaceKind =
  | "SHIELD_CENTRAL"
  | "DISTRICT_CHECKPOINT"
  | "SCENARIO"
  | "PEER_SHIELD"
  | "MINI_GAME"
  | "SITUATION_CARD"
  | "GUARDIAN_CHECKPOINT"
  | "REWARD_CHECKPOINT";

export const BOARD_SPACE_LABEL: Record<BoardSpaceKind, string> = {
  SHIELD_CENTRAL: "Shield Central",
  DISTRICT_CHECKPOINT: "District Checkpoint",
  SCENARIO: "Scenario Mission",
  PEER_SHIELD: "Peer Shield",
  MINI_GAME: "Mini-Game",
  SITUATION_CARD: "Situation Card",
  GUARDIAN_CHECKPOINT: "Guardian Checkpoint",
  REWARD_CHECKPOINT: "Reward Checkpoint",
};

/**
 * A Situation Card.
 *
 * ShieldQuest's own card mechanic — deliberately NOT a chance draw. A card
 * never hands out or takes away anything on its own: it frames a realistic
 * situation and opens the activity that teaches it, so what the player walks
 * away with is decided by the decision they make inside that activity.
 */
export interface SituationCard {
  id: string;
  title: string;
  /** The situation, in the player's world. One or two sentences. */
  blurb: string;
  competency: Competency;
  guardianId: string;
  /** The city activity this card opens. */
  nodeId: string;
  /** Call to action on the card face, e.g. "Face the situation". */
  actionLabel: string;
  /** Casebook entry — the signals that were present. */
  warningSigns: string[];
  /** Casebook entry — what a safer response looks like. */
  saferResponse: string;
}

/** One position on the city track. */
export interface BoardSpace {
  /** Position along the route, 0-based. Also the persisted board position. */
  index: number;
  kind: BoardSpaceKind;
  /** Absent on Shield Central, which sits outside the four districts. */
  districtId?: DistrictId;
  title: string;
  /** Activity opened by this space, when it has one. */
  nodeId?: string;
  situationCardId?: string;
  /** Guardian checkpoints report progress toward this Guardian. */
  guardianId?: string;
}

/* ------------------------------------------------------------------ */
/* Shield Tokens, rewards and achievements                             */
/* ------------------------------------------------------------------ */

/**
 * Where a cosmetic is worn.
 *
 * Cosmetics are expression only. Nothing in this file can change a decision,
 * an outcome, a Guardian level or what the player is asked to do — a reward
 * that altered gameplay would make Shield Tokens a currency for advantage.
 */
export type RewardSlot =
  | "guardianAura"
  | "playerToken"
  | "routeTrail"
  | "profileFrame"
  | "boardMarker";

export type RewardCategory = "GUARDIANS" | "CITY_STYLE";

export interface Reward {
  id: string;
  category: RewardCategory;
  slot: RewardSlot;
  name: string;
  /** One line describing what it changes. Always cosmetic. */
  description: string;
  cost: number;
  /** Featured rewards lead the Rewards Hub. */
  featured?: boolean;
  /** Guardian cosmetics preview against their portrait. */
  guardianId?: string;
  /** Tailwind classes applied wherever the cosmetic shows. */
  swatch: string;
}

/** How an achievement's progress is counted. All personal, never compared. */
export type AchievementMetric =
  | { kind: "COMPETENCY"; competency: Competency }
  | { kind: "NODE_KIND"; nodeKind: NodeKind }
  | { kind: "GUARDIAN"; guardianId: string }
  | { kind: "SKILL_BREADTH" };

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  metric: AchievementMetric;
}

export interface ResolvedAchievement extends Achievement {
  progress: number;
  earned: boolean;
}

/** A district badge, earned by finishing everything playable in a district. */
export interface DistrictBadge {
  districtId: DistrictId;
  name: string;
  blurb: string;
}

/* ------------------------------------------------------------------ */
/* Player preferences                                                  */
/* ------------------------------------------------------------------ */

export interface PlayerSettings {
  sound: boolean;
  /** Forces reduced motion on top of the OS-level preference, never below it. */
  reducedMotion: boolean;
  textSize: "standard" | "large";
  highContrast: boolean;
}

export const DEFAULT_SETTINGS: PlayerSettings = {
  sound: true,
  reducedMotion: false,
  textSize: "standard",
  highContrast: false,
};

/** A facilitated session the player joined. Prototype flow — no backend. */
export interface JoinedSession {
  code: string;
  name: string;
  audience: string;
  focus: string;
}

/** One answered question in a pre/post learning check. */
export interface CheckResponse {
  questionId: string;
  optionId: string;
}

export type LearningCheckId = "pre" | "post";

/**
 * A completed learning check.
 *
 * Responses are kept so the check can be reviewed, and are deliberately NOT
 * turned into a score, a percentage or a rating of the person who answered.
 */
export interface LearningCheckRecord {
  id: LearningCheckId;
  completed: boolean;
  responses: CheckResponse[];
}

export interface LearningCheckQuestion {
  id: string;
  situation: string;
  prompt: string;
  /** Presented in a neutral order and styling. No option is marked correct. */
  options: { id: string; label: string }[];
  /** Which conceptual dimension this question relates to. */
  dimension: LearningDimension;
}

export type LearningDimension =
  | "RISK_RECOGNITION"
  | "DECISION_REASONING"
  | "CONSEQUENCE_AWARENESS"
  | "PEER_INTERVENTION";

export const LEARNING_DIMENSION_LABEL: Record<LearningDimension, string> = {
  RISK_RECOGNITION: "Risk recognition",
  DECISION_REASONING: "Decision reasoning",
  CONSEQUENCE_AWARENESS: "Consequence awareness",
  PEER_INTERVENTION: "Peer intervention confidence",
};
