"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { usePlayer } from "@/lib/state/PlayerProvider";
import type {
  ChoiceResult,
  DelayedConsequence,
  Scenario,
  ScenarioChoice,
  ScenarioMessage,
} from "@/lib/types";

interface Burst {
  key: number;
  title: string;
  amount?: string;
  tone: "reward" | "positive" | "caution";
}

/**
 * Drives one playthrough of a scenario: load, commit a choice, apply the
 * immediate reward, then schedule the delayed consequence.
 *
 * The delay is the mechanic, not a UI flourish — the reward has to be banked
 * and enjoyed before the cost arrives, otherwise the player learns "risky
 * choices feel bad immediately", which is the opposite of how this works in
 * real life.
 */
export function useScenarioRun(scenarioId: string) {
  const { applyDeltas, advanceGuardian } = usePlayer();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [transcript, setTranscript] = useState<ScenarioMessage[]>([]);
  const [taggedClues, setTaggedClues] = useState<string[]>([]);
  const [pendingChoiceId, setPendingChoiceId] = useState<string | null>(null);
  const [committedChoice, setCommittedChoice] = useState<ScenarioChoice | null>(
    null,
  );
  const [result, setResult] = useState<ChoiceResult | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);
  const [consequence, setConsequence] = useState<DelayedConsequence | null>(
    null,
  );

  const startedAt = useRef<number>(Date.now());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const track = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const load = useCallback(async () => {
    const next = await api.getScenario(scenarioId);
    setScenario(next);
    setTranscript(next.messages);
    startedAt.current = Date.now();
  }, [scenarioId]);

  useEffect(() => {
    void load();
    return clearTimers;
  }, [load, clearTimers]);

  /** Clue tagging is optional and never gates the decision. */
  const toggleClue = useCallback((clueId: string) => {
    setTaggedClues((prev) =>
      prev.includes(clueId)
        ? prev.filter((c) => c !== clueId)
        : [...prev, clueId],
    );
  }, []);

  const choose = useCallback(
    async (choice: ScenarioChoice) => {
      if (committedChoice || pendingChoiceId) return;
      setPendingChoiceId(choice.id);

      const res = await api.submitChoice({
        scenarioId,
        choiceId: choice.id,
        deliberationMs: Date.now() - startedAt.current,
        cluesTagged: taggedClues,
      });

      setPendingChoiceId(null);
      setCommittedChoice(choice);
      setResult(res);

      // 1. The player's reply lands in the transcript.
      setTranscript((prev) => [
        ...prev,
        { id: `reply_${choice.id}`, author: "you", body: choice.reply },
      ]);

      // 2. Immediate, visible payoff.
      applyDeltas(res.deltas);
      setBurst({
        key: Date.now(),
        title: res.flashTitle,
        amount: res.flashAmount,
        tone:
          res.outcome === "SAFE"
            ? "positive"
            : res.outcome === "RISKY"
              ? "reward"
              : "caution",
      });
      track(() => setBurst(null), 2000);

      // 3. A strong decision strengthens the matching Guardian.
      if (res.debrief.guardianId) advanceGuardian(res.debrief.guardianId);

      // 4. The bill, later.
      if (res.delayed) {
        const delayed = res.delayed;
        track(() => {
          applyDeltas(delayed.deltas);
          setConsequence(delayed);
        }, delayed.delayMs);
      }
    },
    [
      advanceGuardian,
      applyDeltas,
      committedChoice,
      pendingChoiceId,
      scenarioId,
      taggedClues,
      track,
    ],
  );

  const replay = useCallback(() => {
    clearTimers();
    setPendingChoiceId(null);
    setCommittedChoice(null);
    setResult(null);
    setBurst(null);
    setConsequence(null);
    setTaggedClues([]);
    void load();
  }, [clearTimers, load]);

  return {
    scenario,
    transcript,
    taggedClues,
    toggleClue,
    pendingChoiceId,
    committedChoice,
    result,
    burst,
    consequence,
    choose,
    replay,
    /** True once a choice is locked in — the choice list stops accepting input. */
    isResolved: Boolean(committedChoice),
  };
}
