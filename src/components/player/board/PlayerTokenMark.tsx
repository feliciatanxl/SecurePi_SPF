import { PlayerAvatarMark } from "@/components/player/PlayerAvatar";
import { DEFAULT_PLAYER_TOKEN } from "@/lib/api/rewards-data";

/**
 * The marker that travels the city track.
 *
 * It shows the Explorer the player chose during onboarding, reduced to the
 * helmet: the full figure is a smudge at this size, and the helmet still
 * carries the colour and the crest that tell the four apart. The full artwork
 * stays in onboarding and token selection, where there is room for it.
 *
 * `className` carries an equipped City Style cosmetic, which recolours the
 * capsule and nothing else — a cosmetic never changes where the token can go or
 * how far it moves, and neither does the chosen Explorer.
 */
export function PlayerTokenMark({
  tokenId = DEFAULT_PLAYER_TOKEN,
  className = "",
  showLabel = true,
}: {
  tokenId?: string;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span
        className={`animate-arrive player-token-halo flex items-center gap-1 rounded-full border-2 border-amber-400 bg-navy-950 px-2 py-1 shadow-[0_8px_22px_-5px_rgba(6,21,39,0.95)] ${className}`}
      >
        <PlayerAvatarMark tokenId={tokenId} className="h-6 w-6 shrink-0" />
        {showLabel && (
          <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
            You
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className="h-2 w-2 rotate-45 border-b-2 border-r-2 border-amber-400 bg-navy-950"
      />
    </span>
  );
}
