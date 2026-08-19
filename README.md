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
| `/` | **ShieldQuest City** | The board-game-inspired district map that is now the front door and primary navigation. Four districts, a player marker, city progress. Vertical illustrated route on phones; a spread city board on tablet and up. |
| `/district/[id]` | **District route** | `district -> mission node -> activity -> learning outcome -> progress`. Each node shows its type, its S.H.I.E.L.D. skill, its Guardian and, when locked, exactly what opens it. |
| `/play` | **Scenario Encounter** | Player is the target of a money mule approach. Optional clue tagging, then three **visually neutral** choices. "Accept" pays **+300 Coins immediately**; **~3 seconds later** the Delayed Consequence takeover lands. |
| `/play` (after Accept) | **Delayed Consequence** | Full-screen "3 days later" takeover: What changed (immediate vs later), Why this mattered, Safer response. Not dismissible. |
| `/peer-shield` | **Peer Shield Mode** | Same threat, player is the bystander. "Warn them privately" awards **Community Resilience**; silence deducts it. Includes a sample intervention script. |
| `/mini-game/spot-the-warning-signs` | **Mini-game A - word search** | Find six risk words, each explained on discovery, then answer one transfer question tying the pattern back to the Easy Money scenario. |
| `/mini-game/decode-the-clue` | **Mini-game B - decode** | Word-guessing built around prevention vocabulary. Wrong guesses drain a **signal-strength meter**, never a hanging figure. |
| `/progress` | **City progress** | Personal record of what has been practised. No ranking, no cohort comparison, no peer visibility. |
| `/guardians` | **Guardian / Progress** | VeriFox, Beacon and Shieldfin — one prevention skill each, strengthened only by practising that skill. |
| `/admin` | **Scenario Management Portal** | Desktop console with four areas - Overview, Scenario Library, Content Review, Insights - and **Deploy Flash Mission** as a persistent header action. |

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
    api/world-data.ts     The ShieldQuest City board: districts and mission
                          nodes, including unlock rules and planned content.
    api/minigame-data.ts  Mini-game content. The word-search grid is authored,
                          not generated, so the server and client renders match
                          and every word appears exactly once.
    state/PlayerProvider  Client mirror of server-authoritative player state
                          (coins, Trust, Risk, Resilience, Guardian progress).
    hooks/useScenarioRun  The scenario engine: load → commit choice → apply
                          immediate reward → schedule the delayed consequence.
    hooks/useWorld        Resolves the city board against the player's own
                          completions to derive unlock state and progress.
  components/
    player/               AppShell (presentation canvas + bottom nav),
                          WorldMap / DistrictCard / MissionNode (the city board),
                          WorldProgress, MissionRunner and its parts. Both player
                          missions are the same runner with a different id.
    minigames/            MiniGameShell (shared chrome + a one-time reward
                          pipeline), WordSearchGame, DecodeClueGame,
                          TransferQuestion.
    admin/                AdminChrome (sidebar, metric/insight/safeguard cards),
                          ScenarioTable, ScenarioFilters, ScenarioDetailPanel,
                          AdminNeedsAttention, AdminRecentContent,
                          AdminReviewQueue, SkillCoverage, FlashMissionPanel.
    ui/Modal.tsx          Shared dialog. `dismissible={false}` is used for the
                          consequence reveal so it must be acknowledged.
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
- **Progression is chosen, never rolled.** There are no dice and no chance
  gates. Every district is open from the first second; the few locked nodes open
  through the player's own completions inside that same district, so a locked
  tile always states something actionable.
- **Server-authoritative in production.** `submitChoice` returns the resolved
  outcome and the scheduled consequence; the client renders, it does not decide.

## Deploying to Vercel

Zero configuration — import the repository and deploy. Seven routes prerender as
static content; the two parameterised routes (`/district/[districtId]` and
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
text reason; remaining attempts are printed as a number beside the meter.

## PWA

`public/manifest.webmanifest` and the icon are wired up, so the app is
installable to the home screen. A service worker for offline scenario caching is
intentionally **not** included in the prototype.
