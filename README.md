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

## The three views

| Route | View | What it demonstrates |
| --- | --- | --- |
| `/play` | **Scenario Encounter** | Player is the target of a money mule approach. "Accept" pays **+300 Coins immediately**, then **3 seconds later** the Delayed Consequence modal reveals the frozen account and claws the coins back. |
| `/peer-shield` | **Peer Shield Mode** | Same threat, player is the bystander. "Warn them privately" scores highest and awards **Community Resilience Points**; silence deducts them. |
| `/admin` | **Scenario Management Portal** | Desktop console for SPF officers: live scenario table with Safe Decision Rate and week-on-week delta, plus a no-code **Deploy Flash Mission** form that publishes an emerging trend without a release. |

`/` is a landing page linking to all three.

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
    state/PlayerProvider  Client mirror of the server-authoritative wallet.
    hooks/useScenarioRun  The scenario engine: load → commit choice → apply
                          immediate reward → schedule the delayed consequence.
  components/
    player/               ScenarioRunner and its parts. Both player views are
                          the same runner with a different scenario id.
    admin/                ScenarioTable, FlashMissionForm.
    ui/Modal.tsx          Shared dialog. `dismissible={false}` is used for the
                          consequence reveal so it must be acknowledged.
  app/
    (player)/             Route group sharing the PhoneShell chrome.
    admin/                Desktop portal.
```

Components only ever import `api` from `lib/api/client`. To go live:

1. Implement `HttpApiClient` against the same `ShieldQuestApi` interface.
2. Change the final export in `client.ts`.

Nothing else changes.

### Notes on the design

- **Choice buttons are colour-neutral by design.** If the safe option looked
  safe, the scenario would measure colour recognition rather than judgement.
- **The delay is the mechanic.** The reward has to be banked and enjoyed before
  the cost arrives — punishing risky choices instantly would teach the opposite
  of how this works in real life.
- **Server-authoritative in production.** `submitChoice` returns the resolved
  outcome and the scheduled consequence; the client renders, it does not decide.

## Deploying to Vercel

Zero configuration — import the repository and deploy. It builds as a fully
static export of five prerendered routes.

```bash
npm run build
```

## PWA

`public/manifest.webmanifest` and the icon are wired up, so the app is
installable to the home screen. A service worker for offline scenario caching is
intentionally **not** included in the prototype.
