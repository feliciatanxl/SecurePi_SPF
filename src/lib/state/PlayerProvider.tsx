"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_PROFILE } from "@/lib/api/mock-data";
import type { PlayerProfile } from "@/lib/types";

/**
 * Client-side mirror of the server-authoritative wallet.
 *
 * In production the server owns these balances and this store is hydrated from
 * `api.getProfile()` then reconciled after every `submitChoice` response. For
 * the prototype it is plain React state seeded from the fixture.
 */
interface PlayerContextValue {
  profile: PlayerProfile;
  applyDeltas: (deltas: { coins?: number; resilience?: number }) => void;
  reset: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(MOCK_PROFILE);

  const applyDeltas = useCallback(
    ({ coins = 0, resilience = 0 }: { coins?: number; resilience?: number }) => {
      setProfile((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins + coins),
        resiliencePoints: Math.max(0, prev.resiliencePoints + resilience),
      }));
    },
    [],
  );

  const reset = useCallback(() => setProfile(MOCK_PROFILE), []);

  const value = useMemo(
    () => ({ profile, applyDeltas, reset }),
    [profile, applyDeltas, reset],
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
