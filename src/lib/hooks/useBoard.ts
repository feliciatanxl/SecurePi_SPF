"use client";

import { useMemo } from "react";
import {
  BOARD_SPACES,
  findSituationCard,
  normaliseBoardPosition,
} from "@/lib/api/board-data";
import { findNode } from "@/lib/api/world-data";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { useWorld, type ResolvedNode } from "@/lib/hooks/useWorld";
import type { BoardSpace, DistrictId, SituationCard } from "@/lib/types";

/** A board space with its live state resolved against the player's progress. */
export interface ResolvedSpace extends BoardSpace {
  /** The activity behind this space, when it has one. */
  node?: ResolvedNode;
  card?: SituationCard;
  /** True for an activity space whose activity is done. */
  completed: boolean;
  /** True for a checkpoint the player has already stood on. */
  visited: boolean;
  isCurrent: boolean;
  /** Activity spaces whose content is designed but not built in this prototype. */
  planned: boolean;
  /** Activity spaces still waiting on a district unlock. */
  locked: boolean;
  /** True when landing here leads somewhere the player can act on. */
  actionable: boolean;
}

/**
 * The city track, resolved against the player's own progress.
 *
 * Nothing here consults the dice. A space's state comes from what the player
 * has completed and where their token stands — the roll only ever decides which
 * space they arrive at next.
 */
export function useBoard() {
  const { profile } = usePlayer();
  const { districts } = useWorld();

  const position = normaliseBoardPosition(profile.boardPosition);
  const completed = profile.completedActivities;
  const visited = profile.visitedSpaces;

  return useMemo(() => {
    const nodeById = new Map<string, ResolvedNode>();
    for (const district of districts) {
      for (const node of district.nodes) nodeById.set(node.id, node);
    }

    const spaces: ResolvedSpace[] = BOARD_SPACES.map((space) => {
      const node = space.nodeId ? nodeById.get(space.nodeId) : undefined;
      const planned = node?.availability === "PLANNED";
      const locked = Boolean(node) && !node!.playable && !planned;

      return {
        ...space,
        node,
        card: space.situationCardId
          ? findSituationCard(space.situationCardId)
          : undefined,
        completed: node ? node.completed : false,
        visited: visited.includes(space.index),
        isCurrent: space.index === position,
        planned,
        locked,
        // Checkpoints always have something to show; activity spaces only when
        // the activity is actually playable.
        actionable: node ? node.playable : true,
      };
    });

    const current = spaces[position];

    /** Personal board progress: activity spaces finished, out of those built. */
    const playableSpaces = spaces.filter((s) => s.node && !s.planned);
    const boardCompleted = playableSpaces.filter((s) => s.completed).length;

    return {
      spaces,
      current,
      position,
      boardCompleted,
      boardPlayable: playableSpaces.length,
    };
  }, [districts, position, completed, visited]);
}

/** Static lookup used outside the hook, e.g. by the landing sheet's copy. */
export function spaceDistrictName(
  districtId: DistrictId | undefined,
  districts: { id: DistrictId; name: string }[],
): string {
  if (!districtId) return "Shield Central";
  return districts.find((d) => d.id === districtId)?.name ?? "ShieldQuest City";
}

/** Where a space's activity leads, if anywhere. */
export function spaceHref(space: ResolvedSpace): string | undefined {
  if (!space.nodeId) return undefined;
  return findNode(space.nodeId)?.href;
}
