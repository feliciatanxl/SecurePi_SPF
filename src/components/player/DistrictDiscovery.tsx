"use client";

import { ArrowRight, Compass, MapPin } from "lucide-react";
import { DistrictScene } from "@/components/player/DistrictArt";
import { Modal } from "@/components/ui/Modal";
import { DISTRICT_CHAPTER } from "@/lib/api/world-data";
import type { ResolvedDistrict } from "@/lib/hooks/useWorld";

/**
 * A short chapter reveal. Discovery is travel state only: there is no reward
 * burst, token call or completion mutation anywhere in this component.
 */
export function DistrictDiscovery({
  district,
  onExplore,
  onClose,
}: {
  district: ResolvedDistrict | null;
  onExplore: () => void;
  onClose?: () => void;
}) {
  if (!district) return null;
  const chapter = DISTRICT_CHAPTER[district.id];

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={Boolean(onClose)}
      labelledBy="district-discovery-title"
      className="overflow-hidden bg-surface"
    >
      <div className="relative isolate h-[168px] shrink-0 overflow-hidden text-white sm:h-[190px]">
        <DistrictScene districtId={district.id} className="-z-20 opacity-100" />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/42 to-transparent"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300/55 bg-navy-950/78 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-amber-300 backdrop-blur-sm">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          District discovered
        </span>
        <div className="absolute inset-x-5 bottom-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-civic-200">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {chapter.label}
          </p>
          <h2
            id="district-discovery-title"
            className="mt-1 text-[27px] font-black uppercase leading-none tracking-tight"
          >
            {district.name}
          </h2>
        </div>
      </div>

      <div className="px-5 py-5 text-center text-ink">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-civic-700">
          {chapter.label}
        </p>
        <p className="mt-1 text-[23px] font-black leading-tight text-navy-950">
          {chapter.title}
        </p>
        <p className="mx-auto mt-3 max-w-[390px] text-[14px] leading-relaxed text-ink-muted">
          {chapter.intro}
        </p>
        <p className="mx-auto mt-4 max-w-[390px] rounded-xl border border-line bg-surface-sunk px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
          Discovery reveals the chapter. Shield Tokens and Guardian progress are
          earned through learning activities—not travel or dice luck.
        </p>
      </div>

      <div className="border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={onExplore}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[14px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
        >
          Explore district
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
}
