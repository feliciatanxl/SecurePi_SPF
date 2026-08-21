"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Shield } from "lucide-react";
import { HubPage, HubSection } from "@/components/player/HubPage";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { SkillTag } from "@/components/player/MissionNode";
import { useShieldProgress } from "@/lib/hooks/useShieldProgress";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { NODE_KIND_LABEL } from "@/lib/types";

/**
 * My Shield Journey.
 *
 * A personal learning history — what has been completed, which districts have
 * been visited, which skills have been practised, which Guardians are growing.
 *
 * There is no rank, no percentile, no cohort average and nothing that compares
 * this player with another. That is a product rule for a youth crime-prevention
 * programme, not a gap in the design.
 */
export default function JourneyPage() {
  const { profile } = usePlayer();
  const {
    completedNodes,
    skillsPractised,
    districtsVisited,
    districtCount,
    guardianStandings,
    badges,
    progress,
  } = useShieldProgress();

  const recent = [...completedNodes].reverse().slice(0, 5);

  return (
    <HubPage
      eyebrow="Shield Central"
      title="My Shield Journey"
      intro="Everything you have practised so far. This is yours alone — it is never ranked or compared."
    >
      <ul className="grid grid-cols-2 gap-2.5">
        <Figure value={progress.completed} label="Activities completed" />
        <Figure
          value={`${districtsVisited} / ${districtCount}`}
          label="Districts visited"
        />
        <Figure
          value={`${skillsPractised.length} / 6`}
          label="S.H.I.E.L.D. skills practised"
        />
        <Figure value={badges.length} label="District badges" />
      </ul>

      <HubSection title="Guardians developing">
        <ul className="space-y-2">
          {guardianStandings.map(({ guardian, level, progress: p, target }) => (
            <li
              key={guardian.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5"
            >
              <GuardianPlate
                guardian={guardian}
                className="h-10 w-10 rounded-xl text-[15px]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold uppercase tracking-wide text-navy-900">
                  {guardian.name}
                </span>
                <span className="block text-[12px] font-semibold text-ink-soft">
                  {guardian.skill} · Level {level}
                </span>
              </span>
              <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-navy-900">
                {p}/{target}
              </span>
            </li>
          ))}
        </ul>
      </HubSection>

      {badges.length > 0 && (
        <HubSection title="District badges">
          <ul className="space-y-2">
            {badges.map((badge) => (
              <li
                key={badge.districtId}
                className="flex items-center gap-3 rounded-2xl border border-leaf-200 bg-leaf-50 px-3 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-600 text-white"
                >
                  <Shield className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-extrabold uppercase tracking-wide text-leaf-700">
                    {badge.name}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-muted">
                    {badge.blurb}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </HubSection>
      )}

      <HubSection title="Recent activity">
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface-sunk px-4 py-5 text-center">
            <MapPin className="mx-auto h-5 w-5 text-ink-soft" aria-hidden="true" />
            <p className="mt-1.5 text-[14px] font-semibold text-ink">
              Nothing completed yet
            </p>
            <Link
              href="/"
              className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-civic-600 px-5 text-[14px] font-bold text-white transition hover:bg-civic-700"
            >
              Take your first turn
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {recent.map(({ node, district }) => (
              <li
                key={node.id}
                className="rounded-xl border border-line bg-surface px-3 py-2"
              >
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[14px] font-bold text-navy-900">
                    {node.title}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    {NODE_KIND_LABEL[node.kind]} · {district.name}
                  </span>
                </p>
                <div className="mt-1">
                  <SkillTag competency={node.primaryCompetency} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </HubSection>

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
        ShieldQuest records what you have practised so it can suggest what to
        practise next. It does not profile you, predict behaviour, score your
        risk, or share your progress with other participants. Your journey is
        stored on this device only, and Reset Local Progress in Settings clears
        it. Playing as {profile.handle}.
      </p>
    </HubPage>
  );
}

function Figure({ value, label }: { value: string | number; label: string }) {
  return (
    <li className="rounded-2xl border border-line bg-surface px-3 py-2.5">
      <p className="text-[22px] font-extrabold leading-tight tabular-nums text-navy-900">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-bold uppercase leading-snug tracking-[0.08em] text-ink-soft">
        {label}
      </p>
    </li>
  );
}
