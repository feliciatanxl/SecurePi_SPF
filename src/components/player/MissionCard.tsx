import Link from "next/link";
import { ArrowRight, Clock, Gauge, Lock } from "lucide-react";
import { COMPETENCY_LABEL, COMPETENCY_LETTER, type MissionSummary } from "@/lib/types";

function MissionMeta({ mission }: { mission: MissionSummary }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
      <div className="flex items-center gap-1.5">
        <Gauge className="h-3.5 w-3.5 text-ink-soft" aria-hidden="true" />
        <dt className="sr-only">Difficulty</dt>
        <dd className="font-semibold text-ink-muted">{mission.difficulty}</dd>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-ink-soft" aria-hidden="true" />
        <dt className="sr-only">Estimated time</dt>
        <dd className="font-semibold text-ink-muted">
          {mission.estimatedMinutes} min
        </dd>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[11px] font-extrabold text-white"
        >
          {COMPETENCY_LETTER[mission.primaryCompetency]}
        </span>
        <dt className="sr-only">Skill</dt>
        <dd className="font-semibold text-ink-muted">
          {COMPETENCY_LABEL[mission.primaryCompetency]}
        </dd>
      </div>
    </dl>
  );
}

/** The headline card on Mission Home. */
export function TodaysMissionCard({ mission }: { mission: MissionSummary }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-navy-900 bg-surface">
      <div className="bg-navy-900 px-4 py-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400">
          Today&rsquo;s mission
        </p>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-civic-700">
          {mission.category}
        </p>
        <h3 className="mt-1 text-xl font-extrabold tracking-tight text-navy-900">
          {mission.title}
        </h3>

        <div className="mt-3">
          <MissionMeta mission={mission} />
        </div>

        <Link
          href="/play"
          className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 text-[17px] font-extrabold tracking-tight text-white shadow-[0_8px_22px_-10px_rgba(26,102,188,0.95)] transition hover:bg-civic-700"
        >
          Start mission
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

/** Secondary scenario teasers. Locked ones are clearly non-interactive. */
export function MissionCard({ mission }: { mission: MissionSummary }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {mission.category}
          </p>
          <h3 className="mt-0.5 text-[15px] font-bold text-navy-900">
            {mission.title}
          </h3>
        </div>
        {mission.locked ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line bg-surface-sunk px-2 py-1 text-[11px] font-bold text-ink-soft">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Locked
          </span>
        ) : (
          <ArrowRight
            className="h-4 w-4 shrink-0 text-civic-600"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-2.5">
        <MissionMeta mission={mission} />
      </div>

      {mission.locked && mission.lockedNote && (
        <p className="mt-2 text-[12px] font-medium text-ink-soft">
          {mission.lockedNote}
        </p>
      )}
    </>
  );

  if (mission.locked) {
    return (
      <article
        aria-disabled="true"
        className="rounded-2xl border border-line bg-surface-sunk p-4 opacity-90"
      >
        {body}
      </article>
    );
  }

  return (
    <Link
      href="/play"
      className="block rounded-2xl border border-line bg-surface p-4 transition hover:border-civic-500 hover:bg-civic-50"
    >
      {body}
    </Link>
  );
}
