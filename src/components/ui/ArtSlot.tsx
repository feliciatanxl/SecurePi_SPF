import type { ReactNode } from "react";
import type { ArtSlotSource } from "@/lib/brand/assets";

/**
 * A replaceable artwork slot.
 *
 * Renders the registered image when `src/lib/brand/assets.ts` has a file for
 * this slot, and the supplied placeholder — an icon, a letter plate, a CSS
 * shape — until it does. The two render into the same box, so dropping real
 * artwork in never moves anything.
 *
 * Purely decorative by default: the surrounding component owns the accessible
 * name, so the image is hidden from assistive technology unless an `alt` is
 * explicitly passed.
 */
export function ArtSlot({
  src,
  alt = "",
  className = "",
  children,
}: {
  src: ArtSlotSource;
  alt?: string;
  /** Applied to the image. Size it the same as the placeholder it replaces. */
  className?: string;
  /** Placeholder shown while the slot is empty. */
  children: ReactNode;
}) {
  if (!src) return <>{children}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      className={className}
      draggable={false}
    />
  );
}
