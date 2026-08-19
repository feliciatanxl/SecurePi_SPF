"use client";

import { MissionRunner } from "@/components/player/MissionRunner";
import { MULE_PEER_SHIELD } from "@/lib/api/mock-data";
import { NODE_PEER_JAYDEN } from "@/lib/api/world-data";

/**
 * View 3 — Peer Shield Mode.
 *
 * Same threat, but the player is the bystander. Constructive intervention pays
 * Community Resilience; staying silent costs it.
 */
export default function PeerShieldPage() {
  return (
    <MissionRunner
      scenarioId={MULE_PEER_SHIELD.id}
      activityId={NODE_PEER_JAYDEN}
      accent="teal"
      eyebrow="Peer Shield"
      friend={{
        name: "Jayden",
        quote:
          "Bro this guy says he'll pay me $300. I just need to receive the money first.",
      }}
      modeBadge="Peer Shield"
      note="In Peer Shield you are not the target. You are practising how to help a friend step back from a risky decision — without confronting anyone or putting yourself in the middle of it."
      decisionPrompt="What would you do if this was your friend?"
      skillCaption="Peer Shield skill"
      backHref="/district/community"
      backLabel="Back to Community Hub"
    />
  );
}
