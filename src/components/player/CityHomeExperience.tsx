"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  Check,
  ChevronRight,
  Coins,
  Info,
  MapPin,
  Shield,
  ShieldHalf,
  Sparkles,
} from "lucide-react";
import { BoardMiniMap } from "@/components/player/board/BoardMiniMap";
import { CityTrack } from "@/components/player/board/CityTrack";
import { DiceRoller } from "@/components/player/board/DiceRoller";
import { SPACE_ICON } from "@/components/player/board/SpaceMark";
import { SpaceSheet } from "@/components/player/board/SpaceSheet";
import { CityInfoSheet } from "@/components/player/CityInfoSheet";
import { DistrictScene } from "@/components/player/DistrictArt";
import { DistrictDiscovery } from "@/components/player/DistrictDiscovery";
import { DistrictSheet } from "@/components/player/DistrictSheet";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { Modal } from "@/components/ui/Modal";
import { useBoard, type ResolvedSpace } from "@/lib/hooks/useBoard";
import { useDiceTurn } from "@/lib/hooks/useDiceTurn";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWorld, type ResolvedDistrict } from "@/lib/hooks/useWorld";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { FLASH_MISSIONS_KEY, readDemo } from "@/lib/state/demoStorage";
import { CITY_TAGLINE, DISTRICT_CHAPTER } from "@/lib/api/world-data";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  type AdminScenarioRow,
  type DistrictId,
} from "@/lib/types";

