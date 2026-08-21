# ShieldQuest

Interactive frontend prototype of a youth crime prevention PWA, built for the
Singapore Police Force pitch. Next.js (App Router) · React 19 · TypeScript ·
Tailwind CSS v4 · lucide-react.

All data is hardcoded and served through a mock API client. There is no backend.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Prototype views

| Route | View | What it demonstrates |
| --- | --- | --- |
| `/` | **ShieldQuest City board** | The front door and the game loop: **roll -> move -> land -> play -> decide -> learn -> back to the board**. An original 22-space roll-and-move track through the four districts, a player token, a board camera that keeps ~6 spaces around the token readable on a phone and ~14 on a laptop, and a mini-map for the whole route. Every district is also reachable directly from the chips beneath the board, so nothing is gated behind a roll. |
| `/district/[id]` | **District route** | `district -> mission node -> activity -> learning outcome -> progress`. Each node shows its type, its S.H.I.E.L.D. skill, its Guardian and, when locked, exactly what opens it. |
| `/play` | **Scenario Encounter** | Player is the target of a money mule approach. Optional clue tagging, then three **visually neutral** choices. "Accept" pays **+300 Coins immediately**; **~3 seconds later** the Delayed Consequence takeover lands. |
| `/play` (after Accept) | **Delayed Consequence** | Full-screen "3 days later" takeover: What changed (immediate vs later), Why this mattered, Safer response. Not dismissible. |
| `/peer-shield` | **Peer Shield Mode** | Same threat, player is the bystander. "Warn them privately" awards **Community Resilience**; silence deducts it. Includes a sample intervention script. |
| `/mini-game/spot-the-warning-signs` | **Mini-game A - word search** | Find six risk words, each explained on discovery, then answer one transfer question tying the pattern back to the Easy Money scenario. |
| `/mini-game/decode-the-clue` | **Mini-game B - decode** | Word-guessing built around prevention vocabulary. Wrong guesses drain a **signal-strength meter**, never a hanging figure. |
| `/shield-central` | **Shield Central** | Secondary hub, so seven supporting screens can exist without the bottom navigation growing past four tabs. |
| `/shield-central/journey` | **My Shield Journey** | Personal learning history: activities, districts, skills, Guardians, badges. No rank, no percentile, no comparison. |
| `/shield-central/rewards` | **Rewards Hub** | Cosmetic-only unlocks bought with **Shield Tokens**, plus an informational Pilot Rewards note. No crates, no draws, no gameplay advantage. |
| `/shield-central/achievements` | **Achievements** | Personal milestones. Completing one pays Shield Tokens once. |
| `/shield-central/casebook` | **Shield Casebook** | Every Situation Card met becomes a learning reference - warning signs, skill, Guardian, safer response - sourced from the same content the debrief taught. |
| `/shield-central/trusted-help` | **Trusted Help** | Beacon's screen. Generic behavioural guidance only: no hotline numbers, no legal claims, and nothing that positions a youth as an investigator. |
| `/shield-central/skills` | **S.H.I.E.L.D. skills** | The one place the framework is explained at length, with how often each skill has been practised. |
| `/shield-central/check-in` | **Pre / post learning check** | Prototype measurement for a facilitated pilot. Ungraded, unscored, and incapable of producing a risk profile. |
| `/shield-central/settings` | **Settings** | Sound, reduced motion, larger text, high contrast, replay tutorial, reset local progress. |
| `/join` | **Join a session** | Prototype joining flow, labelled **Simulated pilot session** throughout. No backend, no real session. |
| `/progress` | **City progress** | Personal record of what has been practised. No ranking, no cohort comparison, no peer visibility. |
| `/guardians` | **Guardian / Progress** | VeriFox, Beacon and Shieldfin — one prevention skill each, strengthened only by practising that skill. |
| `/admin` | **Scenario Management Portal** | Desktop console with four areas - Overview, Scenario Library, Content Review, Insights - and **Deploy Flash Mission** as a persistent header action, opening a 480px right-side drawer that confirms in place. |

First run shows a four-screen onboarding overlay (welcome, how to play, build your
Shield, choose your token). It is an overlay rather than a route so it cannot be
linked to or reached by URL, and it can be replayed from Settings.

Naming: **PROJECT SHIELD** is the initiative, **ShieldQuest** the digital experience,
**S.H.I.E.L.D.** the behavioural framework. Tagline: *Choose Right. Protect Together.*

## Architecture

The prototype is deliberately structured so the mock layer can be replaced with
a real Node.js/TypeScript backend without touching a single component.

