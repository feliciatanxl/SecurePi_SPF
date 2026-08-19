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
| `/` | **Mission Home** | The product front door: hero, player overview (Guardian, Community Resilience, missions, streak) and Today's Mission. |
| `/play` | **Scenario Encounter** | Player is the target of a money mule approach. Optional clue tagging, then three **visually neutral** choices. "Accept" pays **+300 Coins immediately**; **~3 seconds later** the Delayed Consequence takeover lands. |
| `/play` (after Accept) | **Delayed Consequence** | Full-screen "3 days later" takeover: What changed (immediate vs later), Why this mattered, Safer response. Not dismissible. |
| `/peer-shield` | **Peer Shield Mode** | Same threat, player is the bystander. "Warn them privately" awards **Community Resilience**; silence deducts it. Includes a sample intervention script. |
| `/guardians` | **Guardian / Progress** | VeriFox, Beacon and Shieldfin — one prevention skill each, strengthened only by practising that skill. |
| `/admin` | **Scenario Management Portal** | Desktop console: overview stats, insights, content-review queue, scenario table, and a no-code **Deploy Flash Mission** side panel. |

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
    api/mock-data.ts      All fixtures. The only file with hardcoded content.
    state/PlayerProvider  Client mirror of server-authoritative player state
                          (coins, Trust, Risk, Resilience, Guardian progress).
    hooks/useScenarioRun  The scenario engine: load → commit choice → apply
                          immediate reward → schedule the delayed consequence.
  components/
    player/               AppShell (presentation canvas + bottom nav),
                          MissionRunner and its parts. Both player missions are
                          the same runner with a different scenario id.
    admin/                AdminChrome (sidebar, metric/insight/safeguard cards),
                          ScenarioTable, FlashMissionPanel.
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
- **Server-authoritative in production.** `submitChoice` returns the resolved
  outcome and the scheduled consequence; the client renders, it does not decide.

## Deploying to Vercel

Zero configuration — import the repository and deploy. It builds as a fully
static export of six prerendered routes.

```bash
npm run build
```

## Accessibility

Verified in-browser at 375px and 1366px: no horizontal page scroll on any route,
all interactive targets ≥44px, WCAG AA contrast met on every route and admin
section (lowest measured ratio 4.84:1), semantic landmarks and table headers,
visible keyboard focus, and `prefers-reduced-motion` honoured globally.

## PWA

`public/manifest.webmanifest` and the icon are wired up, so the app is
installable to the home screen. A service worker for offline scenario caching is
intentionally **not** included in the prototype.
