import { GUARDIAN_BEACON } from "@/lib/api/mock-data";
import { NODE_DIGI_FINALE } from "@/lib/api/world-data";
import type { GroupDecisionScenario } from "@/lib/types";

/**
 * Think · Vote · Explain content.
 *
 * ## The honest framing, stated once, here
 *
 * The mechanic this file supports is a *facilitated group* mechanic. In a room,
 * the value comes from real people: everyone thinks alone, everyone votes, the
 * room sees its own spread, people say why, and then they decide again. Hearing
 * three classmates give a reason you had not thought of is the intervention.
 *
 * This prototype has no multiplayer, no session server, no cross-device sync
 * and no participant records. The group half is **authored** — the percentages
 * below are written by hand to be plausible for a demonstration, and every
 * surface that renders them says "simulated" on it. They are a demonstration of
 * a mechanic, not a measurement of anybody, and they must never be presented as
 * pilot data.
 *
 * The distributions are deliberately not flattering. The first vote splits with
 * a substantial share on the do-nothing option, because that is what silence in
 * a group chat actually looks like, and the second vote moves but does not
 * resolve to unanimity — a simulation where discussion converts everybody would
 * be a nicer demo and a dishonest one.
 */
export const GROUP_CHAT_JOB: GroupDecisionScenario = {
  id: "gd_group_chat_job",
  nodeId: NODE_DIGI_FINALE,
  title: "The Group Chat Job",
  category: "Money Mule Recruitment · Group decision",
  eyebrow: "Digi-District · District finale",
  primaryCompetency: "LEAD",
  guardianId: GUARDIAN_BEACON,
  estimatedMinutes: 6,
  situation:
    "Jayden has gone quiet in the group chat since the offer came up. Someone has just posted a screenshot showing he already sent his account number — and eleven people can see it.",
  messages: [
    {
      id: "gd1",
      author: "system",
      body: "Class group chat · 11 members",
      meta: "Three messages in the last two minutes",
    },
    {
      id: "gd2",
      author: "them",
      displayName: "Rae",
      body: "eh why jayden send his bank acc to that guy 😭",
    },
    {
      id: "gd3",
      author: "them",
      displayName: "Rae",
      body: "[screenshot]",
    },
    {
      id: "gd4",
      author: "them",
      displayName: "Marcus",
      body: "lol his problem la. he said got $200 what",
    },
    {
      id: "gd5",
      author: "them",
      displayName: "Jayden",
      body: "guys can we not",
    },
  ],
  question: "What should this group do in the next five minutes?",
  options: [
    {
      id: "gd_opt_nothing",
      label: "Leave it — it is Jayden's business",
      hint: "Say nothing in the chat and let it move on",
      outcome: "RISKY",
      simulatedFirstVotePct: 34,
      simulatedSecondVotePct: 12,
      afterVoteNote:
        "Eleven people are watching. Nobody has given Jayden a reason to stop, and the screenshot is still up.",
    },
    {
      id: "gd_opt_public",
      label: "Call it out in the chat",
      hint: "Tell everyone it is a scam, in the group, now",
      outcome: "CAUTIOUS",
      simulatedFirstVotePct: 41,
      simulatedSecondVotePct: 27,
      afterVoteNote:
        "The warning is right and the venue is wrong. Being corrected in front of eleven people is the fastest way to make someone dig in.",
    },
    {
      id: "gd_opt_private_adult",
      label: "Message him privately, and bring in an adult",
      hint: "One person messages Jayden; someone tells a trusted adult today",
      outcome: "SAFE",
      simulatedFirstVotePct: 25,
      simulatedSecondVotePct: 61,
      afterVoteNote:
        "He can step back without an audience, and the part that is already past peer advice — the account details are out — gets to someone who can act on it.",
    },
  ],
  discussionPrompts: [
    "What changes about Jayden's decision if eleven people are watching him make it?",
    "Which of these responses would you actually want if it were your account?",
    "At what point does this stop being something friends can fix on their own?",
  ],
  factors: [
    {
      id: "gd_f_face",
      label: "He would lose face in front of the group",
      simulatedSharePct: 58,
    },
    {
      id: "gd_f_already",
      label: "The details are already sent — this is past advice",
      simulatedSharePct: 47,
    },
    {
      id: "gd_f_notmine",
      label: "It is his decision, not mine",
      simulatedSharePct: 31,
    },
    {
      id: "gd_f_snitch",
      label: "Telling an adult feels like telling on him",
      simulatedSharePct: 29,
    },
    {
      id: "gd_f_scared",
      label: "I would not know what to say",
      simulatedSharePct: 26,
    },
    {
      id: "gd_f_speed",
      label: "Waiting makes it harder to undo",
      simulatedSharePct: 44,
    },
  ],
  debrief: {
    headline: "The room usually gets there — after it hears itself",
    body: "Alone, the most common first instinct in a group like this is either to say nothing or to say it loudly in public. What moves people is not being told the answer; it is hearing someone else name the reason they were already half-thinking — that Jayden will dig in if he is corrected in front of eleven people, and that account details already sent are past the point friends can fix.",
    warningSigns: [
      "Eleven witnesses, and diffusion of responsibility between all of them",
      "A screenshot circulating that raises the cost of backing down",
      "Account details already shared, so the situation has moved past advice",
      "One voice in the chat framing it as somebody else's problem",
    ],
    saferResponse:
      "One person messages Jayden privately so he can step back without an audience, and someone tells a trusted adult the same day. Neither of those requires confronting anyone, and the second one is what the shared account details make necessary.",
    facilitatorNote:
      "Draw out the change between the two votes rather than the final answer. Ask who moved and what they heard — the reason a peer gave is the part that transfers out of the room.",
  },
  reward: { coins: 60, resilience: 20, trust: 8 },
};

export const GROUP_DECISIONS: GroupDecisionScenario[] = [GROUP_CHAT_JOB];

export function findGroupDecision(
  id: string,
): GroupDecisionScenario | undefined {
  return GROUP_DECISIONS.find((g) => g.id === id);
}

/*
 * The authored distributions have to add up, or the bars lie about their own
 * arithmetic. Cheap to get wrong in a data file, so it fails loudly in dev and
 * is stripped from the production bundle.
 */
if (process.env.NODE_ENV !== "production") {
  for (const scenario of GROUP_DECISIONS) {
    const first = scenario.options.reduce(
      (sum, o) => sum + o.simulatedFirstVotePct,
      0,
    );
    const second = scenario.options.reduce(
      (sum, o) => sum + o.simulatedSecondVotePct,
      0,
    );
    if (first !== 100 || second !== 100) {
      throw new Error(
        `Group decision ${scenario.id}: simulated votes must total 100 (got ${first} / ${second})`,
      );
    }
  }
}
