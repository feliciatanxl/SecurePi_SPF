"use client";

import { useMemo } from "react";
import { ACHIEVEMENTS } from "@/lib/api/rewards-data";
import { DISTRICT_BADGES } from "@/lib/api/board-data";
import { usePlayer, guardianStanding } from "@/lib/state/PlayerProvider";
import { useWorld } from "@/lib/hooks/useWorld";
import {
  COMPETENCY_ORDER,
  type Achievement,
  type Competency,
  type DistrictBadge,
  type ResolvedAchievement,
} from "@/lib/types";

/**
 * Everything Shield Central reports about the player.
 *
 * All of it is derived from what they have actually completed — there is no
 * separate score, no rating and nothing that could be read as a judgement of
 * the person. Nothing here is comparative: no rank, no percentile, no cohort
 * average, no visibility of anyone else. That is a product rule, not a
 * simplification, and it is why this hook exposes counts and milestones rather
 * than anything that could be sorted into a league table.
 */
export function useShieldProgress() {
  const { profile, guardians } = usePlayer();
  const { districts, progress } = useWorld();

  return useMemo(() => {
    const completedNodes = districts.flatMap((d) =>
      d.nodes.filter((n) => n.completed).map((n) => ({ node: n, district: d })),
    );

    /** How many completed activities practised each S.H.I.E.L.D. skill. */
    const skillCounts = COMPETENCY_ORDER.reduce(
      (acc, c) => ({ ...acc, [c]: 0 }),
      {} as Record<Competency, number>,
    );
    for (const { node } of completedNodes) {
      skillCounts[node.primaryCompetency] += 1;
    }
    const skillsPractised = COMPETENCY_ORDER.filter((c) => skillCounts[c] > 0);

    const districtsVisited = districts.filter((d) => d.completed > 0).length;

    const guardianStandings = guardians.map((g) => ({
      guardian: g,
      cumulative: profile.guardianProgress[g.id] ?? 0,
      ...guardianStanding(g, profile.guardianProgress[g.id] ?? 0),
    }));

    const achievements: ResolvedAchievement[] = ACHIEVEMENTS.map((a) => {
      const raw = achievementProgress(a, {
        skillCounts,
        completedKinds: completedNodes.map(({ node }) => node.kind),
        guardianProgress: profile.guardianProgress,
        skillBreadth: skillsPractised.length,
      });
      const value = Math.min(a.target, raw);
      return { ...a, progress: value, earned: value >= a.target };
    });

    const badges: DistrictBadge[] = profile.districtBadges.map(
      (id) => DISTRICT_BADGES[id],
    );

    return {
      completedNodes,
      skillCounts,
      skillsPractised,
      districtsVisited,
      districtCount: districts.length,
      guardianStandings,
      achievements,
      badges,
      progress,
    };
  }, [districts, guardians, profile.guardianProgress, profile.districtBadges, progress]);
}

function achievementProgress(
  achievement: Achievement,
  data: {
    skillCounts: Record<Competency, number>;
    completedKinds: string[];
    guardianProgress: Record<string, number>;
    skillBreadth: number;
  },
): number {
  const { metric } = achievement;
  switch (metric.kind) {
    case "COMPETENCY":
      return data.skillCounts[metric.competency] ?? 0;
    case "NODE_KIND":
      return data.completedKinds.filter((k) => k === metric.nodeKind).length;
    case "GUARDIAN":
      return data.guardianProgress[metric.guardianId] ?? 0;
    case "SKILL_BREADTH":
      return data.skillBreadth;
  }
}
