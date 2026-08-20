"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Info } from "lucide-react";
import type { WordSearchGame as Game, WordSearchWord } from "@/lib/types";

interface Cell {
  r: number;
  c: number;
}

const key = (r: number, c: number) => `${r}:${c}`;
const sign = (n: number) => (n === 0 ? 0 : n > 0 ? 1 : -1);

/** Every cell a word occupies, in order. */
function cellsOf(word: WordSearchWord): Cell[] {
  return Array.from({ length: word.word.length }, (_, i) => ({
    r: word.row + word.dRow * i,
    c: word.col + word.dCol * i,
  }));
}

/**
 * The straight line between two cells, or null if they are not aligned.
 * Horizontal, vertical and both diagonals are all valid.
 */
function lineBetween(a: Cell, b: Cell): Cell[] | null {
  const dr = b.r - a.r;
  const dc = b.c - a.c;
  const aligned = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!aligned) return null;

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = sign(dr);
  const sc = sign(dc);
  return Array.from({ length: steps + 1 }, (_, i) => ({
    r: a.r + sr * i,
    c: a.c + sc * i,
  }));
}

/**
 * Spot the Warning Signs.
 *
 * Three ways to select a word, because a drag-only word search is unusable for a
 * lot of people:
 *
 *   1. Tap the first letter, then tap the last letter.
 *   2. Drag across the letters.
 *   3. Keyboard — arrow keys to move, Enter to set the start and the end.
 *
 * Every found word is announced, highlighted with a filled cell *and* ticked in
 * the word list, so status never depends on colour alone.
 */
