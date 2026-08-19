import { GUARDIAN_VERIFOX } from "@/lib/api/mock-data";
import { NODE_DECODE, NODE_WORD_SEARCH } from "@/lib/api/world-data";
import type { DecodeClueGame, MiniGame, WordSearchGame } from "@/lib/types";

/**
 * Mini-game content.
 *
 * Mini-games are reinforcement, never a replacement for the scenario engine.
 * Each one is deliberately short, pays a small reward next to a scenario
 * decision, and closes by handing the player back to a situation they have
 * played — recognition on its own is trivia.
 *
 * The word-search grid is authored, not generated. Two reasons: a server render
 * and the first client render must be byte-identical (a randomised grid would
 * cause a hydration mismatch), and an authored board can be checked to contain
 * each target word exactly once, so no selection is ambiguous.
 *
 *   col  0 1 2 3 4 5 6 7
 *   row0 A H D R P B A P
 *   row1 C U T H N S M A
 *   row2 C V N H Y C E S
 *   row3 O E E C P R G S
 *   row4 U V O R A A A W
 *   row5 N Y E D I E E O
 *   row6 T R A N S F E R
 *   row7 U R G E N C Y D
 *
 * ACCOUNT  ↓ from (0,0)   PASSWORD ↓ from (0,7)
 * TRANSFER → from (6,0)   URGENCY  → from (7,0)
 * VERIFY   ↘ from (2,1)   DARE     ↗ from (5,3)
 */

export const WORD_SEARCH_GAME: WordSearchGame = {
  id: "spot-the-warning-signs",
  kind: "WORD_SEARCH",
  nodeId: NODE_WORD_SEARCH,
  title: "Spot the Warning Signs",
  instruction: "Find the words that could signal a risky situation.",
  primaryCompetency: "SPOT",
  skillName: "VeriFox skill",
  skillTitle: "Recognition",
  skillLine: "The signals show up long before the loss does.",
  // Small on purpose. A mini-game is worth a fraction of a scenario decision.
  reward: {
    deltas: { coins: 60, trust: 4 },
    guardianId: GUARDIAN_VERIFOX,
  },
  grid: [
    "AHDRPBAP",
    "CUTHNSMA",
    "CVNHYCES",
    "OEECPRGS",
    "UVORAAAW",
    "NYEDIEEO",
    "TRANSFER",
    "URGENCYD",
  ],
  words: [
    {
      word: "URGENCY",
      row: 7,
      col: 0,
      dRow: 0,
      dCol: 1,
      meaning:
        "Pressure to act immediately can stop you from checking properly.",
    },
    {
      word: "ACCOUNT",
      row: 0,
      col: 0,
      dRow: 1,
      dCol: 0,
      meaning:
        "Nobody legitimate needs your personal account to move their money.",
    },
    {
      word: "TRANSFER",
      row: 6,
      col: 0,
      dRow: 0,
      dCol: 1,
      meaning:
        "Being asked to pass money onward is what turns a favour into an offence.",
    },
    {
      word: "PASSWORD",
      row: 0,
      col: 7,
      dRow: 1,
      dCol: 0,
      meaning:
        "A login you share is a login you no longer control. It stays your name on it.",
    },
    {
      word: "DARE",
      row: 5,
      col: 3,
      dRow: -1,
      dCol: 1,
      meaning:
        "A dare moves the decision from you to the group. The consequence does not move with it.",
    },
    {
      word: "VERIFY",
      row: 2,
      col: 1,
      dRow: 1,
      dCol: 1,
      meaning:
        "The one step that costs nothing and breaks most of these situations.",
    },
  ],
  transfer: {
    prompt: "Which warning sign appeared in the Easy Money scenario?",
    options: [
      "A deadline — “need your answer tonight”",
      "A signed employment contract",
      "A request to meet in person first",
    ],
    answerIndex: 0,
    explanation:
      "“Need your answer tonight” is urgency. The deadline was not about their schedule — it was there so you would not have time to check who you were dealing with.",
  },
};

export const DECODE_CLUE_GAME: DecodeClueGame = {
  id: "decode-the-clue",
  kind: "DECODE",
  nodeId: NODE_DECODE,
  title: "Decode the Clue",
  instruction: "Work out the prevention skill from the hint. Pick letters.",
  primaryCompetency: "HOLD",
  skillName: "VeriFox skill",
  skillTitle: "Verification",
  skillLine: "Check before you trust.",
  reward: {
    deltas: { coins: 40, trust: 3 },
    guardianId: GUARDIAN_VERIFOX,
  },
  attempts: 5,
  rounds: [
    {
      answer: "VERIFY",
      hint: "What should you do before trusting an unexpected request?",
      meaning:
        "Check the source through a channel you already trust — not the one that contacted you.",
    },
    {
      answer: "PRESSURE",
      hint: "What is being applied when you are told to decide right now?",
      meaning:
        "Naming it as pressure is what lets you step out of it. A real offer survives a delay.",
    },
  ],
};

export const MINI_GAMES: MiniGame[] = [WORD_SEARCH_GAME, DECODE_CLUE_GAME];

export function findMiniGame(id: string): MiniGame | undefined {
  return MINI_GAMES.find((g) => g.id === id);
}
