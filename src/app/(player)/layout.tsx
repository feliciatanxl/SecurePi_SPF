import { AppShell } from "@/components/player/AppShell";
import { PlayerProvider } from "@/lib/state/PlayerProvider";

/**
 * One provider wraps every player route, so coins, Trust, Risk, Community
 * Resilience and Guardian progress carry across Home → Mission → Peer Shield
 * → Guardians during a demo.
 */
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <AppShell>{children}</AppShell>
    </PlayerProvider>
  );
}
