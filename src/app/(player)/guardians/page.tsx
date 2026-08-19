"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GuardianCard } from "@/components/player/GuardianCard";
import { guardianStanding, usePlayer } from "@/lib/state/PlayerProvider";
import { COMPETENCY_LABEL, COMPETENCY_LETTER } from "@/lib/types";

/**
 * View 4 — Guardians.
 *
 * Guardians are the visible form of the S.H.I.E.L.D. competencies: each one
 * stands for a prevention skill and strengthens only when that skill is
 * practised, so progression is evidence of learning rather than collection.
 */
export default function GuardiansPage() {
  const { profile, guardians } = usePlayer();
  const current =
    guardians.find((g) => g.id === profile.currentGuardianId) ?? guardians[0];
  const others = guardians.filter((g) => g.id !== current.id);

  const totalPractised = guardians.reduce(
    (sum, g) => sum + (profile.guardianProgress[g.id] ?? 0),
    0,
  );

  return (
    <div className="pb-6">
      <header className="rounded-b-3xl bg-navy-900 px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
          Your Guardians
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">
          Skills you are building
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-navy-100">
          Each Guardian represents one prevention skill. They grow when you
          practise that skill in a mission — not when you spend anything.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold">
          <span className="tabular-nums text-amber-400">{totalPractised}</span>
          <span className="text-navy-100">decisions practised so far</span>
        </p>
      </header>

      <div className="space-y-5 px-5 pt-6">
        <section aria-labelledby="current-guardian">
          <h2
            id="current-guardian"
            className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Current Guardian
          </h2>
          <GuardianCard
            guardian={current}
            cumulative={profile.guardianProgress[current.id] ?? 0}
            featured
          />
        </section>

        <section aria-labelledby="all-guardians">
          <h2
            id="all-guardians"
            className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Also in training
          </h2>
          <div className="space-y-3">
            {others.map((g) => (
              <GuardianCard
                key={g.id}
                guardian={g}
                cumulative={profile.guardianProgress[g.id] ?? 0}
              />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="skills-practised"
          className="rounded-2xl border border-line bg-surface p-4"
        >
          <h2
            id="skills-practised"
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Skills practised
          </h2>
          <ul className="mt-3 space-y-2">
            {guardians.map((g) => {
              const { level } = guardianStanding(
                g,
                profile.guardianProgress[g.id] ?? 0,
              );
              return (
                <li key={g.id} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-navy-900 text-[11px] font-extrabold text-white"
                  >
                    {COMPETENCY_LETTER[g.competency]}
                  </span>
                  <span className="flex-1 text-[14px] font-medium text-ink">
                    {COMPETENCY_LABEL[g.competency]}
                  </span>
                  <span className="text-[13px] font-bold text-ink-muted tabular-nums">
                    Lv {level}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <Link
          href="/play"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 text-[15px] font-extrabold text-white transition hover:bg-civic-700"
        >
          Practise a mission
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
