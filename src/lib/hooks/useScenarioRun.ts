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

type BurstTone = "reward" | "resilience" | "penalty";

interface Burst {
  key: number;
  label: string;
  tone: BurstTone;
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
  const { applyDeltas } = usePlayer();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [transcript, setTranscript] = useState<ScenarioMessage[]>([]);
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

  // Load (and reload on replay).
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

  const choose = useCallback(
    async (choice: ScenarioChoice) => {
      if (committedChoice || pendingChoiceId) return;
      setPendingChoiceId(choice.id);

      const submission = {
        scenarioId,
        choiceId: choice.id,
        deliberationMs: Date.now() - startedAt.current,
      };
      const res = await api.submitChoice(submission);

      setPendingChoiceId(null);
      setCommittedChoice(choice);
      setResult(res);

      // 1. Player's reply lands in the transcript.
      setTranscript((prev) => [
        ...prev,
        { id: `reply_${choice.id}`, author: "you", body: choice.reply },
      ]);

      // 2. Immediate, visible payoff.
      applyDeltas({ coins: res.coinDelta, resilience: res.resilienceDelta });
      setBurst({
        key: Date.now(),
        label: res.flash,
        tone:
          res.resilienceDelta < 0
            ? "penalty"
            : res.coinDelta > 0 && res.resilienceDelta <= 0
              ? "reward"
              : "resilience",
      });
      track(() => setBurst(null), 1700);

      // 3. The bill, later.
      if (res.delayed) {
        const delayed = res.delayed;
        track(() => {
          applyDeltas({ coins: delayed.coinDelta });
          setConsequence(delayed);
        }, delayed.delayMs);
      }
    },
    [applyDeltas, committedChoice, pendingChoiceId, scenarioId, track],
  );

  const replay = useCallback(() => {
    clearTimers();
    setPendingChoiceId(null);
    setCommittedChoice(null);
    setResult(null);
    setBurst(null);
    setConsequence(null);
    void load();
  }, [clearTimers, load]);

  return {
    scenario,
    transcript,
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
