"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, Shield } from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { Die } from "@/components/player/board/DiceRoller";
import { PLAYER_TOKENS } from "@/lib/api/rewards-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  COMPETENCY_ORDER,
  type Guardian,
} from "@/lib/types";

const STEPS = ["Welcome", "How to play", "Build your Shield", "Your token"];

/**
 * First-run onboarding.
 *
 * Four screens, no account, no personal details and nothing to describe about
 * yourself — the only choice is which of the four ShieldQuest Explorers carries
 * your turn around the board. A young person should be able to start a
 * crime-prevention activity without handing anything over first.
 *
 * Rendered as an overlay rather than a route so it cannot be reached by URL,
 * cannot be linked to, and leaves no trace in the back button. It is mounted
 * only after the stored session has been read, so the server render and the
 * first client render agree.
 *
 * Two compositions, one set of steps. A phone gets the compact column it was
 * designed for. A laptop gets a widescreen screen — brand and progress across
 * the top, the ShieldQuest world on the left, the step itself on the right, the
 * controls along the bottom — because a 400px column floating in the middle of
 * a 1920px display reads as a phone screenshot rather than as the product. The
 * step sequence, the state and every control are identical in both.
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
  const selected = PLAYER_TOKENS.find((token) => token.id === tokenId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[60] overflow-y-auto bg-navy-900 lg:bg-[radial-gradient(ellipse_at_top_left,rgba(42,125,216,0.24),transparent_58%),radial-gradient(ellipse_at_bottom_right,rgba(242,174,51,0.13),transparent_55%)]"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white outline-none lg:max-w-[1180px] lg:px-10 lg:pb-8 lg:pt-8 xl:max-w-[1280px] xl:px-14"
      >
        {/*
          Progress. Four segments, and the same information in words — spelled
          out on a laptop, where there is room for it, and announced to a screen
          reader on every screen.
        */}
        <div className="shrink-0 lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div className="hidden lg:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
              Project SHIELD
            </p>
            <p className="text-[26px] font-extrabold uppercase leading-none tracking-tight">
              Shield<span className="text-civic-400">Quest</span>
            </p>
          </div>

          <div className="lg:w-[360px]">
            <p
              aria-hidden="true"
              className="mb-2 hidden text-right text-[11px] font-bold uppercase tracking-[0.16em] text-navy-100/80 lg:block"
            >
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
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
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>

        {step === 0 && (
          <StepShell visual={<WelcomePanel />}>
            <div className="text-center lg:text-left">
              <span
                aria-hidden="true"
                className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/10 lg:hidden"
              >
                <Shield className="h-10 w-10 text-amber-400" />
              </span>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400 lg:mt-0 lg:text-[12px]">
                Project SHIELD
              </p>
              <h1
                id="onboarding-title"
                className="mt-1 text-[34px] font-extrabold uppercase leading-none tracking-tight lg:text-[54px] xl:text-[62px]"
              >
                Welcome to
                <br />
                Shield<span className="text-civic-400">Quest</span>
              </h1>
              <p className="mt-3 text-[16px] font-bold text-civic-400 lg:mt-4 lg:text-[21px]">
                Choose Right. Protect Together.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-navy-100 lg:mt-5 lg:max-w-[46ch] lg:text-[17px]">
                Practise difficult decisions before they happen in real life.
              </p>
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell visual={<DicePanel />}>
            <h1
              id="onboarding-title"
              className="text-[28px] font-extrabold uppercase leading-tight tracking-tight lg:text-[42px]"
            >
              How to play
            </h1>
            <ol className="mt-5 space-y-2 lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
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
                  className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/8 px-3 py-2.5 lg:rounded-2xl lg:px-4 lg:py-3.5"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-amber-400 text-[12px] font-extrabold text-navy-900 lg:h-8 lg:w-8 lg:text-[14px]"
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-extrabold uppercase tracking-wide lg:text-[15px]">
                      {title}
                    </span>
                    <span className="block text-[13px] leading-snug text-navy-100 lg:text-[14px]">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell visual={<GuardianPanel guardians={guardians} />}>
            <h1
              id="onboarding-title"
              className="text-[28px] font-extrabold uppercase leading-tight tracking-tight lg:text-[42px]"
            >
              Build your Shield
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-100 lg:mt-3 lg:max-w-[52ch] lg:text-[16px]">
              Six prevention skills. Every activity practises one of them, and
              the tag tells you which.
            </p>
            <ul className="mt-4 space-y-1.5 lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {COMPETENCY_ORDER.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-2.5 lg:gap-3.5 lg:rounded-2xl lg:border lg:border-white/12 lg:bg-white/[0.07] lg:px-4 lg:py-3.5"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-400 text-[13px] font-extrabold text-navy-900 lg:h-11 lg:w-11 lg:rounded-xl lg:text-[19px]"
                  >
                    {COMPETENCY_LETTER[c]}
                  </span>
                  <span className="min-w-0 text-[14px] font-semibold lg:text-[15.5px] lg:font-bold">
                    {COMPETENCY_LABEL[c]}
                  </span>
                </li>
              ))}
            </ul>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell visual={<TokenPreviewPanel tokenId={tokenId} />}>
            <h1
              id="onboarding-title"
              className="text-[28px] font-extrabold uppercase leading-tight tracking-tight lg:text-[42px]"
            >
              Choose your token
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-100 lg:mt-3 lg:max-w-[56ch] lg:text-[16px]">
              This is the marker that travels the city. A colour and a crest —
              nothing about you, and nothing you have to fill in.
            </p>

            <ul className="mt-5 grid grid-cols-2 gap-2.5 lg:mt-7 lg:grid-cols-4 lg:gap-4">
              {PLAYER_TOKENS.map((token) => {
                const active = token.id === tokenId;
                return (
                  <li key={token.id}>
                    <button
                      type="button"
                      onClick={() => setTokenId(token.id)}
                      aria-pressed={active}
                      className={`flex min-h-[104px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-2 py-3 transition lg:min-h-[228px] lg:gap-3 lg:py-5 ${
                        active
                          ? "border-amber-400 bg-white/12"
                          : "border-white/15 bg-white/6 hover:border-white/35"
                      }`}
                    >
                      <PlayerAvatar
                        tokenId={token.id}
                        className="h-11 w-11 lg:h-[104px] lg:w-[104px]"
                      />
                      <span className="text-[13px] font-extrabold uppercase tracking-wide lg:text-[16px]">
                        {token.name}
                      </span>
                      {/*
                        The descriptor is cosmetic wording only: what the figure
                        looks like, never a role, a trait or an ability.
                      */}
                      <span className="hidden text-center text-[11.5px] font-semibold leading-snug text-navy-100/85 lg:block">
                        {token.descriptor}
                      </span>
                      {/*
                        Selection is stated in words as well as drawn, so it does
                        not depend on noticing a border or a colour.
                      */}
                      <span
                        /* Fixed height, so the check mark on the chosen card
                           cannot make it taller than the other three. */
                        className={`inline-flex h-[18px] items-center gap-1 rounded-full px-2 text-[9.5px] font-extrabold uppercase tracking-[0.12em] lg:h-[24px] lg:text-[11px] ${
                          active
                            ? "bg-amber-400 text-navy-900"
                            : "text-navy-100/65"
                        }`}
                      >
                        {active && (
                          <Check
                            className="h-3 w-3"
                            strokeWidth={3}
                            aria-hidden="true"
                          />
                        )}
                        {active ? "Selected" : "Choose"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 text-[12px] leading-relaxed text-navy-100/80 lg:mt-6 lg:max-w-[62ch] lg:text-[13.5px]">
              ShieldQuest does not ask for your name, your school or anything
              that identifies you. Your progress stays on this device.
            </p>
            <p className="sr-only" aria-live="polite">
              {selected ? `${selected.name} selected.` : ""}
            </p>
          </StepShell>
        )}

        {/*
          Controls. Stacked on a phone with the primary action under the thumb;
          on a laptop the secondary choices sit left and the primary action sits
          right, where a pointer expects it.
        */}
        <div className="shrink-0 space-y-2 lg:flex lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-8 lg:space-y-0 lg:border-t lg:border-white/12 lg:pt-6">
          <button
            type="button"
            onClick={() =>
              last ? completeOnboarding(tokenId) : setStep((s) => s + 1)
            }
            className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-navy-900 transition hover:bg-amber-400 active:translate-y-[3px] active:border-b-0 lg:w-auto lg:min-w-[260px] lg:min-h-[58px] lg:px-8 lg:text-[16px]"
          >
            {last ? "Enter ShieldQuest" : step === 0 ? "Get started" : "Next"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center justify-between gap-3 lg:justify-start lg:gap-6">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="min-h-[44px] px-2 text-[13px] font-semibold text-navy-100 underline underline-offset-2 lg:text-[14px]"
              >
                Back
              </button>
            ) : (
              <Link
                href="/join"
                onClick={() => completeOnboarding(tokenId)}
                className="min-h-[44px] px-2 py-2 text-[13px] font-semibold text-navy-100 underline underline-offset-2 lg:text-[14px]"
              >
                Join a session instead
              </Link>
            )}
            <button
              type="button"
              onClick={() => completeOnboarding(tokenId)}
              className="min-h-[44px] px-2 text-[13px] font-semibold text-navy-100/80 underline underline-offset-2 lg:text-[14px]"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The body of one onboarding screen.
 *
 * A single column on a phone. Two on a laptop, with the visual pane pulled to
 * the left by `order` rather than by being moved in the markup: the phone order
 * is the reading order — the step first, its supporting panel after — and the
 * two must not become two copies of the same content.
 */
function StepShell({
  visual,
  children,
}: {
  visual: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-6 lg:grid lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-10 lg:py-10 xl:gap-14">
      <div className="min-w-0">{children}</div>
      {visual}
    </div>
  );
}

/** Shared shell for the left-hand pane, so all four screens share a frame. */
function VisualPane({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`lg:order-first ${className}`}>
      <div className="rounded-2xl border border-white/12 bg-white/8 p-3.5 lg:rounded-[32px] lg:p-8">
        {children}
      </div>
    </div>
  );
}

/** Welcome. The world the player is about to enter, and who travels it. */
function WelcomePanel() {
  return (
    <VisualPane className="hidden lg:block">
      <span
        aria-hidden="true"
        className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-amber-400/15"
      >
        <Shield className="h-12 w-12 text-amber-400" />
      </span>
      <p className="mt-6 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-amber-400">
        ShieldQuest City
      </p>
      <ul aria-hidden="true" className="mt-5 flex items-end justify-center gap-2">
        {PLAYER_TOKENS.map((token) => (
          <li key={token.id}>
            <PlayerAvatar tokenId={token.id} className="h-[86px] w-[86px]" />
          </li>
        ))}
      </ul>
      <p className="mt-5 text-center text-[14px] leading-relaxed text-navy-100">
        Four districts, one route, and a decision at every stop.
      </p>
    </VisualPane>
  );
}

/**
 * How to play. The one thing worth saying twice: the die decides where you go
 * and nothing else, so nobody comes away thinking an outcome here was luck.
 */
function DicePanel() {
  return (
    <div className="lg:order-first">
      <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-[13px] leading-relaxed lg:mt-0 lg:flex-col lg:items-start lg:gap-5 lg:rounded-[32px] lg:px-8 lg:py-9 lg:text-[16px]">
        <Die value={4} className="h-8 w-8 shrink-0 lg:h-24 lg:w-24" />
        <span>
          The dice decides <strong>where you go</strong>. Your choices decide{" "}
          <strong>what you learn</strong>. Nothing is won or lost on a roll.
        </span>
      </p>
    </div>
  );
}

/** Build your Shield. The Guardians that stand for the six skills. */
function GuardianPanel({ guardians }: { guardians: Guardian[] }) {
  return (
    <VisualPane className="mt-5 lg:mt-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400 lg:text-[12px]">
        Your Guardians
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-navy-100 lg:mt-2 lg:text-[15px]">
        Guardians stand for those skills. They grow when you practise — never
        from a draw, a purchase or a lucky roll.
      </p>
      <ul className="mt-2.5 flex gap-2.5 lg:mt-7 lg:gap-4">
        {guardians.map((g) => (
          <li key={g.id} className="flex min-w-0 flex-1 flex-col items-center gap-1 lg:gap-2.5">
            <GuardianPlate
              guardian={g}
              className="h-12 w-12 rounded-2xl text-[16px] lg:h-[104px] lg:w-[104px] lg:rounded-[28px] lg:text-[34px]"
            />
            <span className="w-full truncate text-center text-[11px] font-bold uppercase tracking-wide lg:text-[13px]">
              {g.name}
            </span>
          </li>
        ))}
      </ul>
    </VisualPane>
  );
}

/**
 * Choose your token. The chosen Explorer at the size the artwork was drawn for,
 * so the choice is visible before it is committed to.
 */
function TokenPreviewPanel({ tokenId }: { tokenId: string }) {
  const token = PLAYER_TOKENS.find((item) => item.id === tokenId);

  return (
    <VisualPane className="hidden lg:block">
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.2em] text-amber-400">
        Your marker
      </p>
      <PlayerAvatar
        tokenId={tokenId}
        className="mx-auto mt-6 h-[220px] w-[220px]"
      />
      <p className="mt-5 text-center text-[22px] font-extrabold uppercase tracking-tight">
        {token?.name ?? "Explorer"}
      </p>
      <p className="mt-1 text-center text-[14px] leading-relaxed text-navy-100">
        Cosmetic only. Every Explorer plays exactly the same game.
      </p>
    </VisualPane>
  );
}
