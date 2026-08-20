# ShieldQuest art assets

Drop-in location for the illustrated ShieldQuest set. The app ships CSS and icon
placeholders for every illustrated element and swaps them for real artwork the
moment a file is registered, so waves of artwork can land without touching a
layout.

## How to add artwork

1. Put the file in the folder below that matches its slot.
2. Open `src/lib/brand/assets.ts` and set that slot's value to the path.

That is the whole change. No component edits, and no layout shifts — every slot
renders into a fixed box that the placeholder already occupies.

## What is here (V2.2 wave)

    shieldquest/guardians/       verifox-neutral.svg
                                 beacon-neutral.svg
                                 shieldfin-neutral.svg
                                 200×200. One neutral pose each. Wired to
                                 GUARDIAN_ART — Guardian cards, the Guardians
                                 selector and the home HUD.

    shieldquest/districts/       school-street.svg
                                 retail-district.svg
                                 digi-district.svg
                                 community-hub.svg
                                 800×300 landscape scenes, not square marks.
                                 Wired to DISTRICT_SCENE_ART and used by
                                 <DistrictScene> on the surfaces wide enough to
                                 read one. See "Districts" below.

    shieldquest/board/           player-token.svg   → PLAYER_TOKEN_ART
                                 node-current.svg
                                 node-completed.svg
                                 node-locked.svg
                                 node-minigame.svg
                                 checkpoint.svg
                                 Registered in BOARD_NODE_ART. Only the player
                                 token is rendered — see "Board nodes" below.

    shieldquest/brand/           shieldquest-icon.svg      (256)
                                 shieldquest-icon-512.svg  (512)
                                 The V2.2 mark. Not currently the app icon —
                                 see "App icon" below.

Source files exported from Figma Make carried JSX attribute names
(`strokeWidth`, `stopColor`, `strokeLinecap`, `strokeLinejoin`,
`strokeDasharray`). Those are not SVG attributes: a browser loading the file as
an image ignores them, which drops every stroke to 1px and renders every
gradient stop black. They were renamed to their SVG equivalents on the way in.
Anything added later must use `stroke-width`, `stop-color` and friends.

## Districts

The district illustrations are wide scenes, so they are used where width exists
and nowhere else:

- **`<DistrictScene>`** lays the scene in behind a header as a full-bleed wash.
  It is absolutely positioned, so it adds no height to the surface it backs.
  Used on the district sheet header and the district route band.
- **`<DistrictPlate>`** — the 36–52px squares on board stops, district headers
  and progress rows — deliberately keeps its lucide mark on the district's
  palette plate. A 46px square crop of an 800×300 scene is one unreadable
  fragment of one building; four coloured plates with four distinct marks is
  what actually tells four stops apart at that size.

`DISTRICT_ART` (the square slot) therefore stays null and stays open for square
district icons when they are drawn.

## Board nodes

Node status in this app is carried three ways at once — a plate in the status
palette, a lucide mark and a text label — and has to hold up at 12–36px, in
greyscale and on a projector. The V2.2 node marks are circular discs in their
own palette (teal, rose, slate), so rendering them would replace a state that
reads three ways with one that reads by colour alone, and would put teal on
nodes when teal already means Peer Shield. They are registered rather than
rendered, ready for the larger board treatment they were drawn for.

## Still placeholders

No file in the V2.2 export covers these, so they keep their CSS/lucide
placeholders and their slots stay null. Do not substitute other artwork:

- Guardian success poses, action poses and icon variants
- square district icon variants
- mission-type marks (`NODE_KIND_ART`) — scenario, mini-game, peer shield,
  guardian challenge
- mini-game badges (`MINI_GAME_BADGE_ART`)
- HUD icons, the "next" marker, route-straight and route-curve segments

## Format notes

- SVG preferred; PNG is fine at 3x the rendered box (Guardians render at up to
  48px, board stops at 52px, so 144px / 156px covers every screen).
- Square aspect ratio for everything except the player token and the district
  scenes.
- Transparent background. The plate colour behind each slot comes from the
  district or Guardian palette in the design tokens, so artwork should not
  carry its own background.
- Keep the subject inside the middle ~85% — plates are rounded and a couple of
  the slots are circular.
- Artwork is decorative: the accessible name is always supplied by the
  surrounding component, never by the file. Guardian names and skills, district
  names and node statuses are all real HTML text.

## App icon

The browser tab and PWA icons are **not** in this folder — they are
`public/icon.svg`, `public/icon-maskable.svg` and `src/app/apple-icon.tsx`.
Replacing the ShieldQuest mark means editing all three so the tab icon, the
maskable icon and the iOS touch icon stay in step.

Those three still carry the shipped navy/amber mark. The V2.2 export in
`shieldquest/brand/` was compared against them and **not** adopted, for three
reasons that are worth recording:

1. **Ground contrast.** The V2.2 mark is a bare shield with no ground, split
   into a lit half (`#3B82F6`) and a shadow half (`#1E3A8A`). On the navy ground
   the manifest's `theme_color` and `background_color` require (`#0b2545`) the
   shadow half lands at 1.49:1 — the shield loses its left side. The shipped
   amber shield is 7.97:1 on the same ground.
2. **Legibility at 16px.** The V2.2 interior is four shapes (white disc, two
   crosshair strokes, a check). The shipped mark is deliberately one interior
   shape so that it still resolves in a browser tab.
3. **Palette.** `#3B82F6` / `#1E3A8A` are outside the ShieldQuest token set that
   the rest of the app, the theme colour and the splash background are built on.

If the V2.2 mark is confirmed as the final app icon, adopting it means: porting
its geometry into `public/icon.svg`, the 0.72 safe-zone group in
`public/icon-maskable.svg` and the `MARK` constant in `src/app/apple-icon.tsx`;
deciding the ground colour; and updating `theme_color` / `background_color` in
`public/manifest.webmanifest` and the `themeColor` in `src/app/layout.tsx` to
match. Those five files are the whole change.
