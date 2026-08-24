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
  BOARD_SPACES,
  DISTRICT_BADGES,
  migrateLegacyBoardPosition,
  normaliseBoardPosition,
} from "@/lib/api/board-data";
import { findReward } from "@/lib/api/rewards-data";
import { DISTRICTS, findNode } from "@/lib/api/world-data";
import {
  clearDemoData,
  PLAYER_STATE_KEY,
  readDemoEnvelope,
  SCHEMA_VERSIONS,
  writeDemo,
} from "@/lib/state/demoStorage";
import {
  DEFAULT_SETTINGS,
  type Deltas,
  type DistrictId,
  type Guardian,
  type GuardianAward,
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
  /**
   * Pays one activity's Guardian progression, once, ever.
   *
   * Returns what actually happened — `"MET"` on the first meeting,
   * `"PROGRESSED"` on a genuine +1, and `null` when this activity has already
   * paid its Guardian grant and the run was practice. Decided synchronously, so
   * the caller can report the truth in the same event handler.
   *
   * `activityId` is the grant's identity. Two different LEAD activities each
   * progress Beacon once; the same activity never progresses it twice, whether
   * it is replayed, revisited or reloaded.
   */
  advanceGuardian: (
    activityId: string | undefined,
    guardianId: string,
  ) => GuardianAward | null;
  /** True once this activity has paid its Guardian progression. */
  hasGuardianGrant: (activityId: string, guardianId: string) => boolean;
  /** True once the player has demonstrated this Guardian's competency. */
  hasMetGuardian: (guardianId: string) => boolean;
  /** The Guardian just met for the first time, awaiting acknowledgement. */
  pendingGuardianMetId: string | null;
  acknowledgeGuardianMet: () => void;
  /**
   * Marks one city activity finished. Idempotent, so replaying a mission or
   * refreshing mid-run cannot inflate progress or double-count an unlock.
   */
  completeActivity: (nodeId: string) => void;
  isCompleted: (nodeId: string) => boolean;
  /** Node ids whose progress requirement was met by the latest completion. */
  newlyUnlockedNodeIds: string[];
  acknowledgeNewUnlocks: () => void;
  /** Reveals a district chapter without granting a learning reward. */
  discoverDistrict: (districtId: DistrictId) => void;
  /** Moves the player's marker and intentionally discovers the district. */
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

const DISTRICT_IDS = new Set<DistrictId>([
  "school",
  "retail",
  "digi",
  "community",
]);

const districtArray = (value: unknown): DistrictId[] =>
  stringArray(value).filter((id): id is DistrictId =>
    DISTRICT_IDS.has(id as DistrictId),
  );

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

/** The stored version that first carried the 26-space track. */
const BOARD_V2_SCHEMA = SCHEMA_VERSIONS[PLAYER_STATE_KEY];

/**
 * Brings any accepted stored profile up to the current shape.
 *
 * This is the migration path as well as the repair path: a v1 session — saved
 * before the board, Shield Tokens, rewards and Shield Central existed — has
 * none of those fields, and every one of them falls back to its fixture default
 * here. A demo session started on the previous build therefore keeps its coins,
 * Guardian progress and completed activities instead of being thrown away, and
 * simply arrives with an empty board position and no cosmetics.
 *
 * `version` is the envelope version the payload was written under. Below the
 * current one, the board indices it holds refer to the 22-space track and are
 * translated through `migrateLegacyBoardPosition`, so a restored player stands
 * on the same *logical* space rather than on whatever now occupies their old
 * number. Anything the old track never had is dropped rather than guessed at.
 */
function normaliseProfile(
  saved: Partial<PlayerProfile>,
  version: number,
): PlayerProfile {
  const merged = { ...MOCK_PROFILE, ...saved } as PlayerProfile;
  const legacyBoard = version < BOARD_V2_SCHEMA;

  /*
   * Translate, then normalise. A legacy index that the old track never had
   * resolves to null and is dropped — a visited marker is a record of somewhere
   * the player actually stood, and inventing one is worse than losing it.
   */
  const readPosition = (value: unknown): number | null => {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    if (!legacyBoard) return normaliseBoardPosition(value);
    return migrateLegacyBoardPosition(Math.trunc(value));
  };

  const visitedSpaces = Array.isArray(saved.visitedSpaces)
    ? [
        ...new Set(
          saved.visitedSpaces
            .map(readPosition)
            .filter((n): n is number => n !== null),
        ),
      ]
    : [];
  const discoveredDistricts =
    saved.discoveredDistricts === undefined
      ? districtArray([
          saved.currentDistrictId,
          ...visitedSpaces.map((index) => BOARD_SPACES[index]?.districtId),
        ])
      : districtArray(saved.discoveredDistricts);

  const completedActivities = stringArray(saved.completedActivities);

  return {
    ...merged,
    completedActivities,
    metGuardians: normaliseMetGuardians(saved.metGuardians, completedActivities),
    guardianGrants: normaliseGuardianGrants(
      saved.guardianGrants,
      completedActivities,
    ),
    discoveredDistricts,
    currentDistrictId: saved.currentDistrictId ?? MOCK_PROFILE.currentDistrictId,

    /*
     * A legacy position that cannot be translated falls back to Shield
     * Central, which is where a turn begins. That is the one space whose
     * meaning cannot have moved.
     */
    boardPosition: readPosition(saved.boardPosition) ?? 0,
    visitedSpaces,
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

/**
 * Works out which Guardians a stored session has met.
 *
 * Sessions saved before Guardians had to be earned carry no `metGuardians` at
 * all — every profile simply listed all six as available. Those sessions are
 * not made to start over: a Guardian counts as met if the player has already
 * completed an activity that practises its competency, which is exactly the
 * condition that would have met it under the current model. Nothing else in the
 * profile is touched, so completed activities, Shield Tokens, board position,
 * the Casebook and rewards all survive the migration intact.
 *
 * A player who has completed nothing has met nobody, which is the correct
 * fresh-start state rather than a loss of progress.
 */
function normaliseMetGuardians(
  value: unknown,
  completedActivities: string[],
): string[] {
  const known = new Set(MOCK_GUARDIANS.map((g) => g.id));

  if (Array.isArray(value)) {
    return [...new Set(stringArray(value).filter((id) => known.has(id)))];
  }

  const earned = completedActivities
    .map((nodeId) => findNode(nodeId)?.guardianId)
    .filter((id): id is string => Boolean(id) && known.has(id as string));
  return [...new Set(earned)];
}

/**
 * Works out which Guardian grants a stored session has already consumed.
 *
 * Sessions saved before this ledger existed have no record of what they were
 * paid — but they do have `completedActivities`, and an activity that has been
 * completed has already had its one Guardian grant. Deriving the keys from that
 * is what stops the new ledger handing every previously finished activity a
 * fresh payout the moment it is introduced.
 *
 * Nothing else is touched: stored Guardian progress, levels, met Guardians,
 * completions, Shield Tokens, board position, visited spaces, the Casebook,
 * achievements and rewards all carry through untouched.
 */
function normaliseGuardianGrants(
  value: unknown,
  completedActivities: string[],
): string[] {
  if (Array.isArray(value)) return [...new Set(stringArray(value))];

  /*
   * The node's own Guardian is the canonical one for the activity — the
   * one-to-one competency mapping the roster is built on. A legacy save is
   * credited on that basis.
   */
  const consumed = completedActivities
    .map((nodeId) => {
      const guardianId = findNode(nodeId)?.guardianId;
      return guardianId ? guardianGrantKey(nodeId, guardianId) : null;
    })
    .filter((key): key is string => key !== null);
  return [...new Set(consumed)];
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
 * The grant key for one activity's Guardian progression.
 *
 * Deliberately the same shape as `tokenKey` in rewards-data: a keyed, persisted
 * ledger entry is how everything else in this prototype guarantees it pays
 * once, and Guardian progress is no different. Both halves of the key matter —
 * dropping the activity would cap a Guardian at one grant for its whole life,
 * and dropping the Guardian would stop a scenario whose choices credit
 * different Guardians from crediting more than the first.
 */
export const guardianGrantKey = (activityId: string, guardianId: string) =>
  `guardian:${activityId}:${guardianId}`;

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
  const [newlyUnlockedNodeIds, setNewlyUnlockedNodeIds] = useState<string[]>([]);
  const [pendingGuardianMetId, setPendingGuardianMetId] = useState<string | null>(
    null,
  );

  /**
   * Guardians already met, tracked synchronously for the same reason
   * `grantedKeys` is: `setProfile` has not run yet when `advanceGuardian`
   * returns, so the profile cannot answer "was this the first meeting" inside
   * the handler that caused it. The updater still guards on the persisted
   * profile, so a Strict Mode double render cannot record a meeting twice.
   */
  const metGuardianIds = useRef<Set<string>>(new Set());

  /**
   * Guardian grants already consumed, tracked synchronously for the same reason
   * `grantedKeys` is — and persisted for a reason a ref alone cannot cover. A
   * component-local guard only survives as long as its component: reloading the
   * page rebuilt the guard and let the same activity pay its Guardian a second
   * time. The ledger this mirrors is part of the saved profile, so the grant
   * stays spent across a reload, a route change and a later visit.
   */
  const guardianGrantKeys = useRef<Set<string>>(new Set());

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
      const restored = normaliseProfile(saved.data, saved.v);
      grantedKeys.current = new Set(restored.tokenGrants);
      metGuardianIds.current = new Set(restored.metGuardians);
      guardianGrantKeys.current = new Set(restored.guardianGrants);
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

  /**
   * MEET → PRACTISE → PROGRESS, paid once per activity.
   *
   * The first qualifying activity meets the Guardian and counts as the first
   * practice of its skill. A different activity for the same skill progresses
   * it again. The *same* activity never pays twice — replaying it is practice,
   * which is worth doing and worth nothing extra, so Guardian progress stays
   * evidence of range rather than of repetition.
   *
   * The synchronous ledger decides and is written before the state update, so
   * two calls inside one handler cannot both succeed on the same key. The
   * updater repeats the check against the persisted profile, which is what
   * makes a Strict Mode double render, a replay and a reload all safe.
   */
  const advanceGuardian = useCallback(
    (activityId: string | undefined, guardianId: string) => {
      /*
       * An activity with no id cannot be keyed, so it cannot be made
       * idempotent either. Nothing in the build reaches this — every scenario,
       * mini-game and group question carries its node id — and it stays
       * awarding rather than silently dropping progress if one ever does.
       */
      const key = activityId ? guardianGrantKey(activityId, guardianId) : null;
      if (key) {
        if (guardianGrantKeys.current.has(key)) return null;
        guardianGrantKeys.current.add(key);
      }

      const firstMeeting = !metGuardianIds.current.has(guardianId);
      if (firstMeeting) metGuardianIds.current.add(guardianId);

      setProfile((prev) => {
        if (key && prev.guardianGrants.includes(key)) return prev;
        return {
          ...prev,
          guardianGrants: key
            ? [...prev.guardianGrants, key]
            : prev.guardianGrants,
          metGuardians: prev.metGuardians.includes(guardianId)
            ? prev.metGuardians
            : [...prev.metGuardians, guardianId],
          guardianProgress: {
            ...prev.guardianProgress,
            [guardianId]: (prev.guardianProgress[guardianId] ?? 0) + 1,
          },
        };
      });

      if (firstMeeting) setPendingGuardianMetId(guardianId);
      return firstMeeting ? "MET" : "PROGRESSED";
    },
    [],
  );

  const acknowledgeGuardianMet = useCallback(() => {
    setPendingGuardianMetId(null);
  }, []);

  const completeActivity = useCallback((nodeId: string) => {
    const current = profileRef.current;
    if (!current.completedActivities.includes(nodeId)) {
      const completedNode = findNode(nodeId);
      const district = completedNode
        ? DISTRICTS.find((item) => item.id === completedNode.districtId)
        : undefined;
      if (district) {
        const completedBefore = district.nodes.filter((node) =>
          current.completedActivities.includes(node.id),
        ).length;
        const completedAfter = completedBefore + 1;
        const unlocked = district.nodes
          .filter(
            (node) =>
              node.availability === "UNLOCK" &&
              (node.requiredInDistrict ?? 0) > completedBefore &&
              (node.requiredInDistrict ?? 0) <= completedAfter,
          )
          .map((node) => node.id);
        if (unlocked.length > 0) setNewlyUnlockedNodeIds(unlocked);
      }
    }

    setProfile((prev) => {
      if (prev.completedActivities.includes(nodeId)) return prev;
      return {
        ...prev,
        completedActivities: [...prev.completedActivities, nodeId],
        missionsCompleted: prev.missionsCompleted + 1,
      };
    });
  }, []);

  const acknowledgeNewUnlocks = useCallback(() => {
    setNewlyUnlockedNodeIds([]);
  }, []);

  const discoverDistrict = useCallback((districtId: DistrictId) => {
    setProfile((prev) =>
      prev.discoveredDistricts.includes(districtId)
        ? prev
        : {
            ...prev,
            discoveredDistricts: [...prev.discoveredDistricts, districtId],
          },
    );
  }, []);

  const travelTo = useCallback((districtId: DistrictId) => {
    setProfile((prev) => ({
      ...prev,
      currentDistrictId: districtId,
      discoveredDistricts: prev.discoveredDistricts.includes(districtId)
        ? prev.discoveredDistricts
        : [...prev.discoveredDistricts, districtId],
    }));
  }, []);

  const moveToSpace = useCallback((index: number) => {
    const target = normaliseBoardPosition(index);
    const districtId = BOARD_SPACES[target]?.districtId;
    setProfile((prev) => ({
      ...prev,
      boardPosition: target,
      visitedSpaces: prev.visitedSpaces.includes(target)
        ? prev.visitedSpaces
        : [...prev.visitedSpaces, target],
      discoveredDistricts:
        districtId && !prev.discoveredDistricts.includes(districtId)
          ? [...prev.discoveredDistricts, districtId]
          : prev.discoveredDistricts,
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
    metGuardianIds.current = new Set(MOCK_PROFILE.metGuardians);
    guardianGrantKeys.current = new Set(MOCK_PROFILE.guardianGrants);
    setNewlyUnlockedNodeIds([]);
    setPendingGuardianMetId(null);
    setProfile(MOCK_PROFILE);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      guardians: MOCK_GUARDIANS,
      hydrated,
      applyDeltas,
      advanceGuardian,
      hasMetGuardian: (guardianId: string) =>
        profile.metGuardians.includes(guardianId),
      hasGuardianGrant: (activityId: string, guardianId: string) =>
        profile.guardianGrants.includes(guardianGrantKey(activityId, guardianId)),
      pendingGuardianMetId,
      acknowledgeGuardianMet,
      completeActivity,
      isCompleted: (nodeId: string) => profile.completedActivities.includes(nodeId),
      newlyUnlockedNodeIds,
      acknowledgeNewUnlocks,
      discoverDistrict,
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
      pendingGuardianMetId,
      acknowledgeGuardianMet,
      completeActivity,
      newlyUnlockedNodeIds,
      acknowledgeNewUnlocks,
      discoverDistrict,
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
