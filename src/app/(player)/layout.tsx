import { PhoneShell } from "@/components/player/PhoneShell";
import { PlayerProvider } from "@/lib/state/PlayerProvider";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <PhoneShell>{children}</PhoneShell>
    </PlayerProvider>
  );
}
