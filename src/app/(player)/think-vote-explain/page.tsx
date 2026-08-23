"use client";

import { GroupDecisionRunner } from "@/components/player/GroupDecisionRunner";
import { GROUP_CHAT_JOB } from "@/lib/api/group-decision-data";

/**
 * Think · Vote · Explain — the Digi-District finale.
 *
 * A facilitated group mechanic demonstrated on a single device. The private
 * think, the locked vote, the reasoning and the second vote are the player's
 * own; every figure attributed to a group is an authored simulation and is
 * labelled as one throughout. See `GroupDecisionRunner` for why that line is
 * drawn where it is.
 */
export default function ThinkVoteExplainPage() {
  return (
    <GroupDecisionRunner
      scenario={GROUP_CHAT_JOB}
      backHref="/district/digi"
      backLabel="Back to Digi-District"
    />
  );
}
