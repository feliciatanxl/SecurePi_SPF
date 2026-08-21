"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock, Lock, MessageCircle, Sparkles } from "lucide-react";
import { DistrictPlate, DistrictScene } from "@/components/player/DistrictArt";
import { KIND_CHIP, MissionKindMark } from "@/components/player/MissionArt";
import { SkillTag } from "@/components/player/MissionNode";
import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import { Modal } from "@/components/ui/Modal";
import { DISTRICT_CHAPTER } from "@/lib/api/world-data";
import type { ResolvedDistrict, ResolvedNode } from "@/lib/hooks/useWorld";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { NODE_KIND_LABEL } from "@/lib/types";

/**
 * District detail sheet.
 *
 * Opening a stop on the board slides its route up over the board instead of
 * navigating away, so a player can look into three districts in three taps and
 * still see where they are. Everything on the full district page is reachable
 * from here — this is a faster route into it, never a replacement for it.
 */
export function DistrictSheet({
  district,
  onClose,
}: {
  district: ResolvedDistrict | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={district !== null}
      onClose={onClose}
      labelledBy="district-sheet-title"
      className="bg-surface"
    >
      {district && <SheetBody district={district} onClose={onClose} />}
    </Modal>
  );
}

function SheetBody({
  district,
  onClose,
}: {
  district: ResolvedDistrict;
  onClose: () => void;
}) {
  const skin = DISTRICT_SKIN[district.id];
  const chapter = DISTRICT_CHAPTER[district.id];
  const { guardians } = usePlayer();
  const guardianName = (id?: string) =>
    id ? guardians.find((guardian) => guardian.id === id)?.name : undefined;

  return (
    <div className="flex max-h-[82dvh] min-h-0 flex-col sm:max-h-[80dvh]">
      {/* Grab handle — the affordance a phone sheet is expected to have. */}
      <span
        aria-hidden="true"
        className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden"
      />

      {/*
        The sheet is the one surface wide enough to show a district scene at
        full strength, so it gets its own band rather than a wash behind the
        header. Nothing is printed over it: the header's tagline is mid-grey,
        and washing a scene under mid-grey text either fails AA or fades the
        artwork to nothing. A band clears both problems at once.

        It costs the stop list ~60px of a fixed-height sheet, not the page any
        height — and the list scrolls by design when a district outgrows it.
      */}
      <div className="relative h-[104px] w-full shrink-0 overflow-hidden sm:h-[118px]">
        <DistrictScene districtId={district.id} className="opacity-100" />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent"
        />
        <div className="absolute inset-x-4 bottom-3 text-white">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-amber-300">
            {chapter.label}
          </p>
          <p className="mt-0.5 text-[19px] font-extrabold uppercase leading-tight tracking-tight">
            {chapter.title}
          </p>
        </div>
      </div>

      <header
        className={`shrink-0 border-b px-4 pb-3.5 pt-3 ${skin.header}`}
      >
        <div className="flex items-start gap-3 pr-10">
          <DistrictPlate
            districtId={district.id}
            className="h-11 w-11 rounded-2xl"
            iconClassName="h-5 w-5"
          />
          <div className="min-w-0 flex-1">
            <h2
              id="district-sheet-title"
              className="text-[17px] font-extrabold uppercase leading-tight tracking-wide text-navy-900"
            >
              {district.name}
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
              {chapter.intro}
            </p>
          </div>
        </div>

        <p className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px] font-bold">
          <span className="tabular-nums text-navy-900">
            {district.completed} / {district.total} completed
          </span>
          {district.cleared && (
            <span className="inline-flex items-center gap-1 rounded-md bg-leaf-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              District cleared
            </span>
          )}
        </p>

        {district.id === "digi" && (
          <p className="mt-2 flex items-center gap-2 rounded-lg border border-civic-200 bg-white/70 px-2.5 py-2 text-[11px] font-semibold leading-snug text-civic-800">
            <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Story thread: follow Jayden from a tempting offer to the pressure that follows.
          </p>
        )}
      </header>

      <ol className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {district.nodes.map((node, i) => (
          <li key={node.id}>
            <SheetStop
              node={node}
              index={i}
              guardianName={guardianName(node.guardianId)}
              onNavigate={onClose}
            />
          </li>
        ))}
      </ol>

      <div className="shrink-0 border-t border-line px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        <Link
          href={`/district/${district.id}`}
          onClick={onClose}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-[14px] font-extrabold text-white transition hover:bg-navy-800"
        >
          Open the full district route
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/** One compact stop row. Status is never carried by colour alone. */
function SheetStop({
  node,
  index,
  guardianName,
  onNavigate,
}: {
  node: ResolvedNode;
  index: number;
  guardianName?: string;
  onNavigate: () => void;
}) {
  const locked = !node.playable;
  const planned = node.availability === "PLANNED";

  const inner = (
    <>
      <span className="w-8 shrink-0 pt-0.5 text-center">
        <span className="block text-[18px] font-black leading-none tabular-nums text-navy-900">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          aria-hidden="true"
          className={`mx-auto mt-1 grid h-6 w-6 place-items-center rounded-lg border ${
          node.completed
            ? "border-leaf-200 bg-leaf-600 text-white"
            : locked
              ? "border-line bg-surface-sunk text-ink-soft"
              : "border-navy-800 bg-navy-900 text-amber-400"
        }`}
        >
        {node.completed ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : locked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <MissionKindMark kind={node.kind} className="h-3 w-3" />
        )}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex rounded border px-1 py-px text-[9px] font-bold uppercase tracking-[0.1em] ${KIND_CHIP[node.kind]}`}
          >
            {NODE_KIND_LABEL[node.kind]}
          </span>
          {node.chapterRole && (
            <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-civic-700">
              {node.chapterRole}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[14px] font-extrabold leading-snug text-navy-900">
          {node.title}
        </span>
        <span className="mt-0.5 block text-[12px] font-semibold text-ink-soft">
          {node.completed ? (
            "Completed — replay any time"
          ) : planned ? (
            "Coming soon"
          ) : locked ? (
            `Locked — complete ${node.remainingToUnlock} more here`
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {node.estimatedMinutes} min
            </span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <SkillTag competency={node.primaryCompetency} className="text-[10px]" />
          {guardianName && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {guardianName}
            </span>
          )}
        </span>
      </span>

      {!locked && (
        <ArrowRight
          className="h-4 w-4 shrink-0 self-center text-civic-600"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (locked) {
    return (
      <p
        aria-disabled="true"
        className="flex min-h-[56px] items-start gap-2.5 rounded-xl border border-line bg-surface-sunk px-3 py-2.5"
      >
        {inner}
      </p>
    );
  }

  return (
    <Link
      href={node.href ?? "#"}
      onClick={onNavigate}
      className={`flex min-h-[56px] items-start gap-2.5 rounded-xl border px-3 py-2.5 transition ${
        node.completed
          ? "border-leaf-200 bg-leaf-50 hover:border-leaf-600"
          : "border-line bg-surface hover:border-civic-500"
      }`}
    >
      {inner}
    </Link>
  );
}
