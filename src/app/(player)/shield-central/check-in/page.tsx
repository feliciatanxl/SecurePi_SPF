"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ClipboardCheck, Lock } from "lucide-react";
import { HubPage } from "@/components/player/HubPage";
import {
  LEARNING_CHECK_META,
  learningCheckQuestions,
} from "@/lib/api/learning-check-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import {
  LEARNING_DIMENSION_LABEL,
  type CheckResponse,
  type LearningCheckId,
} from "@/lib/types";

/**
 * Pre and post learning checks.
 *
 * A prototype measurement flow for a facilitated pilot. It records what a
 * participant chose and stops there — deliberately.
 *
 * There is no score, no percentage, no rating and no profile. The completion
 * screen lists the *dimensions the check covered*, not how the person did on
 * them, because the question these answers exist to inform is "did the
 * programme shift anything across a cohort", never "how risky is this young
 * person". Producing an individual crime-risk score from a four-question
 * multiple choice would be indefensible, and it is not something this build can
 * do at all.
 */
export default function LearningCheckPage() {
  const { profile } = usePlayer();
  const [running, setRunning] = useState<LearningCheckId | null>(null);

  if (running) {
    return <CheckRunner id={running} onExit={() => setRunning(null)} />;
  }

  return (
    <HubPage
      eyebrow="Shield Central"
      title="Learning check"
      intro="Two short, ungraded check-ins used in facilitated pilots."
    >
      <ul className="space-y-2.5">
        {(["pre", "post"] as LearningCheckId[]).map((id) => {
          const meta = LEARNING_CHECK_META[id];
          const record = profile.learningChecks[id];
          const blocked = id === "post" && !profile.learningChecks.pre.completed;

          return (
            <li
              key={id}
              className={`rounded-2xl border p-3.5 ${
                record.completed
                  ? "border-leaf-200 bg-leaf-50"
                  : "border-line bg-surface"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                {meta.eyebrow}
              </p>
              <h2 className="mt-0.5 text-[17px] font-extrabold uppercase tracking-wide text-navy-900">
                {meta.title}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                {meta.intro}
              </p>

              {record.completed ? (
                <p className="mt-2.5 flex items-center gap-1.5 text-[13px] font-bold text-leaf-700">
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  Completed — {record.responses.length} responses recorded
                </p>
              ) : blocked ? (
                <p className="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Available after the check-in
                </p>
              ) : null}

              <button
                type="button"
                disabled={blocked}
                onClick={() => setRunning(id)}
                className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 text-[14px] font-extrabold text-white transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:bg-surface-sunk disabled:text-ink-soft"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                {record.completed ? "Take it again" : "Start"}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
        These checks are never scored and never turned into a rating of you.
        ShieldQuest does not produce a safety percentage, a crime-risk score or
        any individual risk profile — not from these answers, and not from
        anything else you do here.
      </p>
    </HubPage>
  );
}

function CheckRunner({
  id,
  onExit,
}: {
  id: LearningCheckId;
  onExit: () => void;
}) {
  const { recordLearningCheck } = usePlayer();
  const questions = learningCheckQuestions(id);
  const meta = LEARNING_CHECK_META[id];

  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<CheckResponse[]>([]);
  const [done, setDone] = useState(false);

  const question = questions[index];
  const last = index === questions.length - 1;

  const answer = (optionId: string) => {
    const next = [
      ...responses.filter((r) => r.questionId !== question.id),
      { questionId: question.id, optionId },
    ];
    setResponses(next);

    if (last) {
      recordLearningCheck(id, next);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (done) {
    const dimensions = [...new Set(questions.map((q) => q.dimension))];
    return (
      <HubPage eyebrow={meta.eyebrow} title="Thank you" backHref="/shield-central">
        <section className="rounded-2xl border border-leaf-200 bg-leaf-50 p-4 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-600 text-white"
          >
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <p className="mt-2.5 text-[14px] leading-relaxed text-ink">
            {meta.closing}
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            What this check looked at
          </h2>
          <ul className="mt-2 space-y-1.5">
            {dimensions.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-civic-600"
                />
                <span className="text-[13.5px] font-semibold text-ink">
                  {LEARNING_DIMENSION_LABEL[d]}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 border-t border-line pt-2.5 text-[12px] leading-relaxed text-ink-muted">
            These are the areas the questions covered. You have not been rated on
            any of them, and no score has been produced.
          </p>
        </section>

        <div className="space-y-2">
          <Link
            href="/"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 text-[15px] font-extrabold text-white transition hover:bg-civic-700"
          >
            Back to ShieldQuest City
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onExit}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
          >
            Back to the learning checks
          </button>
        </div>
      </HubPage>
    );
  }

  return (
    <HubPage
      eyebrow={meta.eyebrow}
      title={meta.title}
      intro={meta.intro}
      backHref="/shield-central"
      action={
        <p className="shrink-0 rounded-lg bg-white/12 px-2 py-1 text-[12px] font-bold tabular-nums text-white">
          {index + 1}/{questions.length}
        </p>
      }
    >
      <section className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-[14.5px] leading-relaxed text-ink">
          {question.situation}
        </p>
        <h2 className="mt-3 text-[15px] font-extrabold text-navy-900">
          {question.prompt}
        </h2>

        {/*
          Options are visually identical and in a fixed order. Nothing marks a
          "safe" answer here or after submission — a check that reveals the
          expected answer stops measuring recognition and starts teaching to
          the test.
        */}
        <ul className="mt-3 space-y-2">
          {question.options.map((option, i) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => answer(option.id)}
                className="flex min-h-[56px] w-full items-center gap-2.5 rounded-2xl border-2 border-line bg-surface px-3.5 py-2.5 text-left transition hover:border-civic-500 hover:bg-civic-50"
              >
                <span
                  aria-hidden="true"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line-strong bg-surface-sunk text-[12px] font-extrabold text-ink-muted"
                >
                  {i + 1}
                </span>
                <span className="text-[14px] font-semibold leading-snug text-navy-900">
                  {option.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-[12px] leading-relaxed text-ink-soft">
        There are no grades and no right answer will be shown.
      </p>
    </HubPage>
  );
}
