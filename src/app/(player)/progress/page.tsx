"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Lock, MapPin } from "lucide-react";
import { DistrictPlate } from "@/components/player/DistrictArt";
import { SkillTag } from "@/components/player/MissionNode";
import { useWorld } from "@/lib/hooks/useWorld";
import { NODE_KIND_LABEL } from "@/lib/types";

/**
 * City Progress.
 *
 * A personal record of what the player has practised, and what is still open to
 * them. Deliberately not a scoreboard — no ranking, no cohort comparison, no
 * peer visibility. The only comparison offered is against the player's own
 * remaining activities.
 *
 * The headline figure and the four districts are one compact list rather than
 * a progress card followed by four tiles repeating it: on a phone that was the
 * same four numbers twice, and neither copy fitted on screen with the other.
 */
export default function ProgressPage() {
  const { districts, progress } = useWorld();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const completedNodes = districts.flatMap((d) =>
    d.nodes.filter((n) => n.completed).map((n) => ({ node: n, district: d })),
  );

  const pct = progress.total
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 bg-navy-900 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              City progress
            </p>
            <h1 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight">
              What you have practised
            </h1>
          </div>
          <p className="shrink-0 text-right text-[11px] font-semibold leading-tight text-navy-100">
            <span className="block text-[18px] font-extrabold tabular-nums text-amber-400">
              {progress.completed}/{progress.total}
            </span>
            activities
          </p>
        </div>
        <span
          aria-hidden="true"
          className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/15"
        >
          <span
            className="block h-full rounded-full bg-amber-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </span>
      </header>

      <div className="space-y-3.5 px-4 pt-3.5">
        <section aria-labelledby="by-district">
          <h2
            id="by-district"
            className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            By district
          </h2>
          <ul className="space-y-1.5">
            {districts.map((d) => {
              const open = d.nodes.filter(
                (n) => n.playable && !n.completed,
              ).length;
              // Planned content is counted apart from locked content: one is
              // earned by playing here, the other is simply not built yet.
              const locked = d.nodes.filter(
                (n) => !n.playable && n.availability === "UNLOCK",
              ).length;
              const planned = d.nodes.filter(
                (n) => n.availability === "PLANNED",
              ).length;

              return (
                <li key={d.id}>
                  <Link
                    href={`/district/${d.id}`}
                    className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-2 transition hover:border-civic-500"
                  >
                    <DistrictPlate
                      districtId={d.id}
                      className="h-9 w-9 rounded-lg"
                      iconClassName="h-4 w-4"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-extrabold uppercase tracking-wide text-navy-900">
                        {d.name}
                      </span>
                      <span className="block text-[11px] font-semibold text-ink-soft">
                        {d.cleared
                          ? "Cleared"
                          : open > 0
                            ? `${open} open`
                            : "Nothing open yet"}
                        {locked > 0 && ` · ${locked} locked`}
                        {planned > 0 && ` · ${planned} coming soon`}
                      </span>
                    </span>
                    <span className="shrink-0 text-[14px] font-extrabold tabular-nums text-navy-900">
                      {d.completed}/{d.total}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-navy-900/40"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="activities-done">
          <h2
            id="activities-done"
            className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Activities completed
          </h2>

          {completedNodes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong bg-surface-sunk px-4 py-5 text-center">
              <MapPin
                className="mx-auto h-5 w-5 text-ink-soft"
                aria-hidden="true"
              />
              <p className="mt-1.5 text-[14px] font-semibold text-ink">
                Nothing completed yet
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
                Pick any stop on the city board to make a start.
              </p>
              <Link
                href="/"
                className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-civic-600 px-5 text-[14px] font-bold text-white transition hover:bg-civic-700"
              >
                Open ShieldQuest City
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {completedNodes.map(({ node, district }) => (
                <li
                  key={node.id}
                  className="rounded-xl border border-line bg-surface px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[14px] font-bold text-navy-900">
                      {node.title}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      {NODE_KIND_LABEL[node.kind]} · {district.name}
                    </span>
                  </div>
                  <div className="mt-1">
                    <SkillTag competency={node.primaryCompetency} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* The privacy promise stays on the page, one tap from plain sight. */}
        <div className="rounded-xl border border-line bg-surface-sunk">
          <button
            type="button"
            onClick={() => setPrivacyOpen((v) => !v)}
            aria-expanded={privacyOpen}
            aria-controls="progress-privacy"
            className="flex min-h-[44px] w-full items-center gap-2 px-3.5 text-left text-[12px] font-bold text-ink-muted"
          >
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="flex-1">How ShieldQuest uses this</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${privacyOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {privacyOpen && (
            <p
              id="progress-privacy"
              className="border-t border-line px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-muted"
            >
              ShieldQuest records what you have practised so it can suggest what
              to practise next. It does not profile you, predict behaviour, rank
              you against other participants, or share your progress with them.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
