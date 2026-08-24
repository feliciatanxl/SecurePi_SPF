import type { EngagementMetric, PilotKpi } from "@/lib/types";

/**
 * KPI 6 — Engagement.
 *
 * Four aggregate figures: were sessions finished, were scenarios finished, did
 * anybody choose to run one again, and how long did participation actually last.
 * Together they answer "is the experience being used", which is a question about
 * the programme.
 *
 * ## These numbers are authored
 *
 * Every value below is a demonstration value, written by hand to be plausible
 * for a prototype walkthrough. Nothing here was measured, because there has been
 * no pilot: there is no telemetry pipeline in this build, no participant records
 * and no cohort. The panel that renders them says so on screen, and the figures
 * are deliberately unflattering enough to be credible — a voluntary replay rate
 * of 31% is what a real one might look like, and 95% would have been a nicer
 * slide and an obvious fiction.
 *
 * ## And they are aggregate only
 *
 * There is no per-participant engagement score in this build, and adding one
 * would be the wrong thing: engagement is a property of the session, not a
 * rating of a young person. Nothing here can be resolved to an individual.
 */
export const ENGAGEMENT_METRICS: EngagementMetric[] = [
  {
    id: "eng_session",
    label: "Session completion",
    value: "84%",
    note: "Facilitated sessions carried through to the closing debrief.",
  },
  {
    id: "eng_scenario",
    label: "Scenario completion",
    value: "79%",
    note: "Scenarios opened that reached a committed decision and its debrief.",
  },
  {
    id: "eng_replay",
    label: "Voluntary replay",
    value: "31%",
    note: "Activities re-run by choice, with no additional reward for doing so.",
  },
  {
    id: "eng_duration",
    label: "Average participation duration",
    value: "18m 40s",
    note: "Time spent in activities per session. Aggregate, never per participant.",
  },
];

/**
 * The six-KPI pilot evaluation framework, mapped honestly onto this build.
 *
 * The point of stating it here is the `status` column. Four of the six have a
 * mechanism in the prototype that a pilot would read from; one has authored
 * figures; one cannot be measured by a local prototype at all. Saying which is
 * which is the difference between an evaluation plan and a claim of results —
 * and this prototype has not run the funded youth pilot, so it has no results to
 * claim. No figure anywhere in this build should be read as evidence that
 * ShieldQuest changed anybody's behaviour.
 */
export const PILOT_KPIS: PilotKpi[] = [
  {
    id: "kpi_risk",
    number: 1,
    name: "Risk Recognition",
    measures: "Whether a young person notices the warning signs in a situation.",
    method:
      "Pre and post learning checks, plus clue-recognition activities in the city.",
    status: "DEMONSTRATED",
  },
  {
    id: "kpi_decision",
    number: 2,
    name: "Decision Accuracy",
    measures: "Whether a safer response is chosen, including in unfamiliar situations.",
    method:
      "Scenario choices, and transfer questions that move the same skill to a new situation.",
    status: "DEMONSTRATED",
  },
  {
    id: "kpi_consequence",
    number: 3,
    name: "Consequence Awareness",
    measures: "Whether the delayed cost of a decision can be named while the reward is still visible.",
    method: "Delayed Consequence Engine, prediction activities and learning checks.",
    status: "DEMONSTRATED",
  },
  {
    id: "kpi_peer",
    number: 4,
    name: "Peer Intervention Confidence",
    measures: "Whether a young person would act when it is a friend at risk, and how.",
    method:
      "Peer Shield scenarios, facilitated group questions and the peer-intervention learning checks.",
    status: "DEMONSTRATED",
  },
  {
    id: "kpi_retention",
    number: 5,
    name: "Retention",
    measures: "Whether the recognition and reasoning hold weeks after the session.",
    method:
      "A 2–4 week follow-up check during the pilot, where participant re-engagement is feasible.",
    status: "PLANNED",
  },
  {
    id: "kpi_engagement",
    number: 6,
    name: "Engagement",
    measures: "Whether the experience is completed, returned to and stayed with.",
    method:
      "Session and scenario completion, voluntary replay and average participation duration.",
    status: "SIMULATED",
  },
];

/** Why retention cannot be a figure in this build, stated wherever it appears. */
export const RETENTION_LIMITATION =
  "Follow-up measurement needs participants to be re-engaged two to four weeks after a facilitated session, inside a controlled pilot. This local prototype has no cohort, no scheduling and no participant contact, so it cannot measure retention — and no retention figure is shown anywhere in this build.";
