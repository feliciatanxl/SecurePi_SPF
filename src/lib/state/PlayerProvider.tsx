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
import { DISTRICT_BADGES, normaliseBoardPosition } from "@/lib/api/board-data";
import { findReward } from "@/lib/api/rewards-data";
import {
  clearDemoData,
  PLAYER_STATE_KEY,
  readDemoEnvelope,
  writeDemo,
} from "@/lib/state/demoStorage";
import {
  DEFAULT_SETTINGS,
  type Deltas,
  type DistrictId,
  type Guardian,
  type JoinedSession,
  type LearningCheckId,
  type CheckResponse,
  type PlayerProfile,
  type PlayerSettings,
  type RewardSlot,
} from "@/lib/types";

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
  /** False until the stored demo session has been applied. */
  hydrated: boolean;
  applyDeltas: (deltas: Deltas) => void;
  /** Records one qualifying decision toward a Guardian's next level. */
  advanceGuardian: (guardianId: string) => void;
  /**
   * Marks one city activity finished. Idempotent, so replaying a mission or
   * refreshing mid-run cannot inflate progress or double-count an unlock.
   */
  completeActivity: (nodeId: string) => void;
  isCompleted: (nodeId: string) => boolean;
  /** Moves the player's marker on the city board. */
  travelTo: (districtId: DistrictId) => void;

  /* -- Board ------------------------------------------------------------- */
  /** Moves the token to a space on the track and records the visit. */
  moveToSpace: (index: number) => void;

  /* -- Shield Tokens ----------------------------------------------------- */
  /**
   * Pays Shield Tokens once for a given grant key. Returns the amount actually
   * awarded, which is 0 when the key has already been paid — so a replay, a
   * reload or a double render can never mint tokens.
   */
  awardTokens: (key: string, amount: number) => number;
  hasTokenGrant: (key: string) => boolean;

  /* -- Rewards ----------------------------------------------------------- */
  /** Spends tokens on a cosmetic. Returns false if it is unaffordable/owned. */
  unlockReward: (rewardId: string) => boolean;
  equipReward: (rewardId: string) => void;
  unequipSlot: (slot: RewardSlot) => void;
  equippedIn: (slot: RewardSlot) => string | undefined;

  /* -- Progression records ----------------------------------------------- */
  recordAchievement: (achievementId: string) => void;
  recordDistrictBadge: (districtId: DistrictId) => void;
  /** Adds a Situation Card to the Shield Casebook. Idempotent. */
  recordCasebookEntry: (cardId: string) => void;

  /* -- Hub, onboarding and preferences ----------------------------------- */
  completeOnboarding: (playerTokenId: string) => void;
  restartOnboarding: () => void;
  updateSettings: (patch: Partial<PlayerSettings>) => void;
  joinSession: (session: JoinedSession | null) => void;
  recordLearningCheck: (id: LearningCheckId, responses: CheckResponse[]) => void;

  reset: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/**
 * Only accept a stored profile that still looks like a profile. A partial or
 * hand-edited value falls back to the fixture rather than rendering NaN.
 */
