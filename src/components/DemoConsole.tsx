"use client";

import { useEffect } from "react";
import { peekForcedDice, setForcedDice } from "@/lib/demo/dice";
import { clearDemoData } from "@/lib/state/demoStorage";

declare global {
  interface Window {
    shieldquestDemo?: {
      reset: () => void;
      setDice: (value: number) => string;
      clearDice: () => string;
    };
  }
}

/**
 * Renders nothing. Exposes a small facilitator console on `window` so the
 * prototype can be driven during a live demonstration without a single control
 * appearing in the youth interface.
 *
 *   shieldquestDemo.reset()      — back to fixture state
 *   shieldquestDemo.setDice(4)   — force the next roll only
 *   shieldquestDemo.clearDice()  — cancel a pending forced roll
 *
 * The dice override is deliberately console-only and one-shot. A workshop needs
 * to reach the space it is about to discuss, and a pitch should not hang on the
 * die cooperating — but a die a player can set is not a die, so it stays out of
 * the game.
 */
export function DemoConsole() {
  useEffect(() => {
    window.shieldquestDemo = {
      reset: () => {
        clearDemoData();
        window.location.reload();
      },
      setDice: (value: number) => {
        const set = setForcedDice(value);
        return set === null
          ? "Dice override cleared — pass a whole number from 1 to 6."
          : `Next roll will be ${set}. This applies once.`;
      },
      clearDice: () => {
        setForcedDice(0);
        return peekForcedDice() === null
          ? "Dice override cleared."
          : "Dice override still set.";
      },
    };
    return () => {
      delete window.shieldquestDemo;
    };
  }, []);

  return null;
}
