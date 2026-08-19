import { Zap } from "lucide-react";
import { ScenarioRunner } from "@/components/player/ScenarioRunner";
import { MULE_ENCOUNTER } from "@/lib/api/mock-data";

export const metadata = { title: "Encounter · ShieldQuest" };

/**
 * View 1 — Scenario Encounter.
 *
 * The player is the target. Choosing "Accept" pays +300 Coins instantly, then
 * three seconds later the account-frozen consequence lands.
 */
export default function PlayPage() {
  return (
    <ScenarioRunner
      scenarioId={MULE_ENCOUNTER.id}
      accentLabel="Encounter"
      accentIcon={<Zap className="h-3 w-3" />}
    />
  );
}
