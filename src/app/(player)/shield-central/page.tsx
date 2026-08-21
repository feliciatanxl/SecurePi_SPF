"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  LifeBuoy,
  Map as MapIcon,
  QrCode,
  Settings,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { PlayerSheet, sheetMeasure } from "@/components/player/PlayerSheet";
import { useShieldProgress } from "@/lib/hooks/useShieldProgress";
import { usePlayer } from "@/lib/state/PlayerProvider";

/**
 * Shield Central — the player's hub.
 *
 * Everything that is not the game loop lives here: the journey so far, rewards,
 * achievements, the Casebook, trusted help, the framework and settings. It
 * exists so those seven things can be part of the product without the bottom
 * navigation growing past four tabs — City, Peer Shield, Progress, Guardians.
 */
export default function ShieldCentralPage() {
  const { profile, guardians, equippedIn } = usePlayer();
  const { achievements, badges } = useShieldProgress();

  const guardian =
    guardians.find((g) => g.id === profile.currentGuardianId) ?? guardians[0];
  const earned = achievements.filter((a) => a.earned).length;
  const framed = Boolean(equippedIn("profileFrame"));

  return (
    <PlayerSheet
      className="pb-8"
      header={
        <header
          className={`relative overflow-hidden bg-navy-900 px-4 pb-4 pt-[max(0.9rem,env(safe-area-inset-top))] text-white xl:px-6 ${
            framed ? "border-b-4 border-leaf-600" : ""
          }`}
        >
          <div className={sheetMeasure()}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-civic-600/25 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <GuardianPlate
            guardian={guardian}
            className={`h-12 w-12 rounded-2xl text-[18px] ${
              equippedIn("guardianAura") ? "guardian-aura" : ""
            }`}
            tone="amber"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Project SHIELD
            </p>
            <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-tight">
              Shield Central
            </h1>
            <p className="text-[12px] font-semibold text-navy-100">
              Your player hub · {guardian.name} leading
            </p>
          </div>
        </div>

        <dl className="mt-3 flex gap-1.5">
          <HeaderStat label="Shield Tokens" value={profile.shieldTokens} />
          <HeaderStat label="Achievements" value={earned} />
          <HeaderStat label="Badges" value={badges.length} />
        </dl>
          </div>
        </header>
      }
    >
      <div className="space-y-3 px-4 pt-3.5 xl:space-y-5 xl:px-6 xl:pt-5">
        {/* The four primary destinations sit on one row once there is room. */}
        <ul className="grid grid-cols-2 gap-2.5 xl:grid-cols-4 xl:gap-4">
          <Tile
            href="/shield-central/journey"
            icon={<MapIcon className="h-5 w-5" />}
            label="My Journey"
            tone="civic"
          />
          <Tile
            href="/shield-central/rewards"
            icon={<Award className="h-5 w-5" />}
            label="Rewards"
            tone="amber"
          />
          <Tile
            href="/shield-central/achievements"
            icon={<Trophy className="h-5 w-5" />}
            label="Achievements"
            tone="leaf"
          />
          <Tile
            href="/shield-central/trusted-help"
            icon={<LifeBuoy className="h-5 w-5" />}
            label="Trusted Help"
            tone="teal"
          />
        </ul>

        <ul className="space-y-2 xl:grid xl:grid-cols-2 xl:gap-3 xl:space-y-0">
          <Row
            href="/shield-central/casebook"
            icon={<BookOpen className="h-5 w-5" />}
            label="Shield Casebook"
            note={`${profile.casebook.length} situation${profile.casebook.length === 1 ? "" : "s"} recorded`}
          />
          <Row
            href="/shield-central/skills"
            icon={<Shield className="h-5 w-5" />}
            label="S.H.I.E.L.D. skills"
            note="The six prevention skills you practise"
          />
          <Row
            href="/shield-central/check-in"
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Learning check"
            note={
              profile.learningChecks.pre.completed
                ? "Quick check-in completed"
                : "A short, ungraded check-in"
            }
          />
          <Row
            href="/join"
            icon={<QrCode className="h-5 w-5" />}
            label="Join a session"
            note={
              profile.joinedSession
                ? profile.joinedSession.name
                : "Simulated pilot session"
            }
          />
          <Row
            href="/shield-central/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            note="Sound, motion, text size, contrast"
          />
        </ul>

        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Shield Tokens are participation credit for cosmetics. They are not
          money, cannot be cashed out, and are never awarded for a dice roll or
          for doing better than anyone else.
        </p>
      </div>
    </PlayerSheet>
  );
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-xl border border-white/12 bg-white/8 px-2 py-1.5">
      <dt className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-navy-100/70">
        {label}
      </dt>
      <dd className="text-[16px] font-extrabold leading-tight tabular-nums text-white">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

const TILE_TONE = {
  civic: "border-civic-200 bg-civic-50 text-civic-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  leaf: "border-leaf-200 bg-leaf-50 text-leaf-700",
  teal: "border-teal-200 bg-teal-50 text-teal-700",
} as const;

function Tile({
  href,
  icon,
  label,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  tone: keyof typeof TILE_TONE;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-3 text-center transition hover:-translate-y-0.5 hover:border-civic-500"
      >
        <span
          aria-hidden="true"
          className={`grid h-10 w-10 place-items-center rounded-full border ${TILE_TONE[tone]}`}
        >
          {icon}
        </span>
        <span className="text-[13px] font-extrabold text-navy-900">{label}</span>
      </Link>
    </li>
  );
}

function Row({
  href,
  icon,
  label,
  note,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  note: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 transition hover:border-civic-500"
      >
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-sunk text-ink-muted"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-extrabold text-navy-900">
            {label}
          </span>
          <span className="block truncate text-[12px] font-semibold text-ink-soft">
            {note}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
      </Link>
    </li>
  );
}
