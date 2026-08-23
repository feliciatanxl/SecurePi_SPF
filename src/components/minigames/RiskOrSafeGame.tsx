"use client";

import { Check, ShieldAlert, ShieldCheck, X } from "lucide-react";
import type { SortCard } from "@/lib/types";

/**
 * One card of Risk or Safe?
 *
 * Two buttons, equally weighted and equally styled. Neither is visually the
 * "good" answer before it is pressed — the same rule the scenario engine
 * follows, and for the same reason: an option a player can pick by colour is
 * not a judgement.
 *
 * The explanation appears whichever way they called it. Getting a card right
 * for the wrong reason is the failure this activity exists to catch, so the
 * signal is always named rather than the answer simply being confirmed.
 */
export function RiskOrSafeBoard({
  card,
  cardNumber,
  cardTotal,
  chosen,
  onChoose,
  onNext,
  isLast,
}: {
  card: SortCard;
  cardNumber: number;
  cardTotal: number;
  /** The player's call on this card, or null before they make one. */
  chosen: SortCard["answer"] | null;
  onChoose: (value: SortCard["answer"]) => void;
  /** Present while there is another card after this one. */
  onNext?: () => void;
  isLast: boolean;
}) {
  const answered = chosen !== null;
  const correct = chosen === card.answer;

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft tabular-nums">
        Request {cardNumber} of {cardTotal}
      </p>

      <div className="rounded-2xl border border-civic-200 bg-civic-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-civic-700">
          The request
        </p>
        <p className="mt-1.5 text-[16px] font-semibold leading-snug text-navy-900">
          {card.situation}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <CallButton
          tone="risk"
          label="Risky"
          icon={<ShieldAlert className="h-5 w-5" aria-hidden="true" />}
          answered={answered}
          isChoice={chosen === "RISK"}
          isAnswer={card.answer === "RISK"}
          onClick={() => onChoose("RISK")}
        />
        <CallButton
          tone="safe"
          label="Safe"
          icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          answered={answered}
          isChoice={chosen === "SAFE"}
          isAnswer={card.answer === "SAFE"}
          onClick={() => onChoose("SAFE")}
        />
      </div>

      {answered && (
        <section
          className={`animate-rise rounded-2xl border p-4 ${
            correct
              ? "border-leaf-200 bg-leaf-50"
              : "border-amber-200 bg-amber-50"
          }`}
          aria-live="polite"
        >
          <p
            className={`flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide ${
              correct ? "text-leaf-700" : "text-amber-700"
            }`}
          >
            {correct ? (
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            ) : (
              <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            )}
            {correct
              ? `You called it ${card.answer === "RISK" ? "risky" : "safe"} — so is this`
              : `This one was ${card.answer === "RISK" ? "risky" : "safe"}`}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
            {card.explanation}
          </p>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-navy-900 px-4 text-[14px] font-extrabold text-white transition hover:bg-navy-800"
            >
              {isLast ? "See what you built" : "Next request"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

function CallButton({
  tone,
  label,
  icon,
  answered,
  isChoice,
  isAnswer,
  onClick,
}: {
  tone: "risk" | "safe";
  label: string;
  icon: React.ReactNode;
  answered: boolean;
  isChoice: boolean;
  isAnswer: boolean;
  onClick: () => void;
}) {
  /*
   * Before the call, both buttons carry their own colour but neither carries
   * approval — "Risky" is coral because risk is coral throughout the app, not
   * because it is the answer. After the call, the correct one is marked whether
   * or not it was the one pressed.
   */
  const resting =
    tone === "risk"
      ? "border-coral-200 bg-coral-50 text-coral-700 hover:border-coral-600"
      : "border-leaf-200 bg-leaf-50 text-leaf-700 hover:border-leaf-600";

  const settled = isAnswer
    ? "border-leaf-600 bg-leaf-50 text-leaf-700"
    : isChoice
      ? "border-coral-600 bg-coral-50 text-coral-700"
      : "border-line bg-surface text-ink-soft opacity-70";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={answered}
      aria-pressed={isChoice}
      className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-3 text-[15px] font-extrabold uppercase tracking-wide transition disabled:cursor-default ${
        answered ? settled : resting
      }`}
    >
      {icon}
      {label}
      {answered && isAnswer && <span className="sr-only">correct call</span>}
    </button>
  );
}
