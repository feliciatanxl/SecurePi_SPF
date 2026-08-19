import { Users } from "lucide-react";
import { ScenarioRunner } from "@/components/player/ScenarioRunner";
import { MULE_PEER_SHIELD } from "@/lib/api/mock-data";

export const metadata = { title: "Peer Shield · ShieldQuest" };

/**
 * View 2 — Peer Shield Mode.
 *
 * Same threat, but the player is the bystander. Constructive intervention pays
 * Community Resilience Points; silence costs them.
 */
export default function PeerShieldPage() {
  return (
    <ScenarioRunner
      scenarioId={MULE_PEER_SHIELD.id}
      accentLabel="Peer Shield"
      accentIcon={<Users className="h-3 w-3" />}
    />
  );
}
