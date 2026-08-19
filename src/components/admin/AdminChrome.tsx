"use client";

import {
  BarChart3,
  ClipboardCheck,
  LayoutDashboard,
  ListChecks,
  Lock,
  Shield,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Insight, PortalSummary } from "@/lib/types";

export type AdminSection =
  | "overview"
  | "scenarios"
  | "flash"
  | "insights"
  | "review";

export const ADMIN_NAV: {
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "scenarios", label: "Scenarios", icon: ListChecks },
  { id: "flash", label: "Flash Missions", icon: Zap },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "review", label: "Content Review", icon: ClipboardCheck },
];

export function AdminSidebar({
  active,
  onSelect,
  reviewCount,
}: {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
  reviewCount: number;
}) {
  return (
    <aside className="shrink-0 border-b border-line bg-surface lg:w-60 lg:border-b-0 lg:border-r">
      <div className="hidden items-center gap-2.5 px-5 py-5 lg:flex">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900"
        >
          <Shield className="h-4.5 w-4.5 text-amber-400" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-civic-700">
            Project SHIELD
          </p>
          <p className="text-[13px] font-extrabold text-navy-900">
            Prototype Admin View
          </p>
        </div>
      </div>

      <nav aria-label="Portal sections" className="px-3 py-3 lg:py-0">
        <ul className="flex gap-1.5 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
          {ADMIN_NAV.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <li key={id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-[44px] w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[14px] font-semibold transition ${
                    isActive
                      ? "bg-civic-50 text-civic-700 ring-1 ring-civic-200"
                      : "text-ink-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                  {id === "review" && reviewCount > 0 && (
                    <span className="ml-auto rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 tabular-nums">
                      {reviewCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden px-5 pb-5 pt-6 lg:block">
        <DataSafeguardCard compact />
      </div>
    </aside>
  );
}

/** Overview stat tile. */
export function MetricCard({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  note: string;
  tone?: "neutral" | "attention";
}) {
  return (
    <div
      className={`rounded-xl border bg-surface p-4 ${
        tone === "attention" ? "border-amber-200" : "border-line"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-navy-900 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-ink-muted">{note}</p>
    </div>
  );
}

const INSIGHT_TONE: Record<Insight["kind"], string> = {
  SUPPORT: "border-amber-200 bg-amber-50 text-amber-700",
  IMPROVED: "border-leaf-200 bg-leaf-50 text-leaf-700",
  PEER_SHIELD: "border-teal-200 bg-teal-50 text-teal-700",
};

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <span
        className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${INSIGHT_TONE[insight.kind]}`}
      >
        {insight.label}
      </span>
      <p className="mt-2.5 text-[15px] font-bold text-navy-900">
        {insight.subject}
      </p>
      <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-navy-900 tabular-nums">
        {insight.value}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
        {insight.note}
      </p>
    </article>
  );
}

export function DataSafeguardCard({
  items,
  compact = false,
}: {
  items?: string[];
  compact?: boolean;
}) {
  const list = items ?? [
    "Aggregate learning analytics",
    "No crime prediction",
    "No individual youth profiling",
    "No real banking or Singpass credentials",
    "Simulated scenario data",
  ];

  return (
    <section
      aria-labelledby="safeguards"
      className="rounded-xl border border-line bg-surface-sunk p-4"
    >
      <h2
        id="safeguards"
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy-900"
      >
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        Privacy by design
      </h2>
      <ul className={`mt-2.5 space-y-1.5 ${compact ? "" : "sm:columns-2"}`}>
        {list.map((item) => (
          <li
            key={item}
            className="flex items-start gap-1.5 text-[12px] leading-snug text-ink-muted"
          >
            <span
              aria-hidden="true"
              className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Consistent section framing inside the portal body. */
export function AdminSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-navy-900">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Shown wherever numbers appear, so simulated data is never mistaken for real. */
export function SimulatedDataNote({ children }: { children?: ReactNode }) {
  return (
    <p className="text-[12px] leading-relaxed text-ink-soft">
      {children ?? (
        <>
          Prototype / simulated data. Aggregated only — individual participant
          performance is not displayed.
        </>
      )}
    </p>
  );
}

export function PortalSummaryRow({ summary }: { summary: PortalSummary }) {
  return (
    <div>
      <p className="mb-2.5 inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Simulated prototype data
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard
        label="Active scenarios"
        value={summary.activeScenarios}
        note="Published to at least one cohort"
      />
      <MetricCard
        label="Participants"
        value={summary.participants.toLocaleString()}
        note="Distinct youths in the demonstration cohort"
      />
      <MetricCard
        label="Avg. safe decision rate"
        value={`${summary.averageSafeDecisionRate}%`}
        note="Across all live scored content"
      />
      <MetricCard
        label="Needs review"
        value={summary.needsReview}
        note="Scenarios below the 60% teaching threshold"
        tone={summary.needsReview > 0 ? "attention" : "neutral"}
      />
      </div>
    </div>
  );
}
