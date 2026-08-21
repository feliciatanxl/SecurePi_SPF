import { AppShell } from "@/components/player/AppShell";
import { Onboarding } from "@/components/player/Onboarding";
import { ProgressWatcher } from "@/components/player/ProgressWatcher";
import { PlayerProvider } from "@/lib/state/PlayerProvider";

/**
 * One provider wraps every player route, so coins, Trust, Risk, Community
 * Resilience, Guardian progress, the board position, Shield Tokens and
 * unlocked cosmetics all carry across City → Mission → Peer Shield →
 * Guardians → Shield Central during a demo.
 *
 * `Onboarding` and `ProgressWatcher` sit alongside the shell rather than inside
 * a page: first-run onboarding has to be unavoidable from any entry point, and
 * a district milestone can be crossed by finishing a mini-game, a scenario or a
 * Peer Shield run, so no single page is the right place to notice it.
 */
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <AppShell>{children}</AppShell>
      <ProgressWatcher />
      <Onboarding />
    </PlayerProvider>
  );
}
