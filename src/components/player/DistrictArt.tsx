import { ArtSlot } from "@/components/ui/ArtSlot";
import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import { DISTRICT_ART, DISTRICT_SCENE_ART } from "@/lib/brand/assets";
import type { DistrictId } from "@/lib/types";

/**
 * A district's plate.
 *
 * Shows the district's illustration once one is registered in the art registry,
 * and the district's lucide mark on its palette plate until then. Both render
 * into the same square, at the same radius, so the illustrated city can arrive
 * without moving anything on the board.
 */
export function DistrictPlate({
  districtId,
  /** Size and radius. Applies to the artwork and the placeholder alike. */
  className = "h-9 w-9 rounded-xl",
  /** Size of the fallback mark inside the plate. */
  iconClassName = "h-4 w-4",
}: {
  districtId: DistrictId;
  className?: string;
  iconClassName?: string;
}) {
  const skin = DISTRICT_SKIN[districtId];
  const Icon = skin.icon;

  return (
    <ArtSlot
      src={DISTRICT_ART[districtId]}
      className={`shrink-0 object-cover ${className}`}
    >
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center ${className} ${skin.plate}`}
      >
        <Icon className={iconClassName} />
      </span>
    </ArtSlot>
  );
}

/**
 * A district's scene.
 *
 * The wide 800×300 district illustration, filling whatever surface it is given.
 * It is absolutely positioned, so the surface decides the height and the scene
 * never adds any — a district can look like somewhere without costing the route
 * below it a single pixel, which on a phone is the point of the screen.
 *
 * Two ways to use it, and the difference matters for contrast:
 *
 *  - As a **band** at full strength, with nothing printed over it. This is how
 *    the district sheet shows it, and it is the only way the artwork is seen
 *    properly.
 *  - As a **wash** behind a header, at low opacity. Only over surfaces whose
 *    text is dark — the mid-greys this app uses for body copy stop meeting AA
 *    long before a wash is strong enough to see.
 *
 * Renders nothing while the slot is empty, leaving the surface exactly as it is
 * without one.
 */
export function DistrictScene({
  districtId,
  /** Tailwind classes for the scene. Opacity belongs here. */
  className = "opacity-100",
}: {
  districtId: DistrictId;
  className?: string;
}) {
  const src = DISTRICT_SCENE_ART[districtId];
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none absolute inset-0 h-full w-full select-none object-cover ${className}`}
    />
  );
}
