"use client";

import { MissionRunner } from "@/components/player/MissionRunner";
import { MULE_ENCOUNTER } from "@/lib/api/mock-data";

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
      accent="civic"
      eyebrow="Mission"
      decisionPrompt="What do you do?"
      backHref="/"
      backLabel="Back to missions"
    />
  );
}
