/**
 * ShieldQuest — shared domain types.
 *
 * These mirror the contracts the Node.js/TypeScript backend will expose. In the
 * production system this file lives in a shared `@shieldquest/contracts` package
 * consumed by both the API service and this client, so the two can never drift.
 * Nothing in here depends on React or on the mock layer.
 */

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

/** How a choice is judged. Drives scoring, analytics and the debrief copy. */
export type ChoiceOutcome = "SAFE" | "CAUTIOUS" | "RISKY";

export type ScenarioMode = "ENCOUNTER" | "PEER_SHIELD";

export interface ScenarioMessage {
  id: string;
  /** `system` frames the scene, `them` is the other party, `you` is the player. */
  author: "system" | "them" | "you";
  displayName?: string;
  body: string;
}

/**
 * A consequence that is deliberately *not* shown at decision time. The engine
 * schedules it and surfaces it after `delayMs`, which is the core teaching
 * mechanic: risky choices pay out now and charge later.
 */
export interface DelayedConsequence {
  headline: string;
  body: string;
  /** Milliseconds after the choice before the consequence surfaces. */
  delayMs: number;
  /** Applied to the player's wallet when the consequence fires (usually negative). */
  coinDelta: number;
  debrief: string;
  competency: Competency;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  /** Short line explaining the shape of the option, shown under the label. */
  hint?: string;
  /** What gets appended to the transcript as the player's reply. */
  reply: string;
  outcome: ChoiceOutcome;
  /** Immediate, visible reward. Risky options intentionally pay the most. */
  immediate: {
    coinDelta: number;
    resilienceDelta: number;
    /** Toast copy shown the instant the choice is made. */
    flash: string;
  };
  /** Present only when the true cost is deferred. */
  delayed?: DelayedConsequence;
  /** Shown in the inline debrief for non-delayed outcomes. */
  feedback: string;
}

export interface Scenario {
  id: string;
  mode: ScenarioMode;
  title: string;
  /** e.g. "Money Mule Recruitment" — the SPF-facing threat classification. */
  threatType: string;
  competencies: Competency[];
  /** Framing line rendered above the transcript. */
  prompt: string;
  messages: ScenarioMessage[];
  choices: ScenarioChoice[];
}

/** Running player state. Server-authoritative in production. */
export interface PlayerProfile {
  handle: string;
  cohort: string;
  coins: number;
  /** Earned only in Peer Shield Mode — the bystander-intervention currency. */
  resiliencePoints: number;
  guardiansUnlocked: number;
  guardiansTotal: number;
}

/** What the client sends when a choice is committed. */
export interface ChoiceSubmission {
  scenarioId: string;
  choiceId: string;
  /** Milliseconds from scenario render to commit — feeds the impulse-control metric. */
  deliberationMs: number;
}

export interface ChoiceResult {
  outcome: ChoiceOutcome;
  flash: string;
  coinDelta: number;
  resilienceDelta: number;
  feedback: string;
  /** The engine echoes this back so the client can schedule the reveal. */
  delayed?: DelayedConsequence;
}

/* ------------------------------------------------------------------ */
/* Admin / Scenario Management Portal                                  */
/* ------------------------------------------------------------------ */

export type ScenarioStatus = "LIVE" | "DRAFT" | "SCHEDULED" | "ARCHIVED";

export type AgeGroup = "13–15" | "16–18" | "19–21" | "13–21";

export interface AdminScenarioRow {
  id: string;
  title: string;
  threatType: string;
  ageGroup: AgeGroup;
  status: ScenarioStatus;
  /** Percentage of players choosing a SAFE option. The headline efficacy metric. */
  safeDecisionRate: number;
  /** Same metric one week earlier, so the table can show direction of travel. */
  previousSafeDecisionRate: number;
  plays: number;
  competencies: Competency[];
  updatedBy: string;
  updatedOn: string;
  isFlashMission: boolean;
}

/** Payload for the no-code "Deploy Flash Mission" form. */
export interface FlashMissionDraft {
  title: string;
  threatType: string;
  ageGroup: AgeGroup;
  competency: Competency;
  situation: string;
  safeAction: string;
  runsForDays: number;
}