```
src/
  lib/
    types.ts              Domain contracts. In production this becomes a shared
                          @shieldquest/contracts package consumed by both the
                          API service and this client, so the two cannot drift.
    api/client.ts         ShieldQuestApi interface + MockApiClient (with
                          simulated latency). HttpApiClient skeleton is sketched
                          in a comment — implement it and swap the export.
    api/mock-data.ts      Scenario, Guardian, player and portal fixtures.
    api/world-data.ts     The four districts and their mission nodes, including
                          unlock rules and planned content.
    api/board-data.ts     The roll-and-move track: 22 original board spaces, the
                          Situation Cards and the district badges. Checks in dev
                          that every space points at an activity that exists.
    api/rewards-data.ts   Shield Token award values and grant keys, the cosmetic
                          catalogue, the onboarding tokens and the achievements.
    api/learning-check-data.ts
                          Pre and post check questions. No option is marked
                          correct, and nothing is scored.
    api/minigame-data.ts  Mini-game content. The word-search grid is authored,
                          not generated, so the server and client renders match
                          and every word appears exactly once.
    state/PlayerProvider  Client mirror of server-authoritative player state
                          (coins, Trust, Risk, Resilience, Guardian progress).
    hooks/useScenarioRun  The scenario engine: load → commit choice → apply
                          immediate reward → schedule the delayed consequence.
    hooks/useWorld        Resolves the districts against the player's own
                          completions to derive unlock state and progress.
    hooks/useBoard        Resolves the 22 track spaces the same way.
    hooks/useDiceTurn     One turn: roll, show the result, walk the token, land.
                          The board position is only committed on arrival.
    hooks/useShieldProgress
                          Everything Shield Central reports - counts and
                          milestones only, nothing sortable into a league table.
    demo/dice.ts          The die, and the console-only one-shot override.
    sound.ts              Two synthesised cues. No audio files ship.
  components/
    player/board/         The city track: trackGeometry (all board arithmetic),
                          CityTrack (the camera), SpaceMark, PlayerTokenMark,
                          DiceRoller, BoardMiniMap and SpaceSheet (the landing
                          sheet, the mission briefing and the checkpoints).
    player/               AppShell (app frame + bottom nav), districtSkin /
                          MissionNode (the district route), DistrictSheet and
                          CityInfoSheet (the board's bottom sheets), GuardianArt
                          / DistrictArt / MissionArt (the replaceable art slots),
                          Onboarding, ProgressWatcher (district and achievement
                          milestones), RewardTakeover, MissionComplete,
                          DistrictComplete, AchievementList, HubPage,
                          MissionRunner and its parts. Both player missions are
                          the same runner with a different id.
    minigames/            MiniGameShell (shared chrome + a one-time reward
                          pipeline), WordSearchGame, DecodeClueGame,
                          TransferQuestion.
    admin/                AdminChrome (sidebar, metric/insight/safeguard cards),
                          ScenarioTable, ScenarioFilters, ScenarioDetailPanel,
                          AdminNeedsAttention, AdminRecentContent,
                          AdminReviewQueue, SkillCoverage, FlashMissionPanel.
    ui/Modal.tsx          Shared dialog. `dismissible={false}` is used for the
                          consequence reveal so it must be acknowledged. On a
                          phone it lands as a bottom sheet, which is what the
                          board's district and About panels use.
    ui/ArtSlot.tsx        Renders registered artwork, or the CSS/icon
                          placeholder until there is any. See "Artwork" below.
  app/
    (player)/             Route group sharing the AppShell chrome and one
                          PlayerProvider, so state carries across the demo.
    admin/                Desktop portal.
```

Components only ever import `api` from `lib/api/client`. To go live:

1. Implement `HttpApiClient` against the same `ShieldQuestApi` interface.
2. Change the final export in `client.ts`.

Nothing else changes.

### Notes on the design

- **Choice buttons are colour-neutral by design.** Every option renders with an
  identical border until a decision is committed. If the safe option looked
  safe, the scenario would measure colour recognition rather than judgement.
- **Light interface, dark where it earns it.** Navy is reserved for the hero,
  mission bar, bottom navigation and the consequence takeover — the only fully
  dark screen in the app.
- **Analytics describe content, not youths.** The admin portal measures how well
  a scenario teaches. There is no crime prediction, no individual profiling and
  no participant ranking anywhere in the data model.
- **The delay is the mechanic.** The reward has to be banked and enjoyed before
  the cost arrives — punishing risky choices instantly would teach the opposite
  of how this works in real life.
