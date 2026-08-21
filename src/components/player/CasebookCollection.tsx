"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FolderOpen,
  Lock,
  TriangleAlert,
} from "lucide-react";
import { HubPage } from "@/components/player/HubPage";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { Modal } from "@/components/ui/Modal";
import { SITUATION_CARDS } from "@/lib/api/board-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  type SituationCard,
} from "@/lib/types";

/** The Shield Casebook presented as a discovery collection, with no rarity. */
export function CasebookCollection() {
  const { profile, guardians } = usePlayer();
  const [openId, setOpenId] = useState<string | null>(null);
  const discovered = SITUATION_CARDS.filter((card) => profile.casebook.includes(card.id));
  const openCard = SITUATION_CARDS.find((card) => card.id === openId) ?? null;

  return (
    <HubPage
      eyebrow="Shield Central"
      title="Shield Casebook"
      intro="Every situation you discover becomes a case file you can revisit."
      action={
        <p className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-right">
          <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-navy-100/70">
            Discovered
          </span>
          <span className="block text-[17px] font-extrabold leading-tight tabular-nums text-amber-400">
            {discovered.length}/{SITUATION_CARDS.length}
          </span>
        </p>
      }
    >
      <section className="rounded-2xl border border-civic-100 bg-civic-50 px-3.5 py-3">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-civic-700">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Discovery collection
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
          Case files are learning references, not trading cards. There are no rarity levels or random drops.
        </p>
      </section>

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {SITUATION_CARDS.map((card, index) => {
          const met = profile.casebook.includes(card.id);
          const guardian = guardians.find((item) => item.id === card.guardianId);

          if (!met) {
            return (
              <li key={card.id}>
                <article
                  aria-label={`Undiscovered case file ${index + 1}: Unknown Situation`}
                  className="flex min-h-[154px] flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-sunk px-4 py-4 text-center"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-line text-ink-soft">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-2 text-[18px] font-black tracking-[0.16em] text-ink-soft">???</p>
                  <h2 className="mt-0.5 text-[13px] font-extrabold uppercase tracking-wide text-ink-muted">
                    Unknown Situation
                  </h2>
                  <p className="mt-1 text-[11px] leading-snug text-ink-soft">
                    Meet this Situation Card in ShieldQuest City to open the file.
                  </p>
                </article>
              </li>
            );
          }

          return (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => setOpenId(card.id)}
                className="group flex min-h-[154px] w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-[0_10px_28px_-24px_rgba(11,37,69,0.8)] transition hover:-translate-y-0.5 hover:border-civic-500"
              >
                <span className="flex w-full items-start gap-2.5 bg-gradient-to-r from-navy-900 to-civic-800 px-3.5 py-3 text-white">
                  {guardian && (
                    <GuardianPlate
                      guardian={guardian}
                      className="h-10 w-10 rounded-xl text-[14px]"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-civic-200">
                      Case file {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-0.5 block truncate text-[16px] font-extrabold uppercase tracking-wide">
                      {card.title}
                    </span>
                  </span>
                </span>

                <span className="flex w-full flex-1 flex-col px-3.5 py-3">
                  <span className="text-[12px] font-bold text-amber-700">
                    {card.warningSigns.length} warning signs discovered
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <span className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[9px] font-extrabold text-white">
                        {COMPETENCY_LETTER[card.competency]}
                      </span>
                      {COMPETENCY_LABEL[card.competency]}
                    </span>
                    {guardian && <span>· {guardian.name}</span>}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-civic-700">
                    <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    Open case file
                    <ArrowRight className="ml-auto h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Link
        href="/game"
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
      >
        Explore the city
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>

      <CaseFile
        card={openCard}
        guardian={
          openCard
            ? guardians.find((guardian) => guardian.id === openCard.guardianId)
            : undefined
        }
        onClose={() => setOpenId(null)}
      />
    </HubPage>
  );
}

function CaseFile({
  card,
  guardian,
  onClose,
}: {
  card: SituationCard | null;
  guardian?: Parameters<typeof GuardianPlate>[0]["guardian"];
  onClose: () => void;
}) {
  return (
    <Modal open={card !== null} onClose={onClose} labelledBy="case-file-title" className="bg-surface">
      {card && (
        <div className="flex max-h-[86dvh] min-h-0 flex-col">
          <header className="flex shrink-0 items-start gap-3 bg-gradient-to-r from-navy-900 to-civic-800 px-5 pb-4 pt-5 text-white">
            {guardian && (
              <GuardianPlate guardian={guardian} className="h-14 w-14 rounded-2xl text-lg" />
            )}
            <div className="min-w-0 flex-1 pr-8">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-civic-200">
                Shield Casebook
              </p>
              <h2 id="case-file-title" className="mt-0.5 text-[23px] font-extrabold uppercase leading-tight tracking-tight">
                {card.title}
              </h2>
              <p className="mt-1 text-[11px] font-semibold text-white/75">
                {COMPETENCY_LETTER[card.competency]} · {COMPETENCY_LABEL[card.competency]}
                {guardian ? ` · ${guardian.name}` : ""}
              </p>
            </div>
          </header>

          <div className="thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <p className="text-[14px] italic leading-relaxed text-ink-muted">“{card.blurb}”</p>

            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Warning signs discovered
              </h3>
              <ul className="mt-2 space-y-1.5">
                {card.warningSigns.map((sign) => (
                  <li key={sign} className="flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                    <span className="text-[13px] leading-snug text-ink">{sign}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-leaf-200 bg-leaf-50 px-3.5 py-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-leaf-700">
                Safer response
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink">{card.saferResponse}</p>
            </section>
          </div>

          <div className="shrink-0 border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-navy-900 px-4 text-[14px] font-bold text-white transition hover:bg-navy-800"
            >
              Close case file
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
