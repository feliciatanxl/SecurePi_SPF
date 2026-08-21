import { BOARD_SPACES } from "@/lib/api/board-data";

/**
 * Geometry for the city track.
 *
 * The board is one long horizontal route that the viewport pans along — a
 * "board camera" — rather than 22 spaces crushed into a phone screen. A player
 * sees six or seven spaces around their token at 390px and can pan to look
 * ahead; a laptop simply sees more of the same route, because the camera is the
 * container's own horizontal scroll rather than a separate desktop layout.
 *
 * Everything below is plain arithmetic on the space index so the route line,
 * the spaces, the district bands and the token all agree without any of them
 * measuring the DOM.
 */

/** Distance between space centres. */
export const SPACING = 68;
/** Padding before the first and after the last space. */
export const EDGE = 42;
/** Vertical travel of the route, peak to peak. */
export const AMPLITUDE = 32;
/** Vertical centre of the route within the track. */
export const CENTRE_Y = 230;
export const TRACK_HEIGHT = 340;

export const TRACK_WIDTH = EDGE * 2 + (BOARD_SPACES.length - 1) * SPACING;

/** Horizontal centre of the space at `index`. */
export const spaceX = (index: number) => EDGE + index * SPACING;

/**
 * Vertical centre of the space at `index`.
 *
 * A six-space sine period, so the route rises and falls like a street rather
 * than running dead straight — and the period is long enough that neighbouring
 * spaces never sit far enough apart to read as two separate rows.
 */
export const spaceY = (index: number) =>
  CENTRE_Y + AMPLITUDE * Math.sin((index * Math.PI) / 3);

/** The route line, as a smooth path through every space centre. */
export function routePath(): string {
  const points = BOARD_SPACES.map((s) => ({
    x: spaceX(s.index),
    y: spaceY(s.index),
  }));
  if (points.length === 0) return "";

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const midX = (a.x + b.x) / 2;
    d += ` C ${midX} ${a.y} ${midX} ${b.y} ${b.x} ${b.y}`;
  }
  return d;
}

/** Left edge and width of the band covering a run of spaces. */
export function bandBox(firstIndex: number, lastIndex: number) {
  const left = spaceX(firstIndex) - SPACING / 2;
  const right = spaceX(lastIndex) + SPACING / 2;
  return { left, width: right - left };
}
