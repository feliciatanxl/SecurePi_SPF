"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DecodeBoard } from "@/components/minigames/DecodeClueGame";
import { MatchBoard } from "@/components/minigames/MatchPairsGame";
import { MiniGameShell } from "@/components/minigames/MiniGameShell";
import { PredictBoard } from "@/components/minigames/PredictGame";
import { RiskOrSafeBoard } from "@/components/minigames/RiskOrSafeGame";
import { TransferQuestionCard } from "@/components/minigames/TransferQuestion";
import { WordSearchBoard } from "@/components/minigames/WordSearchGame";
import { api } from "@/lib/api/client";
import { findNode } from "@/lib/api/world-data";
import type {
  DecodeClueGame,
  MatchGame,
  MiniGame,
  PredictGame,
  SortCard,
  SortGame,
  WordSearchGame,
} from "@/lib/types";

/**
 * Mini-game host.
 *
 * One route serves every mini-game: it loads the definition through
 * `ShieldQuestApi` like any other content, then dispatches on `kind`. Adding a
 * mini-game means adding a fixture and one branch, not a new route — which is
 * how the set grew from two activities to six without the routing changing.
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
          href="/game"
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

  switch (game.kind) {
    case "WORD_SEARCH":
      return <WordSearchRunner game={game} />;
    case "DECODE":
      return <DecodeRunner game={game} />;
    case "SORT":
      return <SortRunner game={game} />;
    case "MATCH":
      return <MatchRunner game={game} />;
    case "PREDICT":
      return <PredictRunner game={game} />;
  }
}

/** Where "back" goes — the district the node belongs to. */
function districtHref(nodeId: string) {
  const node = findNode(nodeId);
  return node ? `/district/${node.districtId}` : "/game";
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

/* ------------------------------------------------------------------ */
/* Mini-game C — Risk or Safe?                                         */
/* ------------------------------------------------------------------ */

function SortRunner({ game }: { game: SortGame }) {
  const [index, setIndex] = useState(0);
  const [calls, setCalls] = useState<Record<string, SortCard["answer"]>>({});
  const [transferDone, setTransferDone] = useState(false);

  const card = game.cards[index];
  const chosen = calls[card.id] ?? null;
  const isLast = index === game.cards.length - 1;
  const answeredCount = Object.keys(calls).length;
  const solved = answeredCount === game.cards.length && isLast && chosen !== null;

  const choose = (value: SortCard["answer"]) => {
    if (calls[card.id]) return;
    setCalls((prev) => ({ ...prev, [card.id]: value }));
  };

  /*
   * How many were called the way the content intends. Reported as a count of
   * the set, never as a score of the player — nothing anywhere in this app
   * turns an activity into a mark out of six.
   */
  const readCorrectly = game.cards.filter(
    (c) => calls[c.id] === c.answer,
  ).length;

  const replay = () => {
    setIndex(0);
    setCalls({});
    setTransferDone(false);
  };

  return (
    <MiniGameShell
      game={game}
      backHref={districtHref(game.nodeId)}
      backLabel="Back to the district"
      progressLabel="Requests called"
      progressNow={answeredCount}
      progressTotal={game.cards.length}
      solved={solved}
      readyToReward={!game.transfer || transferDone}
      followUp={
        <>
          <p
            className="rounded-2xl border border-leaf-200 bg-leaf-50 px-4 py-3 text-center"
            aria-live="polite"
          >
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-leaf-700">
              Called as intended
            </span>
            <span className="mt-0.5 block text-2xl font-extrabold tabular-nums text-leaf-700">
              {readCorrectly} / {game.cards.length}
            </span>
          </p>
          {game.transfer && (
            <TransferQuestionCard
              question={game.transfer}
              onAnswered={() => setTransferDone(true)}
            />
          )}
        </>
      }
      onReplay={replay}
    >
      <RiskOrSafeBoard
        card={card}
        cardNumber={index + 1}
        cardTotal={game.cards.length}
        chosen={chosen}
        onChoose={choose}
        onNext={
          chosen !== null && !isLast ? () => setIndex((i) => i + 1) : undefined
        }
        isLast={isLast}
      />
    </MiniGameShell>
  );
}

/* ------------------------------------------------------------------ */
/* Mini-games D & E — Clue Match, Who Can Help?                        */
/* ------------------------------------------------------------------ */

function MatchRunner({ game }: { game: MatchGame }) {
  const [matched, setMatched] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [transferDone, setTransferDone] = useState(false);

  const allMatched = matched.length === game.pairs.length;

  const selectPrompt = (pairId: string) => {
    setWrong(null);
    setSelected((prev) => (prev === pairId ? null : pairId));
  };

  const selectMatch = (pairId: string) => {
    if (!selected) return;
    if (selected === pairId) {
      setMatched((prev) => (prev.includes(pairId) ? prev : [...prev, pairId]));
      setSelected(null);
      setWrong(null);
    } else {
      // A wrong pairing costs nothing but the selection. The pairing is the
      // learning, so there is no point spending a life on getting it wrong.
      setWrong(selected);
      setSelected(null);
    }
  };

  const replay = () => {
    setMatched([]);
    setSelected(null);
    setWrong(null);
    setTransferDone(false);
  };

  return (
    <MiniGameShell
      game={game}
      backHref={districtHref(game.nodeId)}
      backLabel="Back to the district"
      progressLabel="Pairs connected"
      progressNow={matched.length}
      progressTotal={game.pairs.length}
      solved={allMatched}
      readyToReward={!game.transfer || transferDone}
      surfaceClassName="px-3 py-4"
      followUp={
        game.transfer ? (
          <TransferQuestionCard
            question={game.transfer}
            onAnswered={() => setTransferDone(true)}
          />
        ) : undefined
      }
      onReplay={replay}
    >
      <MatchBoard
        game={game}
        matched={matched}
        selectedPromptId={selected}
        wrongPromptId={wrong}
        onSelectPrompt={selectPrompt}
        onSelectMatch={selectMatch}
      />
    </MiniGameShell>
  );
}

/* ------------------------------------------------------------------ */
/* Mini-game F — What Happens Next?                                    */
/* ------------------------------------------------------------------ */

function PredictRunner({ game }: { game: PredictGame }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const round = game.rounds[index];
  const chosen = answers[round.id] ?? null;
  const isLast = index === game.rounds.length - 1;
  const answeredCount = Object.keys(answers).length;
  const solved = answeredCount === game.rounds.length;

  const choose = (optionIndex: number) => {
    if (answers[round.id] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [round.id]: optionIndex }));
  };

  const replay = () => {
    setIndex(0);
    setAnswers({});
  };

  return (
    <MiniGameShell
      game={game}
      backHref={districtHref(game.nodeId)}
      backLabel="Back to the district"
      progressLabel="Consequences predicted"
      progressNow={answeredCount}
      progressTotal={game.rounds.length}
      solved={solved}
      onReplay={replay}
    >
      <PredictBoard
        round={round}
        roundNumber={index + 1}
        roundTotal={game.rounds.length}
        chosen={chosen}
        onChoose={choose}
        onNext={
          chosen !== null && !isLast ? () => setIndex((i) => i + 1) : undefined
        }
        isLast={isLast}
      />
    </MiniGameShell>
  );
}
