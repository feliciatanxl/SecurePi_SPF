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

/** Bumped if a stored shape ever changes; mismatched payloads are discarded. */
const SCHEMA_VERSION = 1;

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

export function readDemo<T>(key: string): T | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (!parsed || parsed.v !== SCHEMA_VERSION) return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function writeDemo<T>(key: string, data: T): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify({ v: SCHEMA_VERSION, data } satisfies Envelope<T>));
  } catch {
    // Quota or blocked storage — the demo continues from memory.
  }
}

/** Clears everything this prototype has written. Fixtures are untouched. */
export function clearDemoData(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(PLAYER_STATE_KEY);
    s.removeItem(FLASH_MISSIONS_KEY);
  } catch {
    // Nothing further to do.
  }
}
