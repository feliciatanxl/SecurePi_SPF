import { ArtSlot } from "@/components/ui/ArtSlot";
import { GUARDIAN_ART } from "@/lib/brand/assets";
import { COMPETENCY_LETTER, type Guardian } from "@/lib/types";

/**
 * A Guardian's plate.
 *
 * Shows the Guardian's portrait once one is registered in the art registry, and
 * the competency letter until then. Both render into the same square, so the
 * illustrated set can arrive without touching a single layout.
 */
export function GuardianPlate({
  guardian,
  /** Size and radius. Applies to the artwork and the placeholder alike. */
  className = "h-9 w-9 rounded-xl text-sm",
  tone = "navy",
}: {
  guardian: Guardian;
  className?: string;
  tone?: "navy" | "amber";
}) {
  const art = GUARDIAN_ART[guardian.id] ?? null;

  return (
    <ArtSlot src={art} className={`shrink-0 object-cover ${className}`}>
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center font-extrabold ${className} ${
          tone === "amber"
            ? "bg-amber-500 text-navy-900"
            : "bg-navy-900 text-white"
        }`}
      >
        {COMPETENCY_LETTER[guardian.competency]}
      </span>
    </ArtSlot>
  );
}
