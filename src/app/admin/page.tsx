"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import {
  AdminSection as Section,
  AdminSidebar,
  DataSafeguardCard,
  InsightCard,
  PortalSummaryRow,
  SimulatedDataNote,
  type AdminSection as SectionId,
} from "@/components/admin/AdminChrome";
import { FlashMissionPanel } from "@/components/admin/FlashMissionPanel";
import {
  REVIEW_THRESHOLD,
  ScenarioTable,
} from "@/components/admin/ScenarioTable";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api/client";
import { clearDemoData } from "@/lib/state/demoStorage";
import { SAFEGUARDS } from "@/lib/api/mock-data";
import type {
  AdminScenarioRow,
  FlashMissionDraft,
  Insight,
  PortalSummary,
} from "@/lib/types";

/**
 * View 5 — Scenario Management Portal.
 *
 * A desktop-first console for reviewing how well prevention CONTENT is teaching
 * and updating it as risks evolve. Deliberately branded as a prototype admin
 * view: it is not, and must not appear to be, a deployed government system.
 */
export default function AdminPage() {
  const [section, setSection] = useState<SectionId>("overview");
  const [rows, setRows] = useState<AdminScenarioRow[]>([]);
  const [summary, setSummary] = useState<PortalSummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [deployed, setDeployed] = useState<AdminScenarioRow | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.listScenarios(),
      api.getPortalSummary(),
      api.getInsights(),
    ]).then(([r, s, i]) => {
      if (!active) return;
      setRows(r);
      setSummary(s);
      setInsights(i);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleDeploy = useCallback(async (draft: FlashMissionDraft) => {
    const created = await api.deployFlashMission(draft);
    setRows((prev) => [created, ...prev]);
    setSummary(await api.getPortalSummary());
    setDeployed(created);
    setPanelOpen(false);
    setSection("scenarios");
  }, []);

  /**
   * Demo-only. Clears the prototype's browser storage and reloads so player
   * stats, Guardian progress and deployed Flash Missions all return to the
   * fixture state. Built-in scenarios are never touched.
   */
  const handleResetDemo = useCallback(() => {
    clearDemoData();
    window.location.reload();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.title} ${r.category} ${r.targetGroup}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [rows, query],
  );

  const flashRows = filtered.filter((r) => r.isFlashMission);
  const reviewRows = rows.filter(
    (r) =>
      r.status === "LIVE" &&
      r.responses > 0 &&
      r.safeDecisionRate < REVIEW_THRESHOLD,
  );

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Top bar */}
      <header className="border-b border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3 lg:hidden">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900"
            >
              <Shield className="h-4 w-4 text-amber-400" />
            </span>
            <p className="text-[13px] font-extrabold text-navy-900">
              Project SHIELD
            </p>
          </div>

          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
            Prototype admin view · demonstration environment · simulated data
          </span>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-semibold text-ink-muted transition hover:border-civic-200 hover:text-civic-700"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Youth app
            </Link>
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-navy-100 text-[12px] font-bold text-navy-800"
            >
              DO
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <AdminSidebar
          active={section}
          onSelect={setSection}
          reviewCount={reviewRows.length}
        />

        <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">
          {/* Page heading */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-civic-700">
                Project SHIELD
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900">
                Scenario Management Portal
              </h1>
              <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
                Review youth learning trends and update prevention content
                without rebuilding the application.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-civic-600 px-5 text-[14px] font-bold text-white shadow-sm transition hover:bg-civic-700"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              Deploy Flash Mission
            </button>
          </div>

          {deployed && (
            <div
              role="status"
              className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-leaf-200 bg-leaf-50 px-4 py-3"
            >
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-leaf-700"
                aria-hidden="true"
              />
              <p className="text-[14px] text-leaf-700">
                <span className="font-extrabold uppercase tracking-wide">
                  Flash Mission live
                </span>{" "}
                — <span className="font-semibold">{deployed.title}</span> is now
                available to the {deployed.targetGroup} cohort.
              </p>
              <button
                type="button"
                onClick={() => setDeployed(null)}
                className="ml-auto inline-flex min-h-[44px] items-center px-2 text-[13px] font-semibold text-leaf-700 underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading || !summary ? (
            <div className="mt-8 grid place-items-center rounded-xl border border-line bg-surface py-24">
              <Loader2
                className="h-6 w-6 animate-spin text-civic-600"
                aria-label="Loading portal data"
              />
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {section === "overview" && (
                <>
                  <Section
                    title="Overview"
                    description="Aggregate performance of published prevention content."
                  >
                    <PortalSummaryRow summary={summary} />
                    <SimulatedDataNote />
                  </Section>

                  <Section
                    title="Insights"
                    description="Which topics are landing, and which need more teaching support."
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {insights.map((i) => (
                        <InsightCard key={i.id} insight={i} />
                      ))}
                    </div>
                    <SimulatedDataNote>
                      Aggregated prototype data. Individual participant
                      performance is not displayed.
                    </SimulatedDataNote>
                  </Section>

                  <Section title="Data &amp; safeguards">
                    <DataSafeguardCard
                      items={SAFEGUARDS}
                      onResetDemo={handleResetDemo}
                    />
                  </Section>
                </>
              )}

              {section === "scenarios" && (
                <Section
                  title="Scenarios"
                  description="All published, drafted and scheduled content."
                  action={<SearchBox value={query} onChange={setQuery} count={filtered.length} total={rows.length} />}
                >
                  <ScenarioTable
                    rows={filtered}
                    highlightId={deployed?.id}
                    caption="All scenarios with target group, status and safe decision rate"
                  />
                  <SimulatedDataNote />
                </Section>
              )}

              {section === "flash" && (
                <Section
                  title="Flash Missions"
                  description="Rapid-response content published against an emerging trend."
                  action={<SearchBox value={query} onChange={setQuery} count={flashRows.length} total={rows.filter((r) => r.isFlashMission).length} />}
                >
                  <ScenarioTable
                    rows={flashRows}
                    highlightId={deployed?.id}
                    caption="Flash Missions currently deployed"
                  />
                  <SimulatedDataNote />
                </Section>
              )}

              {section === "insights" && (
                <>
                  <Section
                    title="Insights"
                    description="Aggregate learning signals across all cohorts."
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {insights.map((i) => (
                        <InsightCard key={i.id} insight={i} />
                      ))}
                    </div>
                    <SimulatedDataNote>
                      Aggregated prototype data. Individual participant
                      performance is not displayed.
                    </SimulatedDataNote>
                  </Section>
                  <Section title="Data &amp; safeguards">
                    <DataSafeguardCard
                      items={SAFEGUARDS}
                      onResetDemo={handleResetDemo}
                    />
                  </Section>
                </>
              )}

              {section === "review" && (
                <Section
                  title="Content review"
                  description={`Live scenarios where fewer than ${REVIEW_THRESHOLD}% of responses chose a safer option. This indicates the content needs stronger teaching support — it is not a measure of the participants.`}
                >
                  <ScenarioTable
                    rows={reviewRows}
                    caption="Scenarios recommended for authoring review"
                  />
                  <SimulatedDataNote />
                </Section>
              )}
            </div>
          )}

          <footer className="mt-10 border-t border-line pt-5">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              ShieldQuest is a concept prototype for Project SHIELD. It is not an
              official Singapore Police Force platform and carries no official
              endorsement. All figures shown are simulated.
            </p>
          </footer>
        </main>
      </div>

      <Modal
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        placement="right"
        className="bg-surface"
        labelledBy="flash-mission-title"
      >
        <FlashMissionPanel
          onDeploy={handleDeploy}
          onCancel={() => setPanelOpen(false)}
        />
      </Modal>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  count,
  total,
}: {
  value: string;
  onChange: (v: string) => void;
  count: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter scenarios"
          aria-label="Filter scenarios by title, category or target group"
          className="min-h-[44px] w-56 rounded-lg border border-line-strong bg-surface py-2 pl-9 pr-3 text-[14px] outline-none transition placeholder:text-ink-soft focus:border-civic-500"
        />
      </div>
      <span className="whitespace-nowrap text-[12px] text-ink-soft tabular-nums">
        {count} of {total}
      </span>
    </div>
  );
}
