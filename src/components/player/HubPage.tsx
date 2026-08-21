import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Shared chrome for the Shield Central pages.
 *
 * One compact bar — where you are, what it is, and the way back — so seven
 * secondary screens can exist without any of them needing a bottom-navigation
 * tab of its own. The bottom navigation stays at four: City, Peer Shield,
 * Progress, Guardians.
 */
export function HubPage({
  eyebrow,
  title,
  intro,
  backHref = "/shield-central",
  backLabel = "Back to Shield Central",
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  backHref?: string;
  backLabel?: string;
  /** Optional trailing element in the header, e.g. a balance. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 bg-navy-900 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-2">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              {eyebrow}
            </p>
            <h1 className="truncate text-[19px] font-extrabold uppercase leading-tight tracking-tight">
              {title}
            </h1>
          </div>
          {action}
        </div>
        {intro && (
          <p className="mt-1.5 px-1 text-[12.5px] leading-snug text-navy-100">
            {intro}
          </p>
        )}
      </header>

      <div className="space-y-3.5 px-4 pt-3.5">{children}</div>
    </div>
  );
}

/** Small uppercase heading used inside the hub pages. */
export function HubSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {title}
      </h2>
      {note && (
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{note}</p>
      )}
      <div className="mt-2">{children}</div>
    </section>
  );
}
