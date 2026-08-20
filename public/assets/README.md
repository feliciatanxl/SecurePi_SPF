# ShieldQuest art assets

Drop-in location for the illustrated ShieldQuest set. This folder is empty by
design — the app ships with CSS and icon placeholders and swaps them for real
artwork the moment a file is registered.

## How to add artwork

1. Put the file in the folder below that matches its slot.
2. Open `src/lib/brand/assets.ts` and set that slot's value to the path,
   e.g. `[GUARDIAN_VERIFOX]: "/assets/guardians/verifox.svg"`.

That is the whole change. No component edits, and no layout shifts — every slot
renders into a fixed box that the placeholder already occupies.

## Folders and slots

    guardians/          VeriFox, Beacon, Shieldfin.
                        Square, drawn to the edges of the box. Replaces the
                        letter plate on Guardian cards, the Guardians selector
                        and the home HUD.

    districts/          School Street, Retail District, Digi-District,
                        Community Hub. Square. Replaces the lucide mark on city
                        board stops, district headers and the district sheet.

    mission-types/      Scenario, Mini-Game, Peer Shield, Guardian Challenge.
                        Square, monochrome-friendly — these sit on both light
                        and dark plates.

    mini-games/         Badges keyed by mini-game id.

    player-token.svg    The marker that travels the city route.

## Format notes

- SVG preferred; PNG is fine at 3x the rendered box (Guardians render at up to
  48px, board stops at 52px, so 144px / 156px covers every screen).
- Square aspect ratio for everything except the player token.
- Transparent background. The plate colour behind each slot comes from the
  district or Guardian palette in the design tokens, so artwork should not
  carry its own background.
- Keep the subject inside the middle ~85% — plates are rounded and a couple of
  the slots are circular.
- Artwork is decorative: the accessible name is always supplied by the
  surrounding component, never by the file.

## App icon

The browser tab and PWA icons are **not** in this folder — they are
`public/icon.svg`, `public/icon-maskable.svg` and `src/app/apple-icon.tsx`.
Replacing the ShieldQuest mark means editing those three so the tab icon, the
maskable icon and the iOS touch icon stay in step.