export function WordSearchBoard({
  game,
  found,
  onFound,
}: {
  game: Game;
  found: string[];
  onFound: (word: string) => void;
}) {
  const size = game.grid.length;
  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [dragCells, setDragCells] = useState<Cell[]>([]);
  const [announce, setAnnounce] = useState("");
  const [nearMiss, setNearMiss] = useState(false);
  /*
   * The three ways in are still stated in full — they are just folded away on
   * a phone, where a permanent instruction block pushes the grid itself below
   * the fold. The same routes are announced to assistive technology through the
   * live region and the per-cell labels regardless of this toggle.
   */
  const [howToOpen, setHowToOpen] = useState(false);
  /*
   * The full word list is a tall block that sat permanently between the grid
   * and the next action. Every meaning is still read once, as the word lands,
   * through the live region below the grid — this keeps the whole list one tap
   * away without it pushing the completion step off the screen.
   */
  const [wordsOpen, setWordsOpen] = useState(false);

  const pressStart = useRef<Cell | null>(null);
  const dragging = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  /** cell → the word found there, for highlighting. */
  const foundCells = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of game.words) {
      if (!found.includes(w.word)) continue;
      for (const cell of cellsOf(w)) map.set(key(cell.r, cell.c), w.word);
    }
    return map;
  }, [found, game.words]);

  const readLine = useCallback(
    (cells: Cell[]) => cells.map(({ r, c }) => game.grid[r][c]).join(""),
    [game.grid],
  );

  /** Accepts a selection in either direction. */
  const evaluate = useCallback(
    (from: Cell, to: Cell) => {
      const line = lineBetween(from, to);
      setAnchor(null);
      setDragCells([]);
      if (!line || line.length < 3) return;

      const forward = readLine(line);
      const backward = [...line].reverse().map(({ r, c }) => game.grid[r][c]).join("");

      const hit = game.words.find(
        (w) =>
          !found.includes(w.word) &&
          (w.word === forward || w.word === backward),
      );

      if (hit) {
        onFound(hit.word);
        setAnnounce(`${hit.word} found. ${hit.meaning}`);
        setNearMiss(false);
      } else {
        setAnnounce("Not one of the warning signs. Try another line.");
        setNearMiss(true);
      }
    },
    [found, game.grid, game.words, onFound, readLine],
  );

  /* ---------------------------- tap selection ---------------------------- */

  const handleTap = useCallback(
    (cell: Cell) => {
      setNearMiss(false);
      if (!anchor) {
        setAnchor(cell);
        setAnnounce(
          `Start letter ${game.grid[cell.r][cell.c]} selected. Now choose the last letter of the word.`,
        );
        return;
      }
      if (anchor.r === cell.r && anchor.c === cell.c) {
        setAnchor(null);
        setAnnounce("Start letter cleared.");
        return;
      }
      evaluate(anchor, cell);
    },
    [anchor, evaluate, game.grid],
  );

  /* ---------------------------- drag selection --------------------------- */

  const cellFromPoint = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const holder = el?.closest<HTMLElement>("[data-cell]");
    if (!holder) return null;
    const [r, c] = holder.dataset.cell!.split(":").map(Number);
    return { r, c };
  };

  const onPointerDown = (cell: Cell) => {
    pressStart.current = cell;
    dragging.current = true;
    setDragCells([cell]);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !pressStart.current) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    const line = lineBetween(pressStart.current, cell);
    if (line) setDragCells(line);
  };

  const endDrag = () => {
    if (!dragging.current || !pressStart.current) return;
    const start = pressStart.current;
    const cells = dragCells;
    dragging.current = false;
    pressStart.current = null;

    // A press that never left its cell is a tap, not a drag.
    if (cells.length <= 1) {
      setDragCells([]);
      handleTap(start);
      return;
    }
    evaluate(start, cells[cells.length - 1]);
  };

  /* ------------------------------- keyboard ------------------------------ */

  /**
   * Keyboard activation.
   *
   * Selection is driven by pointer events so dragging works, but pressing Enter
   * or Space on a focused button fires only `click` — no pointerdown, no
   * pointerup — so without this the keyboard route advertised above would do
   * nothing at all.
   *
   * `detail === 0` is what distinguishes a keyboard-generated click from a
   * mouse or touch one, which is how the pointer path avoids being handled
   * twice here.
   */
  const onClickCell = (e: React.MouseEvent, cell: Cell) => {
    if (e.detail !== 0) return;
    handleTap(cell);
  };


  const focusCell = (r: number, c: number) => {
    const next = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-cell="${r}:${c}"]`,
    );
    next?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, cell: Cell) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    const r = Math.min(size - 1, Math.max(0, cell.r + move[0]));
    const c = Math.min(size - 1, Math.max(0, cell.c + move[1]));
    focusCell(r, c);
  };

  const inDrag = (r: number, c: number) =>
    dragCells.some((d) => d.r === r && d.c === c);

  const allFound = found.length === game.words.length;

  return (
    <div>
      {/* How to play — three routes, stated plainly, one tap away. */}
      <div className="mb-2">
        <button
          type="button"
          onClick={() => setHowToOpen((v) => !v)}
          aria-expanded={howToOpen}
          aria-controls="ws-how-to"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-[12px] font-bold text-civic-700 transition hover:text-civic-800"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          How to play
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${howToOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {howToOpen && (
          <p
            id="ws-how-to"
            className="mt-1 rounded-xl border border-line bg-surface-sunk px-3 py-2.5 text-[12px] leading-relaxed text-ink-muted"
          >
            Tap the first letter, then the last letter. You can also drag across
            the word, or move with the arrow keys and press Enter on the first
            and last letters.
          </p>
        )}
      </div>

      <div
        ref={gridRef}
        className="ws-grid select-none rounded-2xl border border-line bg-surface p-1"
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {game.grid.map((row, r) =>
          row.split("").map((letter, c) => {
            const foundWord = foundCells.get(key(r, c));
            const isAnchor = anchor?.r === r && anchor?.c === c;
            const selecting = inDrag(r, c);

            return (
              <button
                key={key(r, c)}
                type="button"
                data-cell={key(r, c)}
                onPointerDown={() => onPointerDown({ r, c })}
                onClick={(e) => onClickCell(e, { r, c })}
                onKeyDown={(e) => onKeyDown(e, { r, c })}
                aria-pressed={isAnchor}
                aria-label={
                  foundWord
                    ? `${letter}, row ${r + 1} column ${c + 1}, part of ${foundWord}`
                    : `${letter}, row ${r + 1} column ${c + 1}`
                }
                className={`ws-cell grid place-items-center rounded-md border text-[15px] font-extrabold uppercase transition ${
                  foundWord
                    ? "animate-found border-leaf-700 bg-leaf-700 text-white"
                    : isAnchor
                      ? "border-amber-600 bg-amber-500 text-navy-900"
                      : selecting
                        ? "border-civic-600 bg-civic-100 text-civic-800"
                        : "border-line bg-surface-sunk text-navy-900 hover:border-civic-500 hover:bg-civic-50"
                }`}
              >
                {letter}
              </button>
            );
          }),
        )}
      </div>

      {/* Live region — the only way a screen-reader user learns a word landed. */}
      <p
        aria-live="polite"
        className={`mt-2.5 min-h-[40px] rounded-xl border px-3 py-2 text-[13px] leading-snug ${
          nearMiss
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-line bg-surface-sunk text-ink"
        }`}
      >
        {announce ||
          "Six warning signs are hidden across, down and diagonally."}
      </p>

      {/* Found counter. Doubles as the control for the full list. */}
      <button
        type="button"
        onClick={() => setWordsOpen((v) => !v)}
        aria-expanded={wordsOpen}
        aria-controls="ws-words"
        className={`mt-2.5 flex min-h-[48px] w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${
          allFound
            ? "border-leaf-200 bg-leaf-50"
            : "border-line bg-surface hover:border-civic-500"
        }`}
      >
        <span
          className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
            allFound ? "text-leaf-700" : "text-ink-soft"
          }`}
        >
          Found
        </span>
        <span
          className={`text-[15px] font-extrabold tabular-nums ${
            allFound ? "text-leaf-700" : "text-navy-900"
          }`}
        >
          {found.length} / {game.words.length}
        </span>
        <span className="ml-auto flex items-center gap-1" aria-hidden="true">
          {game.words.map((w) => (
            <span
              key={w.word}
              className={`h-1.5 w-4 rounded-full ${
                found.includes(w.word) ? "bg-leaf-700" : "bg-line-strong"
              }`}
            />
          ))}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${wordsOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
        <span className="sr-only">
          {wordsOpen ? "Hide" : "Show"} the list of warning signs
        </span>
      </button>

      {/* Word list. Status never depends on colour: each row carries a tick,
          the word itself and a spoken found / not-found state. */}
      <ul
        id="ws-words"
        hidden={!wordsOpen}
        className="mt-1.5 space-y-1.5"
      >
        {game.words.map((w) => {
          const isFound = found.includes(w.word);
          return (
            <li
              key={w.word}
              className={`rounded-xl border px-3 py-2 ${
                isFound
                  ? "border-leaf-200 bg-leaf-50"
                  : "border-line bg-surface"
              }`}
            >
              <p className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded ${
                    isFound ? "bg-leaf-700 text-white" : "bg-line"
                  }`}
                >
                  {isFound && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span
                  className={`text-[14px] font-extrabold uppercase tracking-wide ${
                    isFound ? "text-leaf-700" : "text-ink-soft"
                  }`}
                >
                  {isFound ? w.word : "• • • • • •"}
                </span>
                <span className="sr-only">
                  {isFound ? "found" : "not found yet"}
                </span>
              </p>
              {isFound && (
                <p className="mt-0.5 pl-7 text-[13px] leading-snug text-ink">
                  {w.meaning}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
