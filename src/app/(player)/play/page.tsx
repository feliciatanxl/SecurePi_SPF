"use client";

import { MissionRunner } from "@/components/player/MissionRunner";
import { MULE_ENCOUNTER } from "@/lib/api/mock-data";
import { NODE_EASY_MONEY } from "@/lib/api/world-data";

/**
 * View 2 — Scenario Encounter.
 *
 * The player is the target. "Accept" pays +300 Coins instantly; the delayed
 * consequence lands three seconds later.
 */
export default function PlayPage() {
  return (
    <MissionRunner
      scenarioId={MULE_ENCOUNTER.id}
      activityId={NODE_EASY_MONEY}
      accent="civic"
      eyebrow="Digi-District"
      decisionPrompt="What do you do?"
      backHref="/district/digi"
      backLabel="Back to Digi-District"
    />
  );
}
