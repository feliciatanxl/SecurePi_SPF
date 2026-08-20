"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GuardianCard } from "@/components/player/GuardianCard";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { guardianStanding, usePlayer } from "@/lib/state/PlayerProvider";

/**
 * View 4 — Guardians.
 *
 * Guardians are the visible form of the S.H.I.E.L.D. competencies: each one
 * stands for a prevention skill and strengthens only when that skill is
 * practised, so progression is evidence of learning rather than collection.
 * There is nothing to roll for, nothing to collect and nothing to spend — the
 * selector below only changes which skill you are reading about.
 *
 * On a phone that selector is the whole point: three full cards stacked was
 * two and a half screens of scrolling to compare three things. One card at a
 * time, chosen from a strip, fits. A tablet has room to show all three at once,
 * so it does — same cards, same markup, the strip simply steps out of the way.
 */
export default function GuardiansPage() {
  const { profile, guardians } = usePlayer();

  const currentId = guardians.some((g) => g.id === profile.currentGuardianId)
    ? profile.currentGuardianId
    : guardians[0].id;
  const [selectedId, setSelectedId] = useState(currentId);

  const totalPractised = guardians.reduce(
    (sum, g) => sum + (profile.guardianProgress[g.id] ?? 0),
    0,
  );

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-20 bg-navy-900 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Your Guardians
            </p>
            <h1 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight">
              Skills you are building
            </h1>
          </div>
          <p className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-right text-[11px] font-semibold leading-tight">
            <span className="block text-[15px] font-extrabold tabular-nums text-amber-400">
              {totalPractised}
            </span>
            <span className="text-navy-100">practised</span>
          </p>
        </div>
        <p className="mt-1.5 text-[12px] leading-snug text-navy-100">
          A Guardian grows when you practise its skill in a mission — never when
          you spend anything.
        </p>
      </header>

      <div className="space-y-3.5 px-4 pt-3.5">
        {/* Selector. Hidden once every card is on screen at once. */}
        <div className="md:hidden">
          <h2
            id="guardian-selector"
            className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Choose a Guardian
          </h2>
          <ul
            aria-labelledby="guardian-selector"
            className="grid grid-cols-3 gap-1.5"
          >
            {guardians.map((g) => {
              const { level } = guardianStanding(
                g,
                profile.guardianProgress[g.id] ?? 0,
              );
              const active = g.id === selectedId;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(g.id)}
                    aria-current={active ? "true" : undefined}
                    aria-controls="guardian-detail"
                    className={`flex min-h-[62px] w-full flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1.5 transition ${
                      active
                        ? "border-amber-500 bg-amber-50"
                        : "border-line bg-surface hover:border-civic-200"
                    }`}
                  >
                    <GuardianPlate
                      guardian={g}
                      className="h-7 w-7 rounded-lg text-[12px]"
                      tone={active ? "amber" : "navy"}
                    />
                    <span
                      className={`w-full truncate text-[11px] font-extrabold uppercase tracking-wide ${
                        active ? "text-amber-700" : "text-navy-900"
                      }`}
                    >
                      {g.name}
                    </span>
                    <span className="text-[10px] font-bold tabular-nums text-ink-soft">
                      Lv {level}
                      {g.id === currentId && (
                        <span className="text-amber-700"> · current</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/*
          One set of cards for both layouts: the phone shows the selected one,
          a tablet shows all three. Hiding with CSS rather than unmounting keeps
          a single copy in the accessibility tree at either width.
        */}
        <div
          id="guardian-detail"
          className="space-y-2.5 md:grid md:grid-cols-2 md:items-start md:gap-3 md:space-y-0"
        >
          {guardians.map((g) => (
            <div
              key={g.id}
              className={g.id === selectedId ? "" : "hidden md:block"}
            >
              <GuardianCard
                guardian={g}
                cumulative={profile.guardianProgress[g.id] ?? 0}
                featured={g.id === currentId}
              />
            </div>
          ))}
        </div>

        {/* The board decides what to practise next, so it is the right target
            here rather than hard-coding one mission that may already be done. */}
        <Link
          href="/"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 text-[15px] font-extrabold text-white transition hover:bg-civic-700"
        >
          Practise in ShieldQuest City
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
