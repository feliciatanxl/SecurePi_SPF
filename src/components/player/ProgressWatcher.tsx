"use client";

import { useEffect, useState } from "react";
import { DistrictComplete } from "@/components/player/DistrictComplete";
import { DISTRICT_BADGES } from "@/lib/api/board-data";
import { TOKEN_AWARD, tokenKey } from "@/lib/api/rewards-data";
import { useShieldProgress } from "@/lib/hooks/useShieldProgress";
import { useWorld } from "@/lib/hooks/useWorld";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { playCue } from "@/lib/sound";
import type { Competency, DistrictId } from "@/lib/types";

/**
 * Watches for milestones the player just crossed.
 *
 * Two things are banked here rather than inside the activity that triggered
 * them: finishing every playable activity in a district, and completing an
 * achievement. Both depend on progress *across* activities, so no single
 * mission, mini-game or Peer Shield run is in a position to notice them.
 *
 * Both awards are keyed and idempotent, so a refresh, a replay or a second
 * render cannot pay twice. Neither depends on the dice, on speed, or on how
 * anybody else is doing.
 *
 * Renders nothing except the District Complete milestone when one is crossed.
 */
export function ProgressWatcher() {
  const {
    profile,
    guardians,
    hydrated,
    awardTokens,
    recordAchievement,
    recordDistrictBadge,
  } = usePlayer();
  const { districts } = useWorld();
  const { achievements, skillCounts } = useShieldProgress();

  const [celebrating, setCelebrating] = useState<DistrictId | null>(null);
  const [districtTokens, setDistrictTokens] = useState(0);

  /* District completion. */
  useEffect(() => {
    if (!hydrated) return;
    const cleared = districts.find(
      (d) => d.cleared && !profile.districtBadges.includes(d.id),
    );
    if (!cleared) return;

    recordDistrictBadge(cleared.id);
    setDistrictTokens(
      awardTokens(tokenKey.district(cleared.id), TOKEN_AWARD.district),
    );
    setCelebrating(cleared.id);
    playCue("reward", profile.settings.sound);
  }, [
    awardTokens,
    districts,
    hydrated,
    profile.districtBadges,
    profile.settings.sound,
    recordDistrictBadge,
  ]);

  /*
   * Achievement milestones. Quiet on purpose — the Shield Tokens land and the
   * achievement is marked earned, but nothing takes over the screen. A player
   * who has just read a debrief about a friend being recruited as a money mule
   * should not have a trophy thrown at them.
   */
  useEffect(() => {
    if (!hydrated) return;
    for (const achievement of achievements) {
      if (!achievement.earned) continue;
      if (profile.earnedAchievements.includes(achievement.id)) continue;
      recordAchievement(achievement.id);
      awardTokens(tokenKey.achievement(achievement.id), TOKEN_AWARD.achievement);
    }
  }, [
    achievements,
    awardTokens,
    hydrated,
    profile.earnedAchievements,
    recordAchievement,
  ]);

  const district = celebrating
    ? districts.find((d) => d.id === celebrating)
    : undefined;

  const skills: Competency[] = district
    ? [
        ...new Set(
          district.nodes
            .filter((n) => n.completed)
            .map((n) => n.primaryCompetency),
        ),
      ]
    : [];

  /* The Guardian this district leans on most, for the progress line. */
  const guardianId = district?.nodes.find((n) => n.completed && n.guardianId)
    ?.guardianId;
  const guardian = guardianId
    ? guardians.find((g) => g.id === guardianId)
    : undefined;

  return (
    <DistrictComplete
      districtId={celebrating}
      districtName={district?.name ?? ""}
      badge={celebrating ? DISTRICT_BADGES[celebrating] : undefined}
      completed={district?.completed ?? 0}
      total={district?.nodes.filter((n) => n.availability !== "PLANNED").length ?? 0}
      skills={skills.length ? skills : (Object.keys(skillCounts) as Competency[]).filter((c) => skillCounts[c] > 0)}
      guardian={guardian}
      guardianCumulative={guardian ? (profile.guardianProgress[guardian.id] ?? 0) : 0}
      tokensAwarded={districtTokens}
      onClose={() => setCelebrating(null)}
    />
  );
}
