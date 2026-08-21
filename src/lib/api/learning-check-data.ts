import type { LearningCheckId, LearningCheckQuestion } from "@/lib/types";

/**
 * Pre and post learning checks.
 *
 * These exist so a facilitated pilot can say something about whether the
 * experience made a difference. They are explicitly **not** a test of the young
 * person taking them:
 *
 *  - No option is marked correct, before or after answering.
 *  - Nothing is scored. No percentage, no rating, no "you are X% safe".
 *  - Nothing is profiled. There is no crime-risk score, no likelihood-to-offend
 *    estimate and no individual risk profile produced anywhere from these
 *    answers — not in the player app, and not in the admin portal.
 *
 * What the responses are for is programme evaluation in aggregate: across a
 * cohort, does recognition and reasoning shift? That is a question about the
 * intervention, not about any participant in it.
 *
 * The post check deliberately uses different situations from the pre check. Re-
 * asking identical questions measures recall of the questions rather than any
 * change in how a situation is read.
 */

const PRE_QUESTIONS: LearningCheckQuestion[] = [
  {
    id: "pre_q1",
    situation:
      "Someone you have never met offers to pay you to receive money into your bank account and pass it on.",
    prompt: "What would you be most likely to do?",
    dimension: "RISK_RECOGNITION",
    options: [
      { id: "a", label: "Ask how much, then decide" },
      { id: "b", label: "Ask them to prove who they are first" },
      { id: "c", label: "Say no and stop replying" },
      { id: "d", label: "Check with someone I trust before answering" },
    ],
  },
  {
    id: "pre_q2",
    situation:
      "A message says your account will be suspended tonight unless you verify it immediately.",
    prompt: "What matters most about this message?",
    dimension: "DECISION_REASONING",
    options: [
      { id: "a", label: "Whether the logo and wording look right" },
      { id: "b", label: "That it is pushing me to act quickly" },
      { id: "c", label: "Whether other people got the same message" },
      { id: "d", label: "How much I would lose if it is real" },
    ],
  },
  {
    id: "pre_q3",
    situation:
      "A friend is about to let someone use their account, and six people in the group chat have seen it.",
    prompt: "What would you be most likely to do?",
    dimension: "PEER_INTERVENTION",
    options: [
      { id: "a", label: "Say nothing — it is their decision" },
      { id: "b", label: "Message them privately" },
      { id: "c", label: "Say something in the group chat" },
      { id: "d", label: "Tell an adult I trust" },
    ],
  },
  {
    id: "pre_q4",
    situation:
      "A classmate asks you to hold something in your bag until the end of the day.",
    prompt: "What would you want to know first?",
    dimension: "CONSEQUENCE_AWARENESS",
    options: [
      { id: "a", label: "Whether anyone would find out" },
      { id: "b", label: "What is actually in it" },
      { id: "c", label: "What happens to me if it is found on me" },
      { id: "d", label: "Why they cannot carry it themselves" },
    ],
  },
];

const POST_QUESTIONS: LearningCheckQuestion[] = [
  {
    id: "post_q1",
    situation:
      "A part-time job advert promises commission for forwarding customer payments through your own account.",
    prompt: "What stands out to you most?",
    dimension: "RISK_RECOGNITION",
    options: [
      { id: "a", label: "The pay looks good for the effort" },
      { id: "b", label: "A real job would not need my personal account" },
      { id: "c", label: "I would want to see the company registration" },
      { id: "d", label: "I would ask someone before replying" },
    ],
  },
  {
    id: "post_q2",
    situation:
      "A seller offers a much cheaper ticket but wants payment in the next ten minutes.",
    prompt: "What would you do with the deadline?",
    dimension: "DECISION_REASONING",
    options: [
      { id: "a", label: "Move fast before someone else takes it" },
      { id: "b", label: "Treat the deadline itself as the warning" },
      { id: "c", label: "Ask for more time and see how they react" },
      { id: "d", label: "Pay a deposit only" },
    ],
  },
  {
    id: "post_q3",
    situation:
      "A friend has already sent their account details to someone online.",
    prompt: "What would you do now?",
    dimension: "PEER_INTERVENTION",
    options: [
      { id: "a", label: "Tell them to stop replying and say nothing more" },
      { id: "b", label: "Message them privately and offer to work it out together" },
      { id: "c", label: "Bring in a trusted adult, because it has gone past advice" },
      { id: "d", label: "Wait and see whether anything actually happens" },
    ],
  },
  {
    id: "post_q4",
    situation:
      "Someone gets paid today for something that could be traced back to them in a few weeks.",
    prompt: "What is the most important thing about that?",
    dimension: "CONSEQUENCE_AWARENESS",
    options: [
      { id: "a", label: "It depends on whether it is traced at all" },
      { id: "b", label: "The payment arriving first is what makes it work" },
      { id: "c", label: "The cost lands long after the reward does" },
      { id: "d", label: "It is only a problem if the amount is large" },
    ],
  },
];

export function learningCheckQuestions(
  id: LearningCheckId,
): LearningCheckQuestion[] {
  return id === "pre" ? PRE_QUESTIONS : POST_QUESTIONS;
}

export const LEARNING_CHECK_META: Record<
  LearningCheckId,
  { title: string; eyebrow: string; intro: string; closing: string }
> = {
  pre: {
    eyebrow: "Before you start",
    title: "Quick check-in",
    intro:
      "There are no grades. This helps us understand what you already recognise.",
    closing:
      "Thank you. Nothing here is scored, and nothing you chose is shown to anyone as a judgement about you.",
  },
  post: {
    eyebrow: "After the session",
    title: "What changed?",
    intro:
      "Different situations this time. Same idea — there are no grades and no right answer shown.",
    closing:
      "Thank you. Your responses help us understand whether ShieldQuest is useful, not whether you are.",
  },
};
