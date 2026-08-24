"use client";

import { ArrowRight, Handshake } from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { Modal } from "@/components/ui/Modal";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  type Guardian,
} from "@/lib/types";

/**
 * The moment a Guardian is met for the first time.
 *
 * This is the only screen in the app that introduces a Guardian, and it exists
 * because *how* a player gets one carries the message. There is nothing to roll
 * for, nothing to open and no rarity: the player has just demonstrated a
 * S.H.I.E.L.D. competency, and the Guardian that stands for that competency
 * turns up to say so. The skill is named on screen next to the Guardian, so the
 * two are never separable in the player's head.
 *
 * It fires once per Guardian, ever. Every later activity that practises the
 * same skill progresses it quietly in the debrief instead — a first meeting
 * that could be replayed would be a reward for repetition rather than a record
 * of something learned.
 */
export function GuardianMet({
  guardian,
  onContinue,
}: {
  /** The Guardian just met, or null when there is nothing to announce. */
  guardian: Guardian | null;
  onContinue: () => void;
}) {
  return (
    <Modal
      open={guardian !== null}
      onClose={onContinue}
      labelledBy="guardian-met-title"
      className="bg-surface"
    >
      {guardian && (
        <div className="animate-slide-up px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-leaf-700">
            <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
            Guardian met
          </p>

          <GuardianPlate
            guardian={guardian}
            className="animate-pop mx-auto mt-4 h-24 w-24 rounded-3xl text-3xl"
            tone="amber"
          />

          <h2
            id="guardian-met-title"
            className="mt-4 text-[30px] font-extrabold uppercase leading-none tracking-tight text-navy-900"
          >
            {guardian.name}
          </h2>

          <p className="mt-2 inline-flex items-center gap-2 rounded-xl border border-line bg-surface-sunk px-3 py-1.5 text-[12.5px] font-bold text-navy-900">
            <span
              aria-hidden="true"
              className="grid h-5 w-5 place-items-center rounded bg-navy-900 text-[11px] font-extrabold text-white"
            >
              {COMPETENCY_LETTER[guardian.competency]}
            </span>
            {COMPETENCY_LABEL[guardian.competency]}
          </p>

          <p className="mt-4 text-[15px] font-semibold italic leading-relaxed text-ink">
            “{guardian.greeting}”
          </p>

          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            You met {guardian.name} by practising{" "}
            {COMPETENCY_LABEL[guardian.competency].toLowerCase()}. From here{" "}
            {guardian.name} grows as you keep practising it — never by spending
            anything, and never by chance.
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-leaf-800 bg-leaf-700 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-leaf-600 active:translate-y-[3px] active:border-b-0"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </Modal>
  );
}
