"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, ShieldHalf, SlidersHorizontal } from "lucide-react";
import { COMPETENCY_LABEL, COMPETENCY_LETTER, type Competency } from "@/lib/types";
import { PROTOTYPE_DISCLAIMER } from "@/lib/api/mock-data";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/peer-shield", label: "Peer Shield", icon: ShieldHalf },
  { href: "/guardians", label: "Guardians", icon: Compass },
] as const;

const FRAMEWORK: Competency[] = [
  "SPOT",
  "HOLD",
  "IDENTIFY",
  "EVALUATE",
  "LEAD",
  "DEFEND",
];

/**
 * Presentation canvas for the youth app.
 *
 * Mobile-first: on a phone this is simply the viewport. On a laptop the app
 * column is centred at phone width on a calm neutral canvas — no oversized
 * device bezel — with a context rail on very wide screens that gives a pitch
 * audience the framing they need without cluttering the product itself.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The mission runs full-bleed: its own top bar replaces the tab navigation.
  const immersive = pathname === "/play";

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1180px] items-stretch justify-center gap-10 px-0 xl:h-dvh xl:min-h-0 xl:px-8 xl:py-8">
        <ContextRail />

        <div className="relative flex w-full max-w-[440px] flex-col overflow-hidden bg-surface shadow-[0_1px_2px_rgba(11,37,69,0.06),0_16px_40px_-24px_rgba(11,37,69,0.35)] xl:rounded-3xl xl:border xl:border-line">
          <main
            id="main"
            className="thin-scroll flex-1 overflow-y-auto xl:rounded-t-3xl"
          >
            {children}
          </main>

          {!immersive && (
            <nav
              aria-label="Primary"
              className="sticky bottom-0 z-20 border-t border-navy-800 bg-navy-900 pb-[max(0.25rem,env(safe-area-inset-bottom))] xl:rounded-b-3xl"
            >
              <ul className="flex">
                {TABS.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <li key={href} className="flex-1">
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-[52px] flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold transition ${
                          active
                            ? "text-amber-400"
                            : "text-navy-100/70 hover:text-white"
                        }`}
                      >
                        <Icon
                          className="h-5 w-5"
                          strokeWidth={active ? 2.4 : 1.8}
                          aria-hidden="true"
                        />
                        {label}
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 h-0.5 w-6 rounded-full ${
                            active ? "bg-amber-400" : "bg-transparent"
                          }`}
                        />
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
    <aside className="thin-scroll hidden w-[320px] shrink-0 flex-col justify-between overflow-y-auto py-4 xl:flex">
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

        <div className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            The S.H.I.E.L.D. framework
          </p>
          <ul className="mt-3 space-y-1.5">
            {FRAMEWORK.map((c) => (
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
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-semibold text-ink-muted transition hover:border-civic-200 hover:text-civic-700"
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
