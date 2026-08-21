"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Map,
  ShieldHalf,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { COMPETENCY_LABEL, COMPETENCY_LETTER, COMPETENCY_ORDER } from "@/lib/types";
import { PROTOTYPE_DISCLAIMER } from "@/lib/api/mock-data";

const TABS = [
  { href: "/", label: "City", icon: Map },
  { href: "/peer-shield", label: "Peer Shield", icon: ShieldHalf },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/guardians", label: "Guardians", icon: Compass },
] as const;

/** Routes that run full-bleed — their own top bar replaces the tab navigation. */
const isImmersive = (pathname: string) =>
  pathname === "/play" || pathname.startsWith("/mini-game/");

/**
 * The city board and the district routes get a wider frame on tablet and up,
 * and wider again on a laptop: the board camera then shows more of the city
 * route at once — around six spaces on a phone, twelve on a tablet, fifteen on
 * a laptop — without any of them being a different board.
 *
 * A scenario stays at phone width on every screen. A message thread arriving on
 * your phone is the situation being rehearsed, and widening it would weaken that.
 */
const isBoard = (pathname: string) =>
  pathname === "/" ||
  pathname === "/progress" ||
  pathname.startsWith("/district/") ||
  pathname.startsWith("/shield-central");

/**
 * Presentation canvas for the youth app.
 *
 * Mobile-first: on a phone this is simply the viewport. On a laptop the app
 * column is centred on a calm neutral canvas — no oversized device bezel — with
 * a context rail on very wide screens that gives a pitch audience the framing
 * they need without cluttering the product itself.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersive(pathname);
  const board = isBoard(pathname);

  return (
    /*
     * A real app frame rather than a document: the shell owns the viewport
     * height and `main` is the only thing that scrolls. That is what lets the
     * city board size itself to whatever is left after the HUD and the tab bar,
     * and it keeps the tab bar planted instead of riding up on a long page.
     */
    <div className="h-dvh overflow-hidden bg-canvas">
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-stretch justify-center gap-10 px-0 xl:px-8 xl:py-8">
        <ContextRail />

        <div
          className={`relative flex h-full w-full flex-col overflow-hidden bg-surface shadow-[0_1px_2px_rgba(11,37,69,0.06),0_16px_40px_-24px_rgba(11,37,69,0.35)] transition-[max-width] duration-300 xl:rounded-3xl xl:border xl:border-line ${
            board
              ? "max-w-[440px] md:max-w-[720px] xl:max-w-[880px]"
              : "max-w-[440px]"
          }`}
        >
          {/*
            `text-scale` is the hook the Settings "Text size" control uses. It
            scales the scrolling content and leaves the tab bar alone, so the
            44px navigation targets stay exactly where a player expects them.
          */}
          <main
            id="main"
            className="thin-scroll text-scale min-h-0 flex-1 overflow-y-auto overscroll-contain xl:rounded-t-3xl"
          >
            {children}
          </main>

          {!immersive && (
            <nav
              aria-label="Primary"
              className="shrink-0 border-t border-navy-800 bg-navy-900 pb-[max(0.25rem,env(safe-area-inset-bottom))] xl:rounded-b-3xl"
            >
              <ul className="flex">
                {TABS.map(({ href, label, icon: Icon }) => {
                  // "City" stays lit while the player is inside a district.
                  const active =
                    href === "/"
                      ? pathname === "/" || pathname.startsWith("/district/")
                      : pathname === href;
                  return (
                    <li key={href} className="flex-1">
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold transition ${
                          active
                            ? "text-amber-400"
                            : "text-navy-100/70 hover:text-white"
                        }`}
                      >
                        {/* Active marker sits above the label rather than
                            adding a row, so the bar stays compact. */}
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-1/2 top-0 h-0.5 w-7 -translate-x-1/2 rounded-full ${
                            active ? "bg-amber-400" : "bg-transparent"
                          }`}
                        />
                        <Icon
                          className="h-5 w-5"
                          strokeWidth={active ? 2.4 : 1.8}
                          aria-hidden="true"
                        />
                        <span className="text-center leading-tight">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

/** Pitch-time framing. Hidden below xl so the product stands on its own. */
function ContextRail() {
  return (
    <aside className="thin-scroll hidden w-[300px] shrink-0 flex-col justify-between overflow-y-auto py-4 xl:flex">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-civic-700">
          Project SHIELD
        </p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-navy-900">
          Shield<span className="text-civic-600">Quest</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-ink-muted">
          Choose Right. Protect Together.
        </p>

        <p className="mt-6 text-sm leading-relaxed text-ink-muted">
          A youth civic-learning experience where crime prevention is practised
          as a decision, not delivered as a talk.
        </p>

        <div className="mt-6 rounded-xl border border-line bg-surface p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            How it is structured
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            District → mission node → activity → learning outcome → progress.
            The city board is the engagement layer; the scenario engine, delayed
            consequences and Peer Shield are the substance.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            The S.H.I.E.L.D. framework
          </p>
          <ul className="mt-3 space-y-1.5">
            {COMPETENCY_ORDER.map((c) => (
              <li key={c} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-navy-900 text-[11px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[c]}
                </span>
                <span className="text-[13px] font-medium text-ink">
                  {COMPETENCY_LABEL[c]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3 pt-8">
        <Link
          href="/admin"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-semibold text-ink-muted transition hover:border-civic-200 hover:text-civic-700"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Scenario Management Portal
        </Link>
        <p className="text-[11px] leading-relaxed text-ink-soft">
          {PROTOTYPE_DISCLAIMER}. Not an official Singapore Police Force system.
        </p>
      </div>
    </aside>
  );
}
