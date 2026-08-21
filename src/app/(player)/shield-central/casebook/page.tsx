"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, TriangleAlert } from "lucide-react";
import { HubPage } from "@/components/player/HubPage";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { SITUATION_CARDS } from "@/lib/api/board-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { COMPETENCY_LABEL, COMPETENCY_LETTER } from "@/lib/types";

/**
 * The Shield Casebook.
 *
 * Every Situation Card the player has met becomes a reference they can come
 * back to: the warning signs that were present, the skill it belongs to and
 * what a safer response looks like.
 *
 * It is not a collection to complete. The point is that the material from the
 * debrief stays reachable afterwards — the entries are the same warning signs
 * and safer responses the scenario itself taught, sourced from the same
 * content, so the two can never drift apart.
 */
export default function CasebookPage() {
  const { profile, guardians } = usePlayer();
  const met = SITUATION_CARDS.filter((c) => profile.casebook.includes(c.id));

  return (
    <HubPage
      eyebrow="Shield Central"
      title="Shield Casebook"
      intro="What you learnt, kept somewhere you can find it again."
      action={
        <p className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-right">
          <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-navy-100/70">
            Recorded
          </span>
          <span className="block text-[17px] font-extrabold leading-tight tabular-nums text-amber-400">
            {met.length}/{SITUATION_CARDS.length}
          </span>
        </p>
      }
    >
      {met.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface-sunk px-4 py-6 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-ink-soft" aria-hidden="true" />
          <p className="mt-2 text-[14px] font-semibold text-ink">
            Your Casebook is empty
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
            Situation Cards you meet on the city board are recorded here, with
            the warning signs and the safer response.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-civic-600 px-5 text-[14px] font-bold text-white transition hover:bg-civic-700"
          >
            Take a turn
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {met.map((card) => {
            const guardian = guardians.find((g) => g.id === card.guardianId);
            return (
              <li
                key={card.id}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <div className="flex items-start gap-2.5 border-b border-line bg-surface-sunk px-3.5 py-2.5">
                  {guardian && (
                    <GuardianPlate
                      guardian={guardian}
                      className="h-9 w-9 rounded-xl text-[14px]"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-extrabold uppercase leading-tight tracking-wide text-navy-900">
                      {card.title}
                    </h2>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] font-bold text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <span
                          aria-hidden="true"
                          className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[9px] font-extrabold text-white"
                        >
                          {COMPETENCY_LETTER[card.competency]}
                        </span>
                        {COMPETENCY_LABEL[card.competency]}
                      </span>
                      {guardian && <span>· {guardian.name}</span>}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 px-3.5 py-3">
                  <p className="text-[13px] italic leading-relaxed text-ink-muted">
                    “{card.blurb}”
                  </p>

                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                      Warning signs
                    </h3>
                    <ul className="mt-1.5 space-y-1">
                      {card.warningSigns.map((sign) => (
                        <li key={sign} className="flex items-start gap-2">
                          <TriangleAlert
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600"
                            aria-hidden="true"
                          />
                          <span className="text-[13px] leading-snug text-ink">
                            {sign}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-leaf-200 bg-leaf-50 px-3 py-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-leaf-700">
                      Safer response
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink">
                      {card.saferResponse}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </HubPage>
  );
}
