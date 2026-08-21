/**
 * The die.
 *
 * Six faces, uniform, and it decides exactly one thing: how many spaces the
 * token moves. It cannot make a decision safe, pay a Shield Token, level a
 * Guardian or decide that anybody won. Randomness picks the situation; the
 * player picks what happens in it.
 */

/**
 * A one-shot override for the next roll, set from the browser console via
 * `shieldquestDemo.setDice(4)`.
 *
 * A facilitator running a workshop needs to be able to land on the space they
 * are about to talk about, and a demonstration should not depend on the dice
 * cooperating. It is deliberately console-only and consumed after one roll —
 * there is no control for it anywhere in the youth interface, because a die a
 * player can set is not a die.
 */
let forcedNextRoll: number | null = null;

export function setForcedDice(value: number): number | null {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 1 || n > 6) {
    forcedNextRoll = null;
    return null;
  }
  forcedNextRoll = n;
  return n;
}

export function peekForcedDice(): number | null {
  return forcedNextRoll;
}

/** Rolls, consuming a pending override if one was set. */
export function rollDie(): number {
  if (forcedNextRoll !== null) {
    const value = forcedNextRoll;
    forcedNextRoll = null;
    return value;
  }
  return 1 + Math.floor(Math.random() * 6);
}
