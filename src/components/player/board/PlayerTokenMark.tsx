import { ShieldHalf } from "lucide-react";
import { ArtSlot } from "@/components/ui/ArtSlot";
import { PLAYER_TOKEN_ART } from "@/lib/brand/assets";

/**
 * The marker that travels the city track.
 *
 * The V2.2 token art fills the disc; the lucide shield is the placeholder the
 * slot falls back to. `className` carries an equipped City Style cosmetic,
 * which recolours the disc and nothing else — a cosmetic never changes where
 * the token can go or how far it moves.
 */
export function PlayerTokenMark({
  className = "",
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span
        className={`animate-arrive player-token-halo flex items-center gap-1 rounded-full border-2 border-amber-400 bg-navy-950 px-2 py-1 shadow-[0_8px_22px_-5px_rgba(6,21,39,0.95)] ${className}`}
      >
        <ArtSlot
          src={PLAYER_TOKEN_ART}
          className="h-6 w-6 shrink-0 object-contain"
        >
          <ShieldHalf
            className="h-5 w-5 shrink-0 text-amber-400"
            strokeWidth={2.8}
            aria-hidden="true"
          />
        </ArtSlot>
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
