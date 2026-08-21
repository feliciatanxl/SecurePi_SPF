"use client";

import { useEffect, useState } from "react";

/**
 * Whether motion should be reduced.
 *
 * True when the operating system asks for it, or when the player has asked for
 * it in Settings. The player's own switch can only ever turn motion *down* —
 * someone whose device is set to reduce motion never gets animation back
 * because an app setting says otherwise.
 *
 * Starts false on both the server and the first client render so hydration has
 * nothing to disagree about, then settles in an effect. The CSS in globals.css
 * already covers the OS preference for animations; this hook exists for the
 * behaviour CSS cannot reach — the length of a dice roll, whether the token
 * walks or teleports, whether the board camera pans or jumps.
 */
export function useReducedMotion(playerPreference = false): boolean {
  const [system, setSystem] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystem(query.matches);

    const onChange = (event: MediaQueryListEvent) => setSystem(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return system || playerPreference;
}
