import { DEFAULT_PLAYER_TOKEN } from "@/lib/api/rewards-data";

/**
 * The ShieldQuest Explorers — the four player tokens.
 *
 * Four variations of one character family, drawn here as original geometric
 * SVG rather than shipped bitmaps: no image service, no CDN, no PNG pipeline
 * and nothing to license. They are cosmetic markers and nothing else — an
 * Explorer carries no ability, no bonus, no stat and no implication about the
 * person who picked it.
 *
 * They are deliberately not Guardians. VeriFox, Beacon Guardian and Shieldfin
 * stand for the S.H.I.E.L.D. competencies and are earned through practice; an
 * Explorer is simply the piece that travels the board. The Beacon Explorer in
 * particular is a blue signal figure and shares nothing with the amber
 * lighthouse of the Beacon Guardian.
 *
 * The whole head is a visored helmet. That is not a stylistic accident: it
 * means none of the four implies a gender, an ethnicity, an age or a school, so
 * a player is choosing a colour and a crest rather than a person to be.
 *
 * Every figure is built from the same parts — helmet, coloured crown, visor,
 * torso, chest plate — so all four read as one set at any size, and only the
 * palette, the chest emblem and the helmet crest change. Each crest is a
 * different shape, so the four stay distinguishable without colour.
 */

interface ExplorerSkin {
  /** Torso and emblem. */
  suit: string;
  /** Limbs and neck. */
  suitDark: string;
  /** Crest and visor glint — the pale accent. */
  trim: string;
  /** Chest plate. */
  glow: string;
}

const HELMET = "#eef1f6";
const VISOR = "#0b2545";

/**
 * Palettes are the existing ShieldQuest design tokens written as literals: an
 * SVG `fill` cannot take a Tailwind class, and a CSS variable here would tie
 * the artwork to a stylesheet the High Contrast theme rewrites.
 */
const SKIN: Record<string, ExplorerSkin> = {
  /* amber-500 / amber-700 / amber-200 / amber-50 */
  pt_shield: { suit: "#e0930f", suitDark: "#8f5906", trim: "#f8ddab", glow: "#fdf6e7" },
  /* civic-600 / civic-800 / civic-200 / civic-50 */
  pt_beacon: { suit: "#1a66bc", suitDark: "#0f4a8a", trim: "#bcd6f4", glow: "#eff5fd" },
  /* teal-600 / teal-700 / teal-200 / teal-50 */
  pt_wave: { suit: "#17786f", suitDark: "#12645c", trim: "#b4ddd7", glow: "#ecf7f5" },
  /* leaf-600 / leaf-700 / leaf-200 / leaf-50 */
  pt_leaf: { suit: "#2a835b", suitDark: "#1f6b4a", trim: "#b6dcc7", glow: "#eff7f2" },
};

const skinFor = (tokenId: string) =>
  SKIN[tokenId] ?? SKIN[DEFAULT_PLAYER_TOKEN] ?? SKIN.pt_shield;

