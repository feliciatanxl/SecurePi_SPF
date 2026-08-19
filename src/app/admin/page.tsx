"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Loader2, Shield, Zap } from "lucide-react";
import {
  AdminSection as Section,
  AdminSidebar,
  DataSafeguardCard,
  InsightCard,
  PortalSummaryRow,
  SimulatedDataNote,
  type AdminSection as SectionId,
} from "@/components/admin/AdminChrome";
import { AdminNeedsAttention } from "@/components/admin/AdminNeedsAttention";
import { AdminRecentContent } from "@/components/admin/AdminRecentContent";
import { AdminReviewQueue } from "@/components/admin/AdminReviewQueue";
import { FlashMissionPanel } from "@/components/admin/FlashMissionPanel";
import { ScenarioDetailPanel } from "@/components/admin/ScenarioDetailPanel";
import {
  applyScenarioFilters,
  EMPTY_FILTERS,
  ScenarioFilters,
  type ScenarioFilterState,
} from "@/components/admin/ScenarioFilters";
import {
  REVIEW_THRESHOLD,
  ScenarioTable,
} from "@/components/admin/ScenarioTable";
import { SkillCoverageChart } from "@/components/admin/SkillCoverage";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api/client";
import { clearDemoData } from "@/lib/state/demoStorage";
import { SAFEGUARDS } from "@/lib/api/mock-data";
import type {
  AdminScenarioRow,
  FlashMissionDraft,
  Insight,
  PortalSummary,
  SkillCoverage,
} from "@/lib/types";

/**
 * View 5 — Scenario Management Portal.
 *
 * Four destinations, one persistent action. A programme administrator opens this
 * to answer three questions in order: what is happening, what needs attention,
 * and what can I do next — so Overview is arranged in exactly that order and
 * nothing else competes with it.
 *
 * Deliberately branded as a prototype admin view: it is not, and must not appear
 * to be, a deployed government system.
 */
export default function AdminPage() {
  const [section, setSection] = useState<SectionId>("overview");
  const [rows, setRows] = useState<AdminScenarioRow[]>([]);
  const [summary, setSummary] = useState<PortalSummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [coverage, setCoverage] = useState<SkillCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ScenarioFilterState>(EMPTY_FILTERS);
  const [flashOpen, setFlashOpen] = useState(false);
  const [detail, setDetail] = useState<AdminScenarioRow | null>(null);
  const [deployed, setDeployed] = useState<AdminScenarioRow | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.listScenarios(),
      api.getPortalSummary(),
      api.getInsights(),
      api.getSkillCoverage(),
    ]).then(([r, s, i, c]) => {
      if (!active) return;
      setRows(r);
      setSummary(s);
      setInsights(i);
      setCoverage(c);
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
    setFlashOpen(false);
    // Land the administrator where the new scenario now lives.
    setFilters(EMPTY_FILTERS);
    setSection("library");
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
    () => applyScenarioFilters(rows, filters),
    [rows, filters],
  );

  const categories = useMemo(
    () => [...new Set(rows.map((r) => r.category))].sort(),
    [rows],
  );
  const audiences = useMemo(
    () => [...new Set(rows.map((r) => r.targetGroup))].sort(),
    [rows],
  );

  /** Live, scored content that is not teaching clearly enough yet. */
  const reviewRows = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            r.status === "LIVE" &&
            r.responses > 0 &&
            r.safeDecisionRate < REVIEW_THRESHOLD,
        )
        .sort((a, b) => a.safeDecisionRate - b.safeDecisionRate),
    [rows],
  );

  const recentRows = useMemo(() => rows.slice(0, 5), [rows]);

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Top bar. The primary action lives here so it is reachable from
          every section without being a destination of its own. */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
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

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-semibold text-ink-muted transition hover:border-civic-200 hover:text-civic-700"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Youth app
            </Link>
            <button
              type="button"
              onClick={() => setFlashOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-civic-600 px-4 text-[14px] font-bold text-white shadow-sm transition hover:bg-civic-700"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              Deploy Flash Mission
            </button>
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
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-civic-700">
              Project SHIELD
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900">
              Scenario Management Portal
            </h1>
            <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
              Review how well prevention content is teaching, and update it as
              risks change — without rebuilding the application.
            </p>
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
                    title="What is happening"
                    description="Aggregate performance of published prevention content."
                  >
                    <PortalSummaryRow summary={summary} />
                  </Section>

                  <Section
                    title="Needs attention"
                    description={`Live scenarios teaching below the ${REVIEW_THRESHOLD}% threshold. This reflects the content, not the participants.`}
                  >
                    <AdminNeedsAttention
                      rows={reviewRows}
                      onOpenReview={() => setSection("review")}
                      onSelect={setDetail}
                    />
                  </Section>

                  <Section
                    title="Recent content"
                    description="The most recently added or updated scenarios."
                    action={
                      <button
                        type="button"
                        onClick={() => setSection("library")}
                        className="inline-flex min-h-[44px] items-center text-[13px] font-bold text-civic-700 underline underline-offset-2"
                      >
                        Open Scenario Library
                      </button>
                    }
                  >
                    <AdminRecentContent
                      rows={recentRows}
                      onSelect={setDetail}
                      highlightId={deployed?.id}
                    />
                    <SimulatedDataNote />
                  </Section>
                </>
              )}

              {section === "library" && (
                <Section
                  title="Scenario Library"
                  description="All published, drafted and scheduled prevention content."
                >
                  <ScenarioFilters
                    filters={filters}
                    onChange={setFilters}
                    categories={categories}
                    audiences={audiences}
                    shown={filtered.length}
                    total={rows.length}
                  />
                  <ScenarioTable
                    rows={filtered}
                    highlightId={deployed?.id}
                    onSelect={setDetail}
                    caption="All scenarios with category, audience, status and safe decision rate"
                  />
                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    <strong className="font-bold text-ink-muted">
                      Safe decision rate
                    </strong>{" "}
                    measures how clearly a scenario teaches — which topics need
                    more support. It is not a measure of the young people who
                    answered it. Prototype / simulated data, aggregated only.
                  </p>
                </Section>
              )}

              {section === "review" && (
                <Section
                  title="Content Review"
                  description="Scenarios that may require clearer teaching, updated content or further review."
                >
                  <AdminReviewQueue rows={reviewRows} onSelect={setDetail} />
                  <SimulatedDataNote>
                    Prototype / simulated data. Content analytics only — no
                    individual responses, participants or risk scores are shown
                    anywhere in this portal.
                  </SimulatedDataNote>
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
                  </Section>

                  <Section
                    title="S.H.I.E.L.D. skill coverage"
                    description="Which prevention skills the current content teaches well, and where more material is needed."
                  >
                    <SkillCoverageChart rows={coverage} />
                    <SimulatedDataNote>
                      Simulated prototype data. Aggregated across content —
                      individual participant performance is not displayed.
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
        open={flashOpen}
        onClose={() => setFlashOpen(false)}
        placement="right"
        className="bg-surface"
        labelledBy="flash-mission-title"
      >
        <FlashMissionPanel
          onDeploy={handleDeploy}
          onCancel={() => setFlashOpen(false)}
        />
      </Modal>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        placement="right"
        className="bg-surface"
        labelledBy="scenario-detail-title"
      >
        {detail && (
          <ScenarioDetailPanel row={detail} onClose={() => setDetail(null)} />
        )}
      </Modal>
    </div>
  );
}
