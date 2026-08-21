import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import type { ResolvedSpace } from "@/lib/hooks/useBoard";

/**
 * City progress — the whole route at a glance.
 *
 * The track only ever shows the part of the city around the player, so this is
 * the piece that answers "where am I in all of this". One pip per space,
 * grouped by district, with the current position marked by shape as well as
 * colour. Personal progress only: there is nothing here to compare against
 * anybody else.
 */
export function BoardMiniMap({
  spaces,
  completed,
  total,
}: {
  spaces: ResolvedSpace[];
  completed: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/8 px-2.5 py-1.5">
      <p className="shrink-0 text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-navy-100/70">
        City
        <br />
        map
      </p>

      <ol className="flex min-w-0 flex-1 items-center gap-[3px]" aria-hidden="true">
        {spaces.map((space) => {
          const fill = space.districtId
            ? DISTRICT_SKIN[space.districtId].fill
            : "bg-white/50";

          if (space.isCurrent) {
            return (
              <li
                key={space.index}
                className="h-3 w-[7px] shrink-0 rounded-[2px] bg-white ring-1 ring-amber-400"
              />
            );
          }
          return (
            <li
              key={space.index}
              className={`h-1.5 min-w-0 flex-1 rounded-full ${
                space.completed ? "bg-leaf-600" : `${fill} opacity-45`
              }`}
            />
          );
        })}
      </ol>

      <p className="shrink-0 text-[11px] font-extrabold tabular-nums text-white">
        {completed}/{total}
      </p>

      <span className="sr-only">
        City progress: {completed} of {total} built activities completed. This is
        your own progress and is not compared with other participants.
      </span>
    </div>
  );
}