/** City-first presentation wrapped around the existing ShieldQuest turn. */
export function CityHomeExperience() {
  const { profile, guardians, equippedIn, discoverDistrict } = usePlayer();
  const { districts, progress } = useWorld();
  const { spaces, current, position, boardCompleted, boardPlayable } = useBoard();
  const reducedMotion = useReducedMotion(profile.settings.reducedMotion);

  const [landedSpace, setLandedSpace] = useState<ResolvedSpace | null>(null);
  const [landingSpace, setLandingSpace] = useState<ResolvedSpace | null>(null);
  const [openDistrict, setOpenDistrict] = useState<ResolvedDistrict | null>(null);
  const [discoveryDistrict, setDiscoveryDistrict] =
    useState<ResolvedDistrict | null>(null);
  const [discoveryLanding, setDiscoveryLanding] =
    useState<ResolvedSpace | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [cityAlert, setCityAlert] = useState<AdminScenarioRow | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const landingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const deployed = readDemo<AdminScenarioRow[]>(FLASH_MISSIONS_KEY);
    setCityAlert(
      deployed?.find((row) => row.isFlashMission && row.status === "LIVE") ?? null,
    );
  }, []);

  useEffect(
    () => () => {
      if (landingTimer.current) clearTimeout(landingTimer.current);
    },
    [],
  );

  const onLand = useCallback(
    (index: number) => {
      const destination = spaces[index] ?? null;
      if (!destination) return;

      if (landingTimer.current) clearTimeout(landingTimer.current);
      setLandingSpace(destination);
      const reveal = () => {
        setLandingSpace(null);
        const newlyDiscovered =
          destination.districtId &&
          !profile.discoveredDistricts.includes(destination.districtId);
        if (newlyDiscovered) {
          setDiscoveryLanding(destination);
          setDiscoveryDistrict(
            districts.find((district) => district.id === destination.districtId) ??
              null,
          );
        } else {
          setLandedSpace(destination);
        }
      };

      if (reducedMotion) reveal();
      else landingTimer.current = setTimeout(reveal, 540);
    },
    [districts, profile.discoveredDistricts, reducedMotion, spaces],
  );

  const turn = useDiceTurn({
    position,
    reducedMotion,
    sound: profile.settings.sound,
    onLand,
  });

  const districtNames = districts.reduce(
    (acc, district) => ({ ...acc, [district.id]: district.name }),
    {} as Record<DistrictId, string>,
  );

  const closeSheet = () => {
    setLandedSpace(null);
    turn.endTurn();
  };

  const openSpaceDirectly = (space: ResolvedSpace) => {
    if (landingTimer.current) clearTimeout(landingTimer.current);
    setLandingSpace(null);
    if (
      space.districtId &&
      !profile.discoveredDistricts.includes(space.districtId)
    ) {
      const district = districts.find((item) => item.id === space.districtId);
      if (district) {
        discoverDistrict(district.id);
        setDiscoveryLanding(space);
        setDiscoveryDistrict(district);
        return;
      }
    }
    setLandedSpace(space);
  };

  const openDistrictDirectly = (district: ResolvedDistrict) => {
    if (!district.discovered) {
      discoverDistrict(district.id);
      setDiscoveryLanding(null);
      setDiscoveryDistrict(district);
      return;
    }
    setOpenDistrict(district);
  };

  const closeDiscovery = () => {
    const landed = discoveryLanding;
    setDiscoveryDistrict(null);
    setDiscoveryLanding(null);
    if (landed) setLandedSpace(landed);
  };

  const exploreDiscoveredDistrict = () => {
    const district = discoveryDistrict;
    setDiscoveryDistrict(null);
    setDiscoveryLanding(null);
    setLandedSpace(null);
    turn.endTurn();
    if (district) setOpenDistrict({ ...district, discovered: true });
  };

  const currentPlace = current?.districtId
    ? districtNames[current.districtId]
    : "Shield Central";

  const suggestedQuest = useMemo(() => {
    const isDiscovered = (space: ResolvedSpace) =>
      !space.districtId || profile.discoveredDistricts.includes(space.districtId);
    if (current?.node?.playable && isDiscovered(current)) return current;
    const looped = [...spaces.slice(position + 1), ...spaces.slice(0, position + 1)];
    return (
      looped.find(
        (space) =>
          isDiscovered(space) && space.node?.playable && !space.completed,
      ) ??
      looped.find((space) => isDiscovered(space) && space.node?.playable) ??
      current
    );
  }, [current, position, profile.discoveredDistricts, spaces]);

  const suggestedDistrict = suggestedQuest?.districtId
    ? districtNames[suggestedQuest.districtId]
    : "Shield Central";

  return (
    <div className="city-home flex min-h-full flex-col overflow-hidden bg-navy-900 text-white">
      <header className="shrink-0 px-3.5 pb-2 pt-[max(0.55rem,env(safe-area-inset-top))] md:px-5 md:pt-3 xl:px-6 xl:pb-2.5 xl:pt-3">
        <div className="flex items-center gap-2 xl:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-400 xl:text-[10px]">
              Project SHIELD
            </p>
            <h1 className="text-[20px] font-extrabold leading-none tracking-tight xl:text-[22px]">
              Shield<span className="text-civic-400">Quest</span>
              <span className="sr-only"> — {CITY_TAGLINE}</span>
            </h1>
          </div>

          <div className="hidden md:block">
            <CompactHud
              coins={profile.coins}
              resilience={profile.resiliencePoints}
              tokens={profile.shieldTokens}
            />
          </div>

          <Link
            href="/shield-central"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/18 bg-white/8 text-white/85 transition hover:bg-white/14 hover:text-white"
          >
            <Shield className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="sr-only">Shield Central</span>
          </Link>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/18 bg-white/8 text-white/85 transition hover:bg-white/14 hover:text-white"
          >
            <Info className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="sr-only">About this game</span>
          </button>
        </div>

        <div className="mt-1.5 md:hidden">
          <CompactHud
            coins={profile.coins}
            resilience={profile.resiliencePoints}
            tokens={profile.shieldTokens}
          />
        </div>
      </header>

      {cityAlert && (
        <div className="shrink-0 px-3 pb-2 md:px-5 xl:px-6">
          <button
            type="button"
            onClick={() => setAlertOpen(true)}
            className="city-alert flex min-h-[48px] w-full items-center gap-2.5 rounded-2xl border border-coral-200/60 bg-coral-600 px-3 text-left shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)] transition hover:bg-coral-700"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/16">
              <BellRing className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-coral-100">
                New city alert
              </span>
              <span className="block truncate text-[13px] font-extrabold">
                {cityAlert.title}
              </span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-wide">
              View <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
        </div>
      )}

      <section
        aria-labelledby="city-board"
        className="city-board-frame relative mx-3 shrink-0 overflow-hidden rounded-[28px] border border-white/15 shadow-[0_18px_46px_-24px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)] md:mx-4 xl:mx-6"
      >
        <div className="relative z-30 flex h-10 items-center justify-between gap-2 border-b border-white/10 bg-navy-950/88 px-3.5 backdrop-blur-sm xl:px-5">
          <h2
            id="city-board"
            className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-400 xl:text-[11px]"
          >
            ShieldQuest City
          </h2>
          <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-white/85 xl:text-[11px]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
            <span className="truncate">{currentPlace}</span>
          </p>
        </div>

        <CurrentQuest space={suggestedQuest} districtName={suggestedDistrict} />

        <CityTrack
          spaces={spaces}
          tokenIndex={turn.tokenIndex}
          steppingIndices={turn.steppingIndices}
          guardians={guardians}
          districtNames={districtNames}
          discoveredDistricts={profile.discoveredDistricts}
          onOpenSpace={openSpaceDirectly}
          trailClass={equippedIn("routeTrail") ? "stroke-civic-500/65" : undefined}
          tokenClass={equippedIn("playerToken") ? "!border-civic-400" : undefined}
          markerCosmetic={Boolean(equippedIn("boardMarker"))}
        />

        <div className="relative z-30 bg-gradient-to-t from-navy-950 via-navy-950/90 to-transparent px-2.5 pb-2.5 pt-2 xl:px-4">
          <BoardMiniMap spaces={spaces} completed={boardCompleted} total={boardPlayable} />
        </div>

        {landingSpace && (
          <LandingMoment
            space={landingSpace}
            districtName={
              landingSpace.districtId
                ? districtNames[landingSpace.districtId]
                : "Shield Central"
            }
            guardian={
              landingSpace.guardianId
                ? guardians.find((guardian) => guardian.id === landingSpace.guardianId)
                : landingSpace.node?.guardianId
                  ? guardians.find((guardian) => guardian.id === landingSpace.node?.guardianId)
                  : undefined
            }
          />
        )}
      </section>

      <div className="shrink-0 space-y-2 px-3 pb-2.5 pt-2 xl:mx-auto xl:w-full xl:max-w-[1100px] xl:px-6 xl:pb-2.5 xl:pt-2.5">
        <DiceRoller
          phase={turn.phase}
          value={turn.value}
          onRoll={turn.roll}
          disabled={landedSpace !== null || landingSpace !== null}
        />

        <nav aria-label="City chapter progress">
          <ul className="grid grid-cols-4 gap-1.5 xl:gap-2.5">
            {districts.map((district) => {
              const isCurrent = district.id === current?.districtId;
              const state = !district.discovered
                ? "Undiscovered"
                : district.cleared
                  ? "Completed"
                  : "Discovered";
              const progressLabel = !district.discovered
                ? "Discover"
                : district.cleared
                  ? "Complete"
                  : district.total > 0
                    ? `${district.completed}/${district.total}`
                    : "Chapter";

              return (
                <li key={district.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openDistrictDirectly(district)}
                    aria-current={isCurrent ? "location" : undefined}
                    className={`chapter-chip relative flex min-h-[58px] w-full flex-col justify-end overflow-hidden rounded-xl border px-1.5 pb-1.5 pt-2 text-left transition hover:-translate-y-0.5 hover:border-white/45 xl:min-h-[60px] xl:px-2.5 xl:pb-2 xl:pt-2.5 ${
                      isCurrent
                        ? "border-amber-400 bg-white/14"
                        : "border-white/14 bg-white/8"
                    }`}
                  >
                    <DistrictScene
                      districtId={district.id}
                      className={
                        district.discovered
                          ? "opacity-45"
                          : "opacity-30 saturate-50 grayscale-[0.2]"
                      }
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 ${
                        district.discovered ? "to-navy-950/10" : "to-white/18"
                      }`}
                    />
                    <span className="relative flex w-full items-center justify-between gap-1">
                      <span className="min-w-0 flex-1 truncate text-[9px] font-extrabold uppercase tracking-wide xl:text-[10px]">
                        {district.id === "digi" ? "Digi" : district.name.split(" ")[0]}
                      </span>
                      <span className="text-[9px] font-extrabold tabular-nums text-amber-300 xl:text-[10px]">
                        {progressLabel}
                      </span>
                    </span>
                    <span className="relative mt-0.5 block w-full truncate text-[8px] font-bold uppercase tracking-[0.08em] text-white/65 xl:text-[9px]">
                      {state}
                    </span>
                    <span className="sr-only">
                      Open {district.name}, {DISTRICT_CHAPTER[district.id].label}: {DISTRICT_CHAPTER[district.id].title}. {district.total > 0 ? `${district.completed} of ${district.total} built activities completed.` : "Chapter available; activities are planned for prototype expansion."} {state}.
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="text-center text-[9px] leading-tight text-white/55 xl:text-[11px]">
          The dice moves you. Your decisions shape what you learn. {" "}
          <span className="font-bold text-white/75">
            {progress.completed}/{progress.total} activities
          </span>
        </p>
      </div>

      <SpaceSheet
        space={landedSpace}
        guardians={guardians}
        districtName={
          landedSpace?.districtId
            ? districtNames[landedSpace.districtId]
            : "Shield Central"
        }
        onClose={closeSheet}
      />
      <DistrictSheet district={openDistrict} onClose={() => setOpenDistrict(null)} />
      <DistrictDiscovery
        district={discoveryDistrict}
        onClose={closeDiscovery}
        onExplore={exploreDiscoveredDistrict}
      />
      <CityInfoSheet open={aboutOpen} onClose={() => setAboutOpen(false)} spaces={spaces} />
      <CityAlertSheet alert={alertOpen ? cityAlert : null} onClose={() => setAlertOpen(false)} />
    </div>
  );
}

function CompactHud({
  coins,
  resilience,
  tokens,
}: {
  coins: number;
  resilience: number;
  tokens: number;
}) {
  return (
    <dl className="flex items-center gap-1 xl:gap-2">
      <HudChip icon={<Coins className="h-3.5 w-3.5" />} label="Coins" value={coins} tone="amber" />
      <HudChip icon={<ShieldHalf className="h-3.5 w-3.5" />} label="Resilience" value={resilience} tone="teal" />
      <HudChip icon={<Sparkles className="h-3.5 w-3.5" />} label="Shield Tokens" value={tokens} tone="civic" />
    </dl>
  );
}

function HudChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "amber" | "teal" | "civic";
}) {
  const toneClass =
    tone === "amber"
      ? "text-amber-300"
      : tone === "teal"
        ? "text-teal-200"
        : "text-civic-200";

  return (
    <div className="flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2.5 md:flex-none xl:h-9 xl:px-3">
      <dt className={`shrink-0 ${toneClass}`}>
        <span aria-hidden="true">{icon}</span>
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="text-[12px] font-extrabold tabular-nums text-white">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

function CurrentQuest({
  space,
  districtName,
}: {
  space?: ResolvedSpace;
  districtName: string;
}) {
  if (!space) return null;
  const competency = space.node?.primaryCompetency ?? space.card?.competency;

  return (
    <div className="pointer-events-none absolute left-3 top-[50px] z-30 max-w-[240px] rounded-2xl border border-white/25 bg-navy-950/82 px-3 py-2 shadow-lg backdrop-blur-sm md:max-w-[290px]">
      <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-amber-400">
        Current quest
      </p>
      <p className="mt-0.5 truncate text-[12px] font-extrabold uppercase tracking-wide text-white">
        {space.node?.title ?? space.title}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-semibold text-white/70">
        <span className="truncate">{districtName}</span>
        {competency && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <span className="grid h-3.5 w-3.5 place-items-center rounded bg-amber-400 text-[8px] font-extrabold text-navy-950">
                {COMPETENCY_LETTER[competency]}
              </span>
              {COMPETENCY_LABEL[competency]}
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function LandingMoment({
  space,
  districtName,
  guardian,
}: {
  space: ResolvedSpace;
  districtName: string;
  guardian?: Parameters<typeof GuardianPlate>[0]["guardian"];
}) {
  const Icon = SPACE_ICON[space.kind];
  const competency = space.node?.primaryCompetency ?? space.card?.competency;

  return (
    <div
      className="animate-landing pointer-events-none absolute inset-0 z-40 grid place-items-center bg-navy-950/72 px-6 text-center backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[280px]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-amber-400">
          Landing
        </p>
        <span className="mx-auto mt-2 grid h-14 w-14 place-items-center rounded-2xl border-2 border-white/70 bg-civic-600 text-white shadow-xl">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-civic-200">
          {districtName}
        </p>
        <p className="mt-0.5 text-[20px] font-extrabold uppercase leading-tight tracking-tight text-white">
          {space.node?.title ?? space.title}
        </p>
        {(guardian || competency) && (
          <p className="mt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-white/75">
            {guardian && (
              <GuardianPlate guardian={guardian} className="h-6 w-6 rounded-lg text-[10px]" />
            )}
            {guardian?.name}
            {guardian && competency && <span aria-hidden="true">·</span>}
            {competency &&
              `${COMPETENCY_LETTER[competency]} · ${COMPETENCY_LABEL[competency]}`}
          </p>
        )}
      </div>
    </div>
  );
}

function CityAlertSheet({
  alert,
  onClose,
}: {
  alert: AdminScenarioRow | null;
  onClose: () => void;
}) {
  const competency = alert?.competencies[0];

  return (
    <Modal
      open={alert !== null}
      onClose={onClose}
      labelledBy="city-alert-title"
      className="bg-surface"
    >
      {alert && (
        <div className="flex max-h-[82dvh] min-h-0 flex-col text-ink">
          <header className="bg-coral-600 px-5 pb-4 pt-5 text-white">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-coral-100">
              City alert · Flash Mission
            </p>
            <h2
              id="city-alert-title"
              className="mt-1 pr-10 text-[24px] font-extrabold uppercase leading-tight tracking-tight"
            >
              {alert.title}
            </h2>
            <p className="mt-1 text-[13px] font-semibold text-coral-100">
              Digi-District
            </p>
          </header>

          <div className="space-y-3 px-5 py-4">
            <p className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral-700">
              New situation available
            </p>
            <p className="text-[14px] leading-relaxed text-ink-muted">{alert.category}</p>
            {competency && (
              <p className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-sunk px-3 py-2 text-[13px] font-bold text-navy-900">
                <span className="grid h-5 w-5 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white">
                  {COMPETENCY_LETTER[competency]}
                </span>
                {COMPETENCY_LABEL[competency]}
              </p>
            )}
            <p className="text-[12px] leading-relaxed text-ink-soft">
              This demo alert reflects a Flash Mission deployed from the Scenario Management Portal. Your facilitator can introduce the situation; no unfinished scenario has been presented as playable.
            </p>
            <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-sunk px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              City Alert is a game notification, not an official real-time SPF alert.
            </p>
          </div>

          <div className="border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-[14px] font-extrabold uppercase tracking-wide text-white transition hover:bg-navy-800"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Back to the city
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