/** The emblem on the chest plate, centred on (32, 42.5). */
function ChestEmblem({ tokenId, skin }: { tokenId: string; skin: ExplorerSkin }) {
  if (tokenId === "pt_beacon") {
    return (
      <>
        <circle cx="32" cy="42.5" r="2.4" fill={skin.suit} />
        <path
          d="M27.8 46.6a5.6 5.6 0 0 1 0-8.2M36.2 38.4a5.6 5.6 0 0 1 0 8.2"
          fill="none"
          stroke={skin.suit}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (tokenId === "pt_wave") {
    return (
      <path
        d="M27 40.2c1.7-1.5 3.6-1.5 5 0s3.3 1.5 5 0M27 43.4c1.7-1.5 3.6-1.5 5 0s3.3 1.5 5 0M27 46.6c1.7-1.5 3.6-1.5 5 0s3.3 1.5 5 0"
        fill="none"
        stroke={skin.suit}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    );
  }

  if (tokenId === "pt_leaf") {
    return (
      <>
        <path d="M32 37.4Q38.4 41.6 32 48.4 25.6 41.6 32 37.4Z" fill={skin.suit} />
        <path
          d="M32 39v7.6"
          stroke={skin.glow}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </>
    );
  }

  /* pt_shield, and the fallback for any unknown id. */
  return (
    <path
      d="M32 37.6l4.8 1.7v3.7c0 2.8-1.9 4.9-4.8 6-2.9-1.1-4.8-3.2-4.8-6v-3.7z"
      fill={skin.suit}
    />
  );
}

/** The crest above the helmet. A different shape per Explorer, not just colour. */
function HelmetCrest({ tokenId, skin }: { tokenId: string; skin: ExplorerSkin }) {
  if (tokenId === "pt_beacon") {
    return (
      <>
        <path
          d="M32 6.4V3.2"
          stroke={skin.suit}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="32" cy="2.4" r="1.9" fill={skin.trim} />
      </>
    );
  }

  if (tokenId === "pt_wave") {
    return (
      <path
        d="M25.6 6c2.1-2.4 4.2-2.4 6.4 0 2.2 2.4 4.3 2.4 6.4 0"
        fill="none"
        stroke={skin.trim}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    );
  }

  if (tokenId === "pt_leaf") {
    return (
      <>
        <path d="M32 6.6q-1-4.2-5.4-4.4Q26.9 6.4 32 6.6Z" fill={skin.trim} />
        <path d="M32 6.6q1-4.2 5.4-4.4Q37.1 6.4 32 6.6Z" fill={skin.trim} />
      </>
    );
  }

  return <path d="M32 2.4l4 3.8h-8z" fill={skin.trim} />;
}

/**
 * A full-figure Explorer, for token selection and onboarding.
 *
 * Decorative by default — the card around it owns the accessible name. Pass
 * `title` only where the figure is the sole carrier of that name.
 */
export function PlayerAvatar({
  tokenId,
  className = "h-16 w-16",
  title,
}: {
  tokenId: string;
  className?: string;
  title?: string;
}) {
  const skin = skinFor(tokenId);

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* Grounding shadow, so the figure stands rather than floats. */}
      <ellipse cx="32" cy="60.6" rx="15" ry="2.4" fill="#061527" opacity="0.16" />

      {/* Limbs, behind the torso. */}
      <rect x="13.6" y="34" width="5.6" height="13.6" rx="2.8" fill={skin.suitDark} />
      <rect x="44.8" y="34" width="5.6" height="13.6" rx="2.8" fill={skin.suitDark} />
      <rect x="25.4" y="51" width="5.6" height="8.6" rx="2.8" fill={skin.suitDark} />
      <rect x="33" y="51" width="5.6" height="8.6" rx="2.8" fill={skin.suitDark} />

      {/* Torso and chest plate. */}
      <path
        d="M32 31c-9 0-14.5 5.2-14.5 12.5V52h29v-8.5C46.5 36.2 41 31 32 31z"
        fill={skin.suit}
      />
      <path
        d="M25.5 36h13v8.4c0 3.4-2.9 6.2-6.5 6.2s-6.5-2.8-6.5-6.2z"
        fill={skin.glow}
      />
      <ChestEmblem tokenId={tokenId} skin={skin} />

      {/* Neck. */}
      <rect x="29" y="27.5" width="6" height="5.5" fill={skin.suitDark} />

      {/* Helmet: pale shell, coloured crown, dark visor. */}
      <path
        d="M32 6.4c-7.7 0-13.5 5.8-13.5 13v4.4c0 4.1 5.5 7.5 13.5 7.5s13.5-3.4 13.5-7.5v-4.4c0-7.2-5.8-13-13.5-13z"
        fill={HELMET}
      />
      <path
        d="M32 6.4c-7.2 0-12.9 5.2-13.4 11.8h26.8C44.9 11.6 39.2 6.4 32 6.4z"
        fill={skin.suit}
      />
      <rect x="20.6" y="16.4" width="22.8" height="9" rx="4.5" fill={VISOR} />
      <rect x="23.6" y="18.8" width="6" height="2.6" rx="1.3" fill={skin.trim} />

      <HelmetCrest tokenId={tokenId} skin={skin} />
    </svg>
  );
}

/**
 * The Explorer head alone — the form used on the city board.
 *
 * A full figure rendered at 24px is a smudge, so the board gets the helmet: the
 * silhouette, the crown colour and the crest, which is everything that tells
 * the four apart. The full artwork stays where there is room for it.
 */
export function PlayerAvatarMark({
  tokenId,
  className = "h-6 w-6",
}: {
  tokenId: string;
  className?: string;
}) {
  const skin = skinFor(tokenId);

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 4.5c-6.6 0-11.6 5-11.6 11.2v3.8c0 3.5 4.7 6.4 11.6 6.4s11.6-2.9 11.6-6.4v-3.8C27.6 9.5 22.6 4.5 16 4.5z"
        fill={HELMET}
      />
      <path
        d="M16 4.5c-6.2 0-11.1 4.5-11.5 10.2h23C27.1 9 22.2 4.5 16 4.5z"
        fill={skin.suit}
      />
      <rect x="6.2" y="13.4" width="19.6" height="7.8" rx="3.9" fill={VISOR} />
      <rect x="8.8" y="15.5" width="5.2" height="2.3" rx="1.15" fill={skin.trim} />

      {/* The crest, restated at this size so colour is not the only cue. */}
      {tokenId === "pt_beacon" && (
        <>
          <path
            d="M16 4.6V1.9"
            stroke={skin.suit}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <circle cx="16" cy="1.6" r="1.6" fill={skin.trim} />
        </>
      )}
      {tokenId === "pt_wave" && (
        <path
          d="M10.6 4.6c1.8-2.1 3.6-2.1 5.4 0 1.8 2.1 3.6 2.1 5.4 0"
          fill="none"
          stroke={skin.trim}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {tokenId === "pt_leaf" && (
        <>
          <path d="M16 5q-.9-3.6-4.8-3.8Q11.1 4.8 16 5Z" fill={skin.trim} />
          <path d="M16 5q.9-3.6 4.8-3.8Q20.9 4.8 16 5Z" fill={skin.trim} />
        </>
      )}
      {tokenId !== "pt_beacon" && tokenId !== "pt_wave" && tokenId !== "pt_leaf" && (
        <path d="M16 1.4l3.5 3.3h-7z" fill={skin.trim} />
      )}
    </svg>
  );
}
