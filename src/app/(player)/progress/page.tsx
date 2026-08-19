"use client";

import Link from "next/link";
import { ArrowRight, Lock, MapPin } from "lucide-react";
import { DISTRICT_SKIN } from "@/components/player/DistrictCard";
import { SkillTag } from "@/components/player/MissionNode";
import { WorldProgress } from "@/components/player/WorldProgress";
import { useWorld } from "@/lib/hooks/useWorld";
import { NODE_KIND_LABEL } from "@/lib/types";

/**
 * City Progress.
 *
 * A personal record of what the player has practised, and what is still open to
 * them. Deliberately not a scoreboard — no ranking, no cohort comparison, no
 * peer visibility. The only comparison offered is against the player's own
 * remaining activities.
 */
export default function ProgressPage() {
  const { districts, progress } = useWorld();

  const completedNodes = districts.flatMap((d) =>
    d.nodes.filter((n) => n.completed).map((n) => ({ node: n, district: d })),
  );

  return (
    <div className="pb-8">
      <header className="bg-navy-900 px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
          City progress
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">
          What you have practised
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-navy-100">
          Your own record across ShieldQuest City. Progress here is personal — it
          is never shown to other participants or ranked against them.
        </p>
      </header>

      <div className="space-y-5 px-5 pt-5">
        <WorldProgress progress={progress} />

        <section aria-labelledby="by-district">
          <h2
            id="by-district"
            className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            By district
          </h2>
          <div className="space-y-2.5">
            {districts.map((d) => {
              const skin = DISTRICT_SKIN[d.id];
              const Icon = skin.icon;
              const open = d.nodes.filter(
                (n) => n.playable && !n.completed,
              ).length;
              const locked = d.nodes.filter((n) => !n.playable).length;

              return (
                <Link
                  key={d.id}
                  href={`/district/${d.id}`}
                  className={`block rounded-2xl border p-3.5 transition hover:-translate-y-0.5 ${skin.header}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${skin.plate}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-extrabold uppercase tracking-wide text-navy-900">
                        {d.name}
                      </h3>
                      <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-ink-muted">
                        {d.completed} / {d.total} completed
                        {open > 0 && ` · ${open} open`}
                        {locked > 0 && ` · ${locked} locked`}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-navy-900/40"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="activities-done">
          <h2
            id="activities-done"
            className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Activities completed
          </h2>

          {completedNodes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong bg-surface-sunk px-4 py-8 text-center">
              <MapPin
                className="mx-auto h-5 w-5 text-ink-soft"
                aria-hidden="true"
              />
              <p className="mt-2 text-[14px] font-semibold text-ink">
                Nothing completed yet
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                Pick any district on the city board to make a start.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-civic-600 px-5 text-[14px] font-bold text-white transition hover:bg-civic-700"
              >
                Open ShieldQuest City
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {completedNodes.map(({ node, district }) => (
                <li
                  key={node.id}
                  className="rounded-xl border border-line bg-surface px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[14px] font-bold text-navy-900">
                      {node.title}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      {NODE_KIND_LABEL[node.kind]} · {district.name}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <SkillTag competency={node.primaryCompetency} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ShieldQuest records what you have practised so it can suggest what to
          practise next. It does not profile you, predict behaviour, or share
          your progress with other participants.
        </p>
      </div>
    </div>
  );
}
