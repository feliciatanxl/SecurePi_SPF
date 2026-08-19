"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MOCK_GUARDIANS, MOCK_PROFILE } from "@/lib/api/mock-data";
import {
  clearDemoData,
  PLAYER_STATE_KEY,
  readDemo,
  writeDemo,
} from "@/lib/state/demoStorage";
import type { Deltas, Guardian, PlayerProfile } from "@/lib/types";

/**
 * Client-side mirror of the server-authoritative player state.
 *
 * In production the server owns these balances and this store is hydrated from
 * `api.getProfile()` then reconciled after every `submitChoice` response. For
 * the prototype it is plain React state seeded from the fixture.
 */
interface PlayerContextValue {
  profile: PlayerProfile;
  guardians: Guardian[];
  applyDeltas: (deltas: Deltas) => void;
  /** Records one qualifying decision toward a Guardian's next level. */
  advanceGuardian: (guardianId: string) => void;
  reset: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

/**
 * Only accept a stored profile that still matches the current shape. A partial
 * or hand-edited value falls back to the fixture rather than rendering NaN.
 */
function isValidProfile(value: unknown): value is PlayerProfile {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  const numbers = ["coins", "resiliencePoints", "trust", "risk", "missionsCompleted", "streakDays"];
  return (
    numbers.every((k) => typeof p[k] === "number" && Number.isFinite(p[k])) &&
    typeof p.currentGuardianId === "string" &&
    typeof p.guardianProgress === "object" &&
    p.guardianProgress !== null
  );
}

/**
 * `guardianProgress` stores the *cumulative* count of qualifying decisions, so
 * level and bar position are always derived — never two counters that can drift.
 */
export function guardianStanding(guardian: Guardian, cumulative = 0) {
  return {
    level: 1 + Math.floor(cumulative / guardian.target),
    progress: cumulative % guardian.target,
    target: guardian.target,
  };
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Always start from the fixture so the server render and the first client
  // render are identical — reading storage here would cause a hydration
  // mismatch. The stored session is applied in the effect below.
  const [profile, setProfile] = useState<PlayerProfile>(MOCK_PROFILE);
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = readDemo<PlayerProfile>(PLAYER_STATE_KEY);
    if (isValidProfile(saved)) setProfile(saved);
    hydrated.current = true;
  }, []);

  // Persist only after hydration, otherwise the first write would clobber the
  // stored session with the fixture defaults.
  useEffect(() => {
    if (hydrated.current) writeDemo(PLAYER_STATE_KEY, profile);
  }, [profile]);

  const applyDeltas = useCallback((deltas: Deltas) => {
    setProfile((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins + (deltas.coins ?? 0)),
      resiliencePoints: Math.max(
        0,
        prev.resiliencePoints + (deltas.resilience ?? 0),
      ),
      trust: clamp(prev.trust + (deltas.trust ?? 0)),
      risk: clamp(prev.risk + (deltas.risk ?? 0)),
    }));
  }, []);

  const advanceGuardian = useCallback((guardianId: string) => {
    setProfile((prev) => ({
      ...prev,
      guardianProgress: {
        ...prev.guardianProgress,
        [guardianId]: (prev.guardianProgress[guardianId] ?? 0) + 1,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    clearDemoData();
    setProfile(MOCK_PROFILE);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      guardians: MOCK_GUARDIANS,
      applyDeltas,
      advanceGuardian,
      reset,
    }),
    [profile, applyDeltas, advanceGuardian, reset],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
