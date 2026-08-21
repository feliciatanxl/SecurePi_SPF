"use client";

import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DistrictScene } from "@/components/player/DistrictArt";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { guardianStanding } from "@/lib/state/PlayerProvider";
import { DISTRICT_CHAPTER, GUARDIAN_DIALOGUE } from "@/lib/api/world-data";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  type Competency,
  type DistrictBadge,
  type DistrictId,
  type Guardian,
} from "@/lib/types";

/**
 * District Complete.
 *
 * A milestone, not a rank. It reports what the player practised in this
 * district and the badge they earned for it — there is no position, no score
 * out of anything and no comparison with another participant, here or anywhere
 * else in ShieldQuest.
 */
export function DistrictComplete({
  districtId,
  districtName,
  badge,
  completed,
  total,
  skills,
  guardian,
  guardianCumulative,
  tokensAwarded,
  onClose,
}: {
  districtId: DistrictId | null;
  districtName: string;
  badge?: DistrictBadge;
  completed: number;
  total: number;
  skills: Competency[];
  guardian?: Guardian;
  guardianCumulative: number;
  tokensAwarded: number;
  onClose: () => void;
}) {
  const standing = guardian
    ? guardianStanding(guardian, guardianCumulative)
    : null;

  return (
    <Modal
      open={districtId !== null}
      onClose={onClose}
      labelledBy="district-complete-title"
      className="bg-navy-900"
    >
      {districtId && (
        <div className="animate-slide-up flex max-h-[88dvh] min-h-0 flex-col text-white">
          <div className="relative h-[92px] w-full shrink-0 overflow-hidden">
            <DistrictScene districtId={districtId} className="opacity-100" />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent"
            />
          </div>

          <header className="shrink-0 px-5 pb-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              District complete
            </p>
            <h2
              id="district-complete-title"
              className="mt-0.5 text-[26px] font-extrabold uppercase leading-tight tracking-tight"
            >
              {districtName}
            </h2>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.14em] text-civic-200">
              {DISTRICT_CHAPTER[districtId].title}
            </p>
          </header>

          <div className="thin-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 pb-3">
            <div className="rounded-2xl border border-white/15 bg-white/8 p-3.5">
              <p className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-navy-100">
                Activities
                <span className="text-[15px] tabular-nums text-white">
                  {completed} / {total}
                </span>
              </p>

              <div className="border-b border-white/10 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy-100">
                  Skills practised
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {skills.map((c) => (
                    <li
                      key={c}
                      className="flex items-center gap-1.5 rounded-md bg-white/12 px-1.5 py-1 text-[11px] font-bold"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-4 w-4 place-items-center rounded bg-amber-400 text-[10px] font-extrabold text-navy-900"
                      >
                        {COMPETENCY_LETTER[c]}
                      </span>
                      {COMPETENCY_LABEL[c]}
                    </li>
                  ))}
                </ul>
              </div>

              {guardian && standing && (
                <p className="flex items-center gap-2 pt-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-navy-100">
                  <GuardianPlate
                    guardian={guardian}
                    className="h-5 w-5 rounded text-[10px]"
                  />
                  {guardian.name} progress
                  <span className="ml-auto text-[15px] tabular-nums text-white">
                    {standing.progress} / {standing.target}
                  </span>
                </p>
              )}
            </div>

            <p className="flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-[15px] font-extrabold text-navy-900">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {tokensAwarded > 0
                ? `+${tokensAwarded} Shield Tokens`
                : "Shield Tokens already earned"}
            </p>

            {badge && (
              <div className="rounded-2xl border border-white/15 bg-white/8 p-3.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-100">
                  District badge earned
                </p>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-2 grid h-14 w-14 place-items-center rounded-full border-4 border-white/70 bg-civic-600"
                >
                  <Shield className="h-6 w-6 text-white" />
                </span>
                <p className="mt-2 text-[17px] font-extrabold uppercase tracking-wide">
                  {badge.name}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-navy-100">
                  {badge.blurb}
                </p>
              </div>
            )}

            {guardian && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-400/35 bg-amber-400/10 p-3.5">
                <GuardianPlate
                  guardian={guardian}
                  className="guardian-reaction h-12 w-12 rounded-2xl text-base"
                  tone="amber"
                />
                <p className="text-[12px] font-semibold leading-snug text-white">
                  <span className="block text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-300">
                    {guardian.name}
                  </span>
                  “{GUARDIAN_DIALOGUE[guardian.id]?.success ?? guardian.motto}”
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-navy-900 transition hover:bg-amber-400 active:translate-y-[3px] active:border-b-0"
            >
              Continue exploring
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
