"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DecodeBoard } from "@/components/minigames/DecodeClueGame";
import { MiniGameShell } from "@/components/minigames/MiniGameShell";
import { TransferQuestionCard } from "@/components/minigames/TransferQuestion";
import { WordSearchBoard } from "@/components/minigames/WordSearchGame";
import { api } from "@/lib/api/client";
import { findNode } from "@/lib/api/world-data";
import type { DecodeClueGame, MiniGame, WordSearchGame } from "@/lib/types";

/**
 * Mini-game host.
 *
 * One route serves every mini-game: it loads the definition through
 * `ShieldQuestApi` like any other content, then dispatches on `kind`. Adding a
 * third mini-game means adding a fixture and one branch, not a new route.
 */
export default function MiniGamePage() {
  const params = useParams<{ gameId: string }>();
  const [game, setGame] = useState<MiniGame | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getMiniGame(params.gameId)
      .then((g) => {
        if (active) setGame(g);
      })
      .catch(() => {
        if (active) setMissing(true);
      });
    return () => {
      active = false;
    };
  }, [params.gameId]);

  if (missing) {
    return (
      <div className="px-5 py-16 text-center">
        <h1 className="text-xl font-extrabold text-navy-900">
          Activity not found
        </h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          This mini-game is not part of the prototype yet.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-navy-900 px-5 text-[15px] font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the city
        </Link>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2
          className="h-6 w-6 animate-spin text-civic-600"
          aria-label="Loading activity"
        />
      </div>
    );
  }

  return game.kind === "WORD_SEARCH" ? (
    <WordSearchRunner game={game} />
  ) : (
    <DecodeRunner game={game} />
  );
}

/** Where "back" goes — the district the node belongs to. */
function districtHref(nodeId: string) {
  const node = findNode(nodeId);
  return node ? `/district/${node.districtId}` : "/";
}

/* ------------------------------------------------------------------ */
/* Mini-game A — Spot the Warning Signs                                */
/* ------------------------------------------------------------------ */

function WordSearchRunner({ game }: { game: WordSearchGame }) {
  const [found, setFound] = useState<string[]>([]);
  const [transferDone, setTransferDone] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const allFound = found.length === game.words.length;

  const handleFound = useCallback((word: string) => {
    setFound((prev) => (prev.includes(word) ? prev : [...prev, word]));
  }, []);

  const replay = () => {
    setFound([]);
    setTransferDone(false);
    setRunKey((k) => k + 1);
  };

  return (
    <MiniGameShell
      game={game}
      backHref={districtHref(game.nodeId)}
      backLabel="Back to the district"
      progressLabel="Warning signs found"
      progressNow={found.length}
      progressTotal={game.words.length}
      solved={allFound}
      // The reward waits for the transfer question, so the activity always ends
      // by connecting the pattern back to a scenario.
      readyToReward={transferDone}
      // The board takes the gutter so its cells stay as large as an 8-wide
      // grid allows on a 375px phone.
      surfaceClassName="px-2 py-4"
      followUp={
        <>
          <p
            className="rounded-2xl border border-leaf-200 bg-leaf-50 px-4 py-3 text-center"
            aria-live="polite"
          >
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-leaf-700">
              Warning signs found
            </span>
            <span className="mt-0.5 block text-2xl font-extrabold tabular-nums text-leaf-700">
              {found.length} / {game.words.length}
            </span>
          </p>
          <TransferQuestionCard
            question={game.transfer}
            onAnswered={() => setTransferDone(true)}
          />
        </>
      }
      onReplay={replay}
    >
      <WordSearchBoard
        key={runKey}
        game={game}
        found={found}
        onFound={handleFound}
      />
    </MiniGameShell>
  );
}

/* ------------------------------------------------------------------ */
/* Mini-game B — Decode the Clue                                       */
/* ------------------------------------------------------------------ */

function DecodeRunner({ game }: { game: DecodeClueGame }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [solvedRounds, setSolvedRounds] = useState(0);

  const round = game.rounds[roundIndex];

  const wrongCount = useMemo(
    () => guessed.filter((l) => !round.answer.includes(l)).length,
    [guessed, round.answer],
  );
  const attemptsLeft = Math.max(0, game.attempts - wrongCount);
  const solved = round.answer
    .split("")
    .every((letter) => guessed.includes(letter));
  const failed = !solved && attemptsLeft === 0;

  const isLastRound = roundIndex === game.rounds.length - 1;
  const allSolved = solved && isLastRound;

  const guess = (letter: string) => {
    if (solved || failed || guessed.includes(letter)) return;
    setGuessed((prev) => [...prev, letter]);
  };

  const nextRound = () => {
    setSolvedRounds((n) => n + 1);
    setRoundIndex((i) => i + 1);
    setGuessed([]);
  };

  /** Retry the current round only — earlier rounds stay solved. */
  const retryRound = () => setGuessed([]);

  const replay = () => {
    setRoundIndex(0);
    setGuessed([]);
    setSolvedRounds(0);
  };

  return (
    <MiniGameShell
      game={game}
      backHref={districtHref(game.nodeId)}
      backLabel="Back to the district"
      progressLabel="Clues decoded"
      progressNow={solvedRounds + (solved ? 1 : 0)}
      progressTotal={game.rounds.length}
      solved={allSolved}
      onReplay={replay}
    >
      <DecodeBoard
        round={round}
        roundNumber={roundIndex + 1}
        roundTotal={game.rounds.length}
        guessed={guessed}
        attemptsLeft={attemptsLeft}
        attemptsTotal={game.attempts}
        solved={solved}
        failed={failed}
        onGuess={guess}
        onNext={solved && !isLastRound ? nextRound : undefined}
        onRetryRound={retryRound}
      />
    </MiniGameShell>
  );
}
