"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { stepsForRoll } from "@/lib/api/board-data";
import { rollDie } from "@/lib/demo/dice";
import { playCue } from "@/lib/sound";
import { usePlayer } from "@/lib/state/PlayerProvider";

export type TurnPhase = "idle" | "rolling" | "result" | "moving" | "landed";

/** Timings for a full turn. Every one of them collapses under reduced motion. */
const TUMBLE_MS = 620;
const RESULT_MS = 780;
const STEP_MS = 300;

/**
 * One turn of the city board: roll, show the result, walk the token, land.
 *
 * The board position is only committed to the player's profile when the token
 * arrives, so a refresh in the middle of a move leaves the player where they
 * started rather than somewhere they never actually reached.
 */
export function useDiceTurn({
  position,
  reducedMotion,
  sound,
  onLand,
}: {
  position: number;
  reducedMotion: boolean;
  sound: boolean;
  /** Called once the token has arrived, with the space index landed on. */
  onLand: (index: number) => void;
}) {
  const { moveToSpace } = usePlayer();

  const [phase, setPhase] = useState<TurnPhase>("idle");
  const [value, setValue] = useState<number | null>(null);
  const [tokenIndex, setTokenIndex] = useState(position);
  const [steppingIndices, setSteppingIndices] = useState<number[]>([]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const after = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  /*
   * The token follows the stored position whenever a turn is not in progress —
   * which is what brings it back to the right space after a mission, and what
   * places it correctly once the saved session hydrates.
   */
  useEffect(() => {
    if (phase === "idle") setTokenIndex(position);
  }, [phase, position]);

  const roll = useCallback(() => {
    if (phase !== "idle") return;

    const rolled = rollDie();
    const steps = stepsForRoll(position, rolled);
    const destination = steps[steps.length - 1];

    setValue(rolled);
    setPhase("rolling");
    playCue("roll", sound);

    const tumble = reducedMotion ? 0 : TUMBLE_MS;
    const hold = reducedMotion ? 0 : RESULT_MS;
    const step = reducedMotion ? 0 : STEP_MS;

    after(() => setPhase("result"), tumble);

    after(() => {
      setPhase("moving");
      setSteppingIndices(steps);

      steps.forEach((index, i) => {
        after(() => setTokenIndex(index), step * (i + 1));
      });

      after(
        () => {
          setSteppingIndices([]);
          setPhase("landed");
          moveToSpace(destination);
          playCue("land", sound);
          onLand(destination);
        },
        step * steps.length + (reducedMotion ? 0 : 160),
      );
    }, tumble + hold);
  }, [after, moveToSpace, onLand, phase, position, reducedMotion, sound]);

  /** Ends the turn once the landing sheet is dismissed. */
  const endTurn = useCallback(() => {
    setPhase("idle");
    setValue(null);
    setSteppingIndices([]);
  }, []);

  return {
    phase,
    value,
    tokenIndex,
    steppingIndices,
    roll,
    endTurn,
    busy: phase !== "idle" && phase !== "landed",
  };
}
