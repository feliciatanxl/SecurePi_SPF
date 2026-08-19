"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, Gamepad2, Shield, ShieldCheck, Users } from "lucide-react";
import { usePlayer } from "@/lib/state/PlayerProvider";

const TABS = [
  { href: "/play", label: "Encounter", icon: Gamepad2 },
  { href: "/peer-shield", label: "Peer Shield", icon: Users },
] as const;

/**
 * Mobile-first app chrome. On phones this is the full viewport; on desktop it
 * renders inside a device frame so the pitch audience sees it as an app.
 */
export function PhoneShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = usePlayer();

  return (
    <div className="flex min-h-dvh flex-col items-center bg-ink-950 md:justify-center md:bg-[radial-gradient(ellipse_at_top,#16213a_0%,#05080f_60%)] md:py-10">
      <div className="flex min-h-dvh w-full flex-col overflow-hidden bg-ink-900 md:h-[860px] md:min-h-0 md:w-[420px] md:rounded-[2.5rem] md:border-[10px] md:border-ink-800 md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* Status / HUD */}
        <header className="flex items-center justify-between gap-3 border-b border-white/5 bg-ink-850 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-shield-600/20 ring-1 ring-shield-500/40">
              <Shield className="h-4 w-4 text-shield-400" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Shield<span className="text-shield-400">Quest</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-300 ring-1 ring-gold-400/25 tabular-nums">
              <Coins className="h-3.5 w-3.5" />
              {profile.coins.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-safe-500/10 px-2.5 py-1 text-xs font-semibold text-safe-400 ring-1 ring-safe-500/25 tabular-nums">
              <ShieldCheck className="h-3.5 w-3.5" />
              {profile.resiliencePoints}
            </span>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="thin-scroll flex-1 overflow-y-auto">{children}</main>

        {/* Bottom tab bar */}
        <nav className="flex border-t border-white/5 bg-ink-850 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                  active
                    ? "text-shield-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <p className="hidden pt-5 text-xs text-slate-600 md:block">
        Prototype · mock data · {" "}
        <Link href="/admin" className="text-slate-400 underline underline-offset-4 hover:text-shield-400">
          open the SPF admin portal
        </Link>
      </p>
    </div>
  );
}
