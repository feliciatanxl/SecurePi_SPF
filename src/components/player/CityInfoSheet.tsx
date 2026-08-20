"use client";

import Link from "next/link";
import { Lock, Route, SlidersHorizontal } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PROTOTYPE_DISCLAIMER } from "@/lib/api/mock-data";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  COMPETENCY_ORDER,
} from "@/lib/types";

/**
 * "About this game".
 *
 * The framework, the structure and the prototype framing all still exist and are
 * one tap away — they simply no longer occupy the screen a player came to play
 * on. On a phone this arrives as a sheet over the board; on a laptop the same
 * content is also permanently visible in the context rail.
 */
export function CityInfoSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="about-sheet-title"
      className="bg-surface"
    >
      <div className="flex max-h-[82dvh] min-h-0 flex-col">
        <span
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden"
        />

        <header className="shrink-0 border-b border-line px-4 pb-3 pt-3 pr-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-civic-700">
            Project SHIELD
          </p>
          <h2
            id="about-sheet-title"
            className="mt-0.5 text-[18px] font-extrabold tracking-tight text-navy-900"
          >
            About ShieldQuest
          </h2>
        </header>

        <div className="thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <p className="text-[14px] leading-relaxed text-ink">
            A youth civic-learning experience where crime prevention is
            practised as a decision, not delivered as a talk.
          </p>

          <section className="rounded-2xl border border-line bg-surface-sunk p-3.5">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              How it is structured
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              District → mission stop → activity → learning outcome → progress.
              The city board is the engagement layer; the scenario engine,
              delayed consequences and Peer Shield are the substance.
            </p>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              The six skills you practise
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Every activity is tagged with the skill it builds. You see the tag
              on the mission, not a lecture about the framework.
            </p>
            <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {COMPETENCY_ORDER.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="grid h-5 w-5 shrink-0 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
                  >
                    {COMPETENCY_LETTER[c]}
                  </span>
                  <span className="text-[13px] font-medium text-ink">
                    {COMPETENCY_LABEL[c]}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ShieldQuest records what you have practised so it can suggest what to
            practise next. It does not profile you, predict behaviour, or rank
            you against other participants.
          </p>
        </div>

        <div className="shrink-0 space-y-2.5 border-t border-line px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
          <Link
            href="/admin"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-line px-3 text-[13px] font-semibold text-ink-muted transition hover:border-civic-200 hover:text-civic-700"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Scenario Management Portal
          </Link>
          <p className="text-center text-[11px] leading-relaxed text-ink-soft">
            {PROTOTYPE_DISCLAIMER}. Not an official Singapore Police Force
            system.
          </p>
        </div>
      </div>
    </Modal>
  );
}
