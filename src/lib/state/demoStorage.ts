/**
 * Browser storage for the prototype demo only.
 *
 * This exists so a stray page refresh during a live demonstration does not wipe
 * the player's progress or a Flash Mission that was just deployed on stage. It
 * is NOT a data layer: the mock fixtures remain the source of truth, this only
 * overlays what happened during the current demo session.
 *
 * Every access is guarded and wrapped, so private-browsing, disabled storage or
 * a corrupt value degrades silently to the existing in-memory behaviour rather
 * than breaking the demo.
 */

export const PLAYER_STATE_KEY = "shieldquest-demo-player-state";
export const FLASH_MISSIONS_KEY = "shieldquest-demo-flash-missions";

/**
 * Stored shapes are versioned per key, not globally.
 *
 * The player profile grew a board position, Shield Tokens, unlocked cosmetics
 * and a casebook when the roll-and-move layer landed (v2), then persistent
 * district discovery (v3). The deployed Flash Missions did not change shape at
 * all, and a single global
 * version number would have thrown them away for no reason — which, mid-
 * demonstration, is exactly the failure this module exists to prevent.
 *
 * A reader gets the envelope's version back and decides: migrate it, or fall
 * back to the fixture.
 */
export const SCHEMA_VERSIONS: Record<string, number> = {
  [PLAYER_STATE_KEY]: 3,
  [FLASH_MISSIONS_KEY]: 1,
};

const currentVersion = (key: string) => SCHEMA_VERSIONS[key] ?? 1;

interface Envelope<T> {
  v: number;
  data: T;
}

/** Returns null during SSR, or when storage is unavailable/blocked. */
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage;
    // Safari private mode throws only on write, so probe properly.
    const probe = "__shieldquest_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/**
 * Reads a stored value together with the version it was written under, so the
 * caller can migrate an older payload instead of discarding it.
 */
export function readDemoEnvelope<T>(key: string): { v: number; data: T } | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (!parsed || typeof parsed.v !== "number" || parsed.data == null) {
      return null;
    }
    // A payload from a *newer* build than this one cannot be understood.
    if (parsed.v > currentVersion(key)) return null;
    return { v: parsed.v, data: parsed.data };
  } catch {
    return null;
  }
}

/** Reads a value written under the key's current version. Older payloads are ignored. */
export function readDemo<T>(key: string): T | null {
  const envelope = readDemoEnvelope<T>(key);
  if (!envelope || envelope.v !== currentVersion(key)) return null;
  return envelope.data;
}

export function writeDemo<T>(key: string, data: T): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(
      key,
      JSON.stringify({ v: currentVersion(key), data } satisfies Envelope<T>),
    );
  } catch {
    // Quota or blocked storage — the demo continues from memory.
  }
}

/**
 * Clears everything this prototype has written — player profile, board
 * position, Shield Tokens, unlocked cosmetics, the casebook, onboarding state
 * and any Flash Mission deployed during the session. Fixtures are untouched.
 */
export function clearDemoData(): void {
  const s = storage();
  if (!s) return;
  try {
    for (const key of Object.keys(SCHEMA_VERSIONS)) s.removeItem(key);
  } catch {
    // Nothing further to do.
  }
}