- **The city board is a wrapper, not the product.** Every route out of it leads
  to a behavioural decision, a peer intervention, or a mini-game that hands the
  player back to one. Mini-games pay a fraction of a scenario decision, and each
  one ends by connecting its pattern to a scenario the player has played.
- **The dice moves you; your decisions decide what you learn.** The die controls
  one thing - how many spaces the token travels. It cannot make a choice safe,
  pay a Shield Token, strengthen a Guardian or decide that anybody won, and
  there is nothing to win. Randomness selects which situation you meet; the
  decision inside it is what the learning turns on.
- **Nothing is gated behind a roll.** Every district and every activity is also
  reachable directly from the board and from the district routes - which is what
  a facilitated workshop, a live demonstration and a screen-reader user all
  need. `shieldquestDemo.setDice(4)` forces one roll from the console, and
  appears nowhere in the youth interface. The few locked nodes still open through
  the player's own completions inside that same district, so a locked tile always
  states something actionable.
- **Shield Tokens are not money.** Coins are virtual cash *inside* a scenario and
  part of the lesson; Shield Tokens are participation credit spent only on
  cosmetics. They are kept apart deliberately, so a risky in-scenario payout can
  never buy anything. Every award is keyed and paid once, so replaying an
  activity or reloading cannot mint more, and nothing is ever awarded for a dice
  value, for speed, or for outperforming anyone.
- **Cosmetics are cosmetic.** No reward changes a scenario, an outcome, a
  Guardian's level, what content is available or how fast anything progresses,
  and there are no crates, draws or random outcomes anywhere.
- **Server-authoritative in production.** `submitChoice` returns the resolved
  outcome and the scheduled consequence; the client renders, it does not decide.

## Deploying to Vercel

Zero configuration — import the repository and deploy. Seventeen routes prerender
as static content; the two parameterised routes (`/district/[districtId]` and
`/mini-game/[gameId]`) are server-rendered on demand.

```bash
npm run typecheck
npm run build
```

## Accessibility

Verified in-browser at 375, 390, 430, 768, 1366 and 1440px: no horizontal page
scroll on any route (wide admin tables scroll inside their own container), WCAG
AA contrast met on every route and admin section — measured with proper alpha
compositing and `oklab()` parsing, since Tailwind v4 emits `oklab()` for opacity
modifiers — semantic landmarks and table headers, visible keyboard focus, and
`prefers-reduced-motion` honoured globally.

Interactive targets are ≥44px everywhere with one deliberate exception: the
word-search grid is eight columns, so each cell is **41.9px at 375px** (49px
from 430px up). That is the largest an eight-wide board allows on the narrowest
supported phone, it clears WCAG 2.5.8 comfortably, and the activity never
depends on precise tapping — a word can be selected by tapping its first and
last letter, by dragging, or entirely from the keyboard with the arrow keys and
Enter.

Status is never carried by colour alone. Found words are filled *and* ticked in
the word list *and* announced in a live region; locked nodes carry an icon and a
text reason; remaining attempts are printed as a number beside the meter. On the
board, a space's type is carried by its shape and its icon, and its state by an
overlay shape and a sentence in its accessible name.

Settings adds three preferences on top of the operating system's, never instead
of it: **Reduced motion** can only turn motion further down, **Larger text**
scales the scrolling content while leaving the 44px navigation targets where
they are, and **High contrast** redefines the design tokens themselves so every
surface, hairline and muted text colour moves at once.

## Artwork

Every illustrated element — Guardians, districts, the player token, mission-type
marks, mini-game badges — renders through one registry, `src/lib/brand/assets.ts`.
Each slot is `null` and shows a CSS or icon placeholder until a file is dropped
into `public/assets/` and named in that file; the artwork and the placeholder
render into the same box, so nothing moves when real art arrives. The drop-in
conventions are in `public/assets/README.md`.

No layout is built around the current placeholders.

## PWA

`public/manifest.webmanifest` is wired up with the original ShieldQuest mark, so
the app is installable to the home screen with a proper icon rather than a
screenshot:

    public/icon.svg           Browser tab icon and the manifest's "any" icon.
    public/icon-maskable.svg  Same mark inside the 80% safe zone, for Android's
                              adaptive-icon masks.
    src/app/apple-icon.tsx    180x180 PNG touch icon for iOS, rasterised from the
                              same artwork at build time by Next's built-in
                              `ImageResponse` — no image pipeline, no extra
                              dependency, nothing binary in the repository.

The artwork is drawn in-house from the existing design tokens (a civic shield
carrying one map-pin node) and deliberately has a single interior shape, so it
still reads at 16px. A service worker for offline scenario caching is
intentionally **not** included in the prototype.
