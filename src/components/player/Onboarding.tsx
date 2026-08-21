"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Shield } from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { Die } from "@/components/player/board/DiceRoller";
import { PLAYER_TOKENS } from "@/lib/api/rewards-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  COMPETENCY_ORDER,
} from "@/lib/types";

const STEPS = ["Welcome", "How to play", "Build your Shield", "Your token"];

/**
 * First-run onboarding.
 *
 * Four screens, no account, no personal details and nothing to describe about
 * yourself — the only choice is a coloured shape for your board token. A young
 * person should be able to start a crime-prevention activity without handing
 * anything over first.
 *
 * Rendered as an overlay rather than a route so it cannot be reached by URL,
 * cannot be linked to, and leaves no trace in the back button. It is mounted
 * only after the stored session has been read, so the server render and the
 * first client render agree.
 */
export function Onboarding() {
  const { profile, guardians, hydrated, completeOnboarding } = usePlayer();
  const [step, setStep] = useState(0);
  const [tokenId, setTokenId] = useState(profile.playerTokenId);
  const panelRef = useRef<HTMLDivElement>(null);

  const open = hydrated && !profile.onboardingComplete;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Announce each screen to a screen reader as it changes. */
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open, step]);

  if (!open) return null;

  const last = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[60] overflow-y-auto bg-navy-900"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white outline-none"
      >
        {/* Progress. Four dots, and the same information in words. */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <span
              key={label}
              aria-hidden="true"
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-amber-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>

        <div className="flex flex-1 flex-col justify-center py-6">
          {step === 0 && (
            <div className="text-center">
              <span
                aria-hidden="true"
                className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/10"
              >
                <Shield className="h-10 w-10 text-amber-400" />
              </span>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                Project SHIELD
              </p>
              <h1
                id="onboarding-title"
                className="mt-1 text-[34px] font-extrabold uppercase leading-none tracking-tight"
              >
                Welcome to
                <br />
                Shield<span className="text-civic-400">Quest</span>
              </h1>
              <p className="mt-3 text-[16px] font-bold text-civic-400">
                Choose Right. Protect Together.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-navy-100">
                Practise difficult decisions before they happen in real life.
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1
                id="onboarding-title"
                className="text-[28px] font-extrabold uppercase leading-tight tracking-tight"
              >
                How to play
              </h1>
              <ol className="mt-5 space-y-2">
                {[
                  ["Roll", "One die. It moves you, nothing else."],
                  ["Move", "Your token travels along the city route."],
                  ["Land", "The space tells you what you have met."],
                  ["Play", "A scenario, a Peer Shield moment or a mini-game."],
                  ["Decide", "There is no obviously right-coloured answer."],
                  ["Learn", "See what your choice actually led to."],
                ].map(([title, body], i) => (
                  <li
                    key={title}
                    className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/8 px-3 py-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-amber-400 text-[12px] font-extrabold text-navy-900"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-extrabold uppercase tracking-wide">
                        {title}
                      </span>
                      <span className="block text-[13px] leading-snug text-navy-100">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-[13px] leading-relaxed">
                <Die value={4} className="h-8 w-8 shrink-0" />
                <span>
                  The dice decides <strong>where you go</strong>. Your choices
                  decide <strong>what you learn</strong>. Nothing is won or lost
                  on a roll.
                </span>
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1
                id="onboarding-title"
                className="text-[28px] font-extrabold uppercase leading-tight tracking-tight"
              >
                Build your Shield
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-navy-100">
                Six prevention skills. Every activity practises one of them, and
                the tag tells you which.
              </p>
              <ul className="mt-4 space-y-1.5">
                {COMPETENCY_ORDER.map((c) => (
                  <li key={c} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-400 text-[13px] font-extrabold text-navy-900"
                    >
                      {COMPETENCY_LETTER[c]}
                    </span>
                    <span className="text-[14px] font-semibold">
                      {COMPETENCY_LABEL[c]}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-2xl border border-white/12 bg-white/8 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
                  Your Guardians
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-navy-100">
                  Guardians stand for those skills. They grow when you practise
                  — never from a draw, a purchase or a lucky roll.
                </p>
                <ul className="mt-2.5 flex gap-2.5">
                  {guardians.map((g) => (
                    <li key={g.id} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <GuardianPlate
                        guardian={g}
                        className="h-12 w-12 rounded-2xl text-[16px]"
                      />
                      <span className="w-full truncate text-center text-[11px] font-bold uppercase tracking-wide">
                        {g.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1
                id="onboarding-title"
                className="text-[28px] font-extrabold uppercase leading-tight tracking-tight"
              >
                Choose your token
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-navy-100">
                This is the marker that travels the city. A shape and a colour —
                nothing about you, and nothing you have to fill in.
              </p>

              <ul className="mt-5 grid grid-cols-2 gap-2.5">
                {PLAYER_TOKENS.map((token) => {
                  const active = token.id === tokenId;
                  return (
                    <li key={token.id}>
                      <button
                        type="button"
                        onClick={() => setTokenId(token.id)}
                        aria-pressed={active}
                        className={`flex min-h-[92px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 transition ${
                          active
                            ? "border-amber-400 bg-white/12"
                            : "border-white/15 bg-white/6 hover:border-white/35"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid h-11 w-11 place-items-center rounded-full ${token.swatch} ${
                            active ? `ring-4 ${token.ring}` : ""
                          }`}
                        >
                          {active && (
                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                          )}
                        </span>
                        <span className="text-[13px] font-extrabold uppercase tracking-wide">
                          {token.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-4 text-[12px] leading-relaxed text-navy-100/80">
                ShieldQuest does not ask for your name, your school or anything
                that identifies you. Your progress stays on this device.
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2">
          <button
            type="button"
            onClick={() =>
              last ? completeOnboarding(tokenId) : setStep((s) => s + 1)
            }
            className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-navy-900 transition hover:bg-amber-400 active:translate-y-[3px] active:border-b-0"
          >
            {last ? "Enter ShieldQuest" : step === 0 ? "Get started" : "Next"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="min-h-[44px] px-2 text-[13px] font-semibold text-navy-100 underline underline-offset-2"
              >
                Back
              </button>
            ) : (
              <Link
                href="/join"
                onClick={() => completeOnboarding(tokenId)}
                className="min-h-[44px] px-2 py-2 text-[13px] font-semibold text-navy-100 underline underline-offset-2"
              >
                Join a session instead
              </Link>
            )}
            <button
              type="button"
              onClick={() => completeOnboarding(tokenId)}
              className="min-h-[44px] px-2 text-[13px] font-semibold text-navy-100/80 underline underline-offset-2"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
