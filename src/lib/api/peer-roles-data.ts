import type { PeerRole } from "@/lib/types";

/**
 * Rotating facilitated squad roles for Think · Vote · Explain.
 *
 * ## Why three roles rather than none
 *
 * A group question with no roles is answered by whoever speaks first. Everybody
 * else either agrees or says nothing, which is the exact social dynamic the
 * mechanic is trying to interrupt — and the one that decides what a group chat
 * does about a friend being recruited. Giving three people three different jobs
 * puts three readings of the same situation on the table before anyone has to
 * agree with anything: is this safe, is this true, and how would we help.
 *
 * ## What they are not
 *
 * They are a facilitation device, not a game mechanic. No role is better than
 * another, none of them is scored, none of them changes what the activity
 * awards, and there is no role progression to collect. In a real session a
 * facilitator hands them out and rotates them between rounds so the same young
 * person is not the Safety Lead every time.
 *
 * ## What the prototype can honestly show
 *
 * One device, one participant. This prototype shows the role a participant
 * would be holding and rotates it each time the activity is run, so the
 * rotation itself can be demonstrated end to end. It does not pretend the local
 * player is three connected people, and every surface that shows a role says
 * so.
 */
export const PEER_ROLES: PeerRole[] = [
  {
    id: "role_safety_lead",
    name: "Safety Lead",
    purpose:
      "Keeps the discussion on the safer and more responsible response.",
    prompt: "What choice best protects the person and the group?",
    brief: "Watch for the option that lowers the risk to everyone involved.",
  },
  {
    id: "role_evidence_checker",
    name: "Evidence Checker",
    purpose:
      "Identifies clues, assumptions and information that should be verified.",
    prompt: "What evidence supports this claim, and what still needs checking?",
    brief: "Look for the clue people may be overlooking.",
  },
  {
    id: "role_peer_supporter",
    name: "Peer Supporter",
    purpose:
      "Considers how to help or redirect someone without blame or embarrassment.",
    prompt: "How could you support this person safely?",
    brief: "Think about what would actually help, not what would win.",
  },
];

/**
 * The role a participant holds for a given facilitated round.
 *
 * Deterministic and cyclic, so the same round always shows the same role and a
 * demonstration can be repeated exactly. Round 0 opens on Evidence Checker,
 * which is the role that fits a first read of a situation, and rotation then
 * runs Peer Supporter → Safety Lead → back around. `PEER_ROLES` stays in the
 * order the roles are described in, and the offset here does the rotating.
 */
export function peerRoleForRound(round: number): PeerRole {
  const count = PEER_ROLES.length;
  const index = (((round + 1) % count) + count) % count;
  return PEER_ROLES[index];
}

/** The role that follows the one held this round. */
export function nextPeerRole(round: number): PeerRole {
  return peerRoleForRound(round + 1);
}

/** Shown wherever a role appears, so the prototype's limits are never implied away. */
export const PEER_ROLE_DISCLOSURE =
  "Facilitated Role Demonstration. In a facilitated group session these roles are held by different participants and rotate between rounds. This prototype runs on one device and shows the role one participant would be holding — it does not represent three connected users.";
