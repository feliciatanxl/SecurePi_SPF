"use client";

import { useMemo } from "react";
import { DISTRICTS } from "@/lib/api/world-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import type {
  District,
  DistrictId,
  MissionNode,
  WorldProgress,
} from "@/lib/types";

/** A node with its live state resolved against the player's own progress. */
export interface ResolvedNode extends MissionNode {
  completed: boolean;
  /** Open, or opened by completing enough in this district. */
  playable: boolean;
  /** How many more activities in this district are needed. Only when locked. */
  remainingToUnlock: number;
}

export interface ResolvedDistrict extends District {
  nodes: ResolvedNode[];
  completed: number;
  total: number;
  /** True once every playable node in the district is done. */
  cleared: boolean;
}

/**
 * Resolves the city board against the player's own completions.
 *
 * The board is deliberately not gated behind chance: every district is
 * reachable from the first second, and the only locked content unlocks through
 * the player's own completions *inside the same district*, so the requirement
 * printed on a locked tile is always something they can act on immediately.
 *
 * `PLANNED` nodes never become playable — they are designed content that is out
 * of scope for this prototype, and are labelled as such rather than pretending
 * to be earnable.
 */
export function useWorld() {
  const { profile } = usePlayer();
  const completed = profile.completedActivities;

  return useMemo(() => {
    const districts: ResolvedDistrict[] = DISTRICTS.map((district) => {
      const doneInDistrict = district.nodes.filter((n) =>
        completed.includes(n.id),
      ).length;

      const nodes: ResolvedNode[] = district.nodes.map((node) => {
        const isDone = completed.includes(node.id);
        const needed = node.requiredInDistrict ?? 0;
        const shortfall = Math.max(0, needed - doneInDistrict);

        return {
          ...node,
          completed: isDone,
          playable:
            node.availability === "OPEN" ||
            (node.availability === "UNLOCK" && shortfall === 0),
          remainingToUnlock: node.availability === "UNLOCK" ? shortfall : 0,
        };
      });

      const playableTotal = nodes.filter(
        (n) => n.availability !== "PLANNED",
      ).length;

      return {
        ...district,
        nodes,
        completed: doneInDistrict,
        total: district.nodes.length,
        cleared: playableTotal > 0 && doneInDistrict >= playableTotal,
      };
    });

    const progress: WorldProgress = {
      completed: districts.reduce((sum, d) => sum + d.completed, 0),
      total: districts.reduce((sum, d) => sum + d.total, 0),
      districts: districts.map((d) => ({
        districtId: d.id,
        name: d.name,
        completed: d.completed,
        total: d.total,
      })),
    };

    return { districts, progress, currentDistrictId: profile.currentDistrictId };
  }, [completed, profile.currentDistrictId]);
}

/** Single district view, resolved the same way. Returns null for a bad id. */
export function useDistrict(id: string): ResolvedDistrict | null {
  const { districts } = useWorld();
  return districts.find((d) => d.id === (id as DistrictId)) ?? null;
}
