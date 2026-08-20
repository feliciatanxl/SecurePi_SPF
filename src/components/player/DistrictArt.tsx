import { ArtSlot } from "@/components/ui/ArtSlot";
import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import { DISTRICT_ART } from "@/lib/brand/assets";
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
