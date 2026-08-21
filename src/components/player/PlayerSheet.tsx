import type { ReactNode } from "react";

/**
 * The desktop measure for a player route.
 *
 * The application owns the viewport and the content owns a measure — but only
 * the content. This deliberately paints nothing: no background of its own, no
 * side borders, no elevation. The page surface behind it runs edge to edge and
 * continues straight past the measure, so what a laptop shows is one full-width
 * ShieldQuest surface with readable content down the middle of it.
 *
 * That distinction is the whole point. An earlier version gave the measured
 * column a white background and hairline side borders on the civic canvas, which
 * turned it into a document sheet floating in a light gutter — the "narrow page
 * inside a big browser window" effect the full-bleed shell exists to remove. A
 * measure should decide where text wraps, not draw a page edge.
 *
 * `header` renders outside the measure, full-bleed across the shell, for chrome
 * that should span the application: a district hero, a mission bar, a page bar.
 * Its own contents take the same measure via `sheetMeasure`, so a full-bleed bar
 * never strands its title hundreds of pixels from the column it introduces.
 */
export type SheetMeasure = "wide" | "medium" | "reading" | "narrow";

const MEASURE: Record<SheetMeasure, string> = {
  /** Grids and dashboards — Progress, Guardians, Rewards, Journey. */
  wide: "xl:max-w-[1480px]",
  /** Two-column content with rows that should not run away — Settings, Skills. */
  medium: "xl:max-w-[1280px]",
  /** Prose-led pages, held to a comfortable line — Trusted Help. */
  reading: "xl:max-w-[1140px]",
  /** Deliberately small compositions — Join a session. */
  narrow: "xl:max-w-[1080px]",
};

/**
 * The measure on its own, for chrome that spans the shell but whose *contents*
 * have to line up with the content below it.
 */
export const sheetMeasure = (measure: SheetMeasure = "wide") =>
  `mx-auto w-full md:max-w-[820px] lg:max-w-[1024px] ${MEASURE[measure]}`;

export function PlayerSheet({
  measure = "wide",
  header,
  className = "",
  children,
}: {
  measure?: SheetMeasure;
  /** Full-bleed chrome, rendered above the measured content. */
  header?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    /*
      `min-h-full` so a short page still fills the viewport. The surface colour
      comes from the shell, not from here, which is what keeps it continuous
      behind and beside the measure.
    */
    <div className="flex min-h-full flex-col">
      {header}
      <div className={`${sheetMeasure(measure)} flex-1 ${className}`}>
        {children}
      </div>
    </div>
  );
}