function isValidProfile(value: unknown): value is Partial<PlayerProfile> {
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
 * Brings any accepted stored profile up to the current shape.
 *
 * This is the migration path as well as the repair path: a v1 session — saved
 * before the board, Shield Tokens, rewards and Shield Central existed — has
 * none of those fields, and every one of them falls back to its fixture default
 * here. A demo session started on the previous build therefore keeps its coins,
 * Guardian progress and completed activities instead of being thrown away, and
 * simply arrives with an empty board position and no cosmetics.
 */
function normaliseProfile(saved: Partial<PlayerProfile>): PlayerProfile {
  const merged = { ...MOCK_PROFILE, ...saved } as PlayerProfile;

  return {
    ...merged,
    completedActivities: stringArray(saved.completedActivities),
    currentDistrictId: saved.currentDistrictId ?? MOCK_PROFILE.currentDistrictId,

    boardPosition: normaliseBoardPosition(
      typeof saved.boardPosition === "number" ? saved.boardPosition : 0,
    ),
    visitedSpaces: Array.isArray(saved.visitedSpaces)
      ? saved.visitedSpaces
          .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
          .map(normaliseBoardPosition)
      : [],
    shieldTokens:
      typeof saved.shieldTokens === "number" && Number.isFinite(saved.shieldTokens)
        ? Math.max(0, Math.trunc(saved.shieldTokens))
        : MOCK_PROFILE.shieldTokens,
    tokenGrants: stringArray(saved.tokenGrants),
    unlockedRewards: stringArray(saved.unlockedRewards).filter((id) =>
      Boolean(findReward(id)),
    ),
    equippedRewards: normaliseEquipped(saved.equippedRewards),
    earnedAchievements: stringArray(saved.earnedAchievements),
    districtBadges: (Array.isArray(saved.districtBadges) ? saved.districtBadges : [])
      .filter((id): id is DistrictId => typeof id === "string" && id in DISTRICT_BADGES),
    casebook: stringArray(saved.casebook),
    onboardingComplete: saved.onboardingComplete === true,
    playerTokenId:
      typeof saved.playerTokenId === "string"
        ? saved.playerTokenId
        : MOCK_PROFILE.playerTokenId,
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
    joinedSession: saved.joinedSession ?? null,
    learningChecks: {
      pre: saved.learningChecks?.pre ?? MOCK_PROFILE.learningChecks.pre,
      post: saved.learningChecks?.post ?? MOCK_PROFILE.learningChecks.post,
    },
  };
}

/** Drops any equipped id that is no longer in the catalogue or in the wrong slot. */
function normaliseEquipped(
  value: PlayerProfile["equippedRewards"] | undefined,
): PlayerProfile["equippedRewards"] {
  if (!value || typeof value !== "object") return {};
  const out: PlayerProfile["equippedRewards"] = {};
  for (const [slot, id] of Object.entries(value)) {
    if (typeof id !== "string") continue;
    const reward = findReward(id);
    if (reward && reward.slot === slot) out[slot as RewardSlot] = id;
  }
  return out;
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
  /**
   * Hydration is tracked in state, not a ref, and that distinction is
   * load-bearing. Effects in one commit run in declaration order, so a ref set
   * by the read effect below would already be true when the write effect ran in
   * that same commit — and the write effect would still be closed over the
   * fixture, clobbering the stored session before the restored profile had a
   * chance to commit. Strict Mode's second mount then re-read the value it had
   * just destroyed, so a refresh silently reset the whole demo.
   *
   * As state, `hydrated` only becomes true in the *next* commit, which is the
   * same commit that carries the restored profile — so the first write can only
   * ever write what was read.
   */
  const [hydrated, setHydrated] = useState(false);

  /**
   * Grant keys already paid, tracked synchronously alongside the profile.
   *
   * `setProfile` is asynchronous, so a caller that awards tokens and then reads
   * the result in the same event handler cannot learn the outcome from inside
   * the updater — it has not run yet. That is not a cosmetic problem: the
   * Mission Complete card reports what was just earned, and reading a
   * not-yet-applied update made every award display as "already earned".
   *
   * This ref is the synchronous answer to "has this key been paid", seeded from
   * the restored session and kept in step with every write below. The updater
   * still guards on the profile itself, so the persisted state remains the
   * authority and neither path can pay twice.
   */
  const grantedKeys = useRef<Set<string>>(new Set());

  /**
   * The latest rendered profile, for the handful of callbacks that need to
   * answer a question about the current balance synchronously.
   */
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    // Any accepted version is migrated rather than discarded — see
    // `normaliseProfile`, which fills every field a v1 session never had.
    const saved = readDemoEnvelope<Partial<PlayerProfile>>(PLAYER_STATE_KEY);
    if (saved && isValidProfile(saved.data)) {
      const restored = normaliseProfile(saved.data);
      grantedKeys.current = new Set(restored.tokenGrants);
      setProfile(restored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeDemo(PLAYER_STATE_KEY, profile);
  }, [hydrated, profile]);

  /*
   * Preferences are applied to the document root rather than threaded through
   * every component: text size, contrast and forced reduced motion are
   * document-wide concerns, and the CSS that implements them is in globals.css.
   * Done in an effect so the server render carries no attributes and there is
   * nothing for hydration to disagree about.
   */
  const { textSize, highContrast, reducedMotion } = profile.settings;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = textSize;
    if (highContrast) root.dataset.contrast = "high";
    else delete root.dataset.contrast;
    if (reducedMotion) root.dataset.motion = "reduced";
    else delete root.dataset.motion;
  }, [textSize, highContrast, reducedMotion]);

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

  const completeActivity = useCallback((nodeId: string) => {
    setProfile((prev) => {
      if (prev.completedActivities.includes(nodeId)) return prev;
      return {
        ...prev,
        completedActivities: [...prev.completedActivities, nodeId],
        missionsCompleted: prev.missionsCompleted + 1,
      };
    });
  }, []);

  const travelTo = useCallback((districtId: DistrictId) => {
    setProfile((prev) =>
      prev.currentDistrictId === districtId
        ? prev
        : { ...prev, currentDistrictId: districtId },
    );
  }, []);

  const moveToSpace = useCallback((index: number) => {
    const target = normaliseBoardPosition(index);
    setProfile((prev) => ({
      ...prev,
      boardPosition: target,
      visitedSpaces: prev.visitedSpaces.includes(target)
        ? prev.visitedSpaces
        : [...prev.visitedSpaces, target],
    }));
  }, []);

  /**
   * Pays a keyed award exactly once and reports what was actually paid.
   *
   * The synchronous `grantedKeys` set decides — and is updated before the
   * state write, so two awards inside the same event handler cannot both
   * succeed on the same key. The updater repeats the check against the
   * persisted profile, which is what makes a Strict Mode double render, a
   * replay and a reload all safe.
   */
  const awardTokens = useCallback((key: string, amount: number) => {
    if (amount <= 0) return 0;
    if (grantedKeys.current.has(key)) return 0;
    grantedKeys.current.add(key);

    setProfile((prev) => {
      if (prev.tokenGrants.includes(key)) return prev;
      return {
        ...prev,
        shieldTokens: prev.shieldTokens + amount,
        tokenGrants: [...prev.tokenGrants, key],
      };
    });
    return amount;
  }, []);

  /**
   * Spends tokens on a cosmetic. Reports whether the purchase went through, so
   * the caller can show the unlocked screen — again decided synchronously,
   * with the updater repeating the check against the persisted balance.
   */
  const unlockReward = useCallback((rewardId: string) => {
    const reward = findReward(rewardId);
    if (!reward) return false;

    const current = profileRef.current;
    if (current.unlockedRewards.includes(rewardId)) return false;
    if (current.shieldTokens < reward.cost) return false;

    setProfile((prev) => {
      if (prev.unlockedRewards.includes(rewardId)) return prev;
      if (prev.shieldTokens < reward.cost) return prev;
      return {
        ...prev,
        shieldTokens: prev.shieldTokens - reward.cost,
        unlockedRewards: [...prev.unlockedRewards, rewardId],
      };
    });
    return true;
  }, []);

  const equipReward = useCallback((rewardId: string) => {
    const reward = findReward(rewardId);
    if (!reward) return;
    setProfile((prev) =>
      prev.unlockedRewards.includes(rewardId)
        ? {
            ...prev,
            equippedRewards: { ...prev.equippedRewards, [reward.slot]: rewardId },
          }
        : prev,
    );
  }, []);

  const unequipSlot = useCallback((slot: RewardSlot) => {
    setProfile((prev) => {
      if (!prev.equippedRewards[slot]) return prev;
      const next = { ...prev.equippedRewards };
      delete next[slot];
      return { ...prev, equippedRewards: next };
    });
  }, []);

  const recordAchievement = useCallback((achievementId: string) => {
    setProfile((prev) =>
      prev.earnedAchievements.includes(achievementId)
        ? prev
        : {
            ...prev,
            earnedAchievements: [...prev.earnedAchievements, achievementId],
          },
    );
  }, []);

  const recordDistrictBadge = useCallback((districtId: DistrictId) => {
    setProfile((prev) =>
      prev.districtBadges.includes(districtId)
        ? prev
        : { ...prev, districtBadges: [...prev.districtBadges, districtId] },
    );
  }, []);

  const recordCasebookEntry = useCallback((cardId: string) => {
    setProfile((prev) =>
      prev.casebook.includes(cardId)
        ? prev
        : { ...prev, casebook: [...prev.casebook, cardId] },
    );
  }, []);

  const completeOnboarding = useCallback((playerTokenId: string) => {
    setProfile((prev) => ({ ...prev, onboardingComplete: true, playerTokenId }));
  }, []);

  const restartOnboarding = useCallback(() => {
    setProfile((prev) => ({ ...prev, onboardingComplete: false }));
  }, []);

  const updateSettings = useCallback((patch: Partial<PlayerSettings>) => {
    setProfile((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const joinSession = useCallback((session: JoinedSession | null) => {
    setProfile((prev) => ({ ...prev, joinedSession: session }));
  }, []);

  const recordLearningCheck = useCallback(
    (id: LearningCheckId, responses: CheckResponse[]) => {
      setProfile((prev) => ({
        ...prev,
        learningChecks: {
          ...prev.learningChecks,
          [id]: { id, completed: true, responses },
        },
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    clearDemoData();
    grantedKeys.current = new Set();
    setProfile(MOCK_PROFILE);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      guardians: MOCK_GUARDIANS,
      hydrated,
      applyDeltas,
      advanceGuardian,
      completeActivity,
      isCompleted: (nodeId: string) => profile.completedActivities.includes(nodeId),
      travelTo,
      moveToSpace,
      awardTokens,
      hasTokenGrant: (key: string) => profile.tokenGrants.includes(key),
      unlockReward,
      equipReward,
      unequipSlot,
      equippedIn: (slot: RewardSlot) => profile.equippedRewards[slot],
      recordAchievement,
      recordDistrictBadge,
      recordCasebookEntry,
      completeOnboarding,
      restartOnboarding,
      updateSettings,
      joinSession,
      recordLearningCheck,
      reset,
    }),
    [
      profile,
      hydrated,
      applyDeltas,
      advanceGuardian,
      completeActivity,
      travelTo,
      moveToSpace,
      awardTokens,
      unlockReward,
      equipReward,
      unequipSlot,
      recordAchievement,
      recordDistrictBadge,
      recordCasebookEntry,
      completeOnboarding,
      restartOnboarding,
      updateSettings,
      joinSession,
      recordLearningCheck,
      reset,
    ],
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
