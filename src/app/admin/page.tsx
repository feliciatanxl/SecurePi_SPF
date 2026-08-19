"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Gamepad2,
  Loader2,
  Search,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { FlashMissionForm } from "@/components/admin/FlashMissionModal";
import { ScenarioTable } from "@/components/admin/ScenarioTable";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api/client";
import type { AdminScenarioRow, FlashMissionDraft } from "@/lib/types";

/**
 * View 3 — Scenario Management Portal.
 *
 * Desktop-first: this is an operational console for SPF crime prevention
 * officers, not a youth-facing surface.
 */
export default function AdminPage() {
  const [rows, setRows] = useState<AdminScenarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [justDeployedId, setJustDeployedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.listScenarios().then((data) => {
      if (!active) return;
      setRows(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleDeploy = useCallback(async (draft: FlashMissionDraft) => {
    const created = await api.deployFlashMission(draft);
    setRows((prev) => [created, ...prev]);
    setJustDeployedId(created.id);
    setModalOpen(false);
  }, []);

  const filtered = rows.filter((r) =>
    `${r.title} ${r.threatType}`.toLowerCase().includes(query.toLowerCase()),
  );

  const live = rows.filter((r) => r.status === "LIVE");
  const scored = live.filter((r) => r.plays > 0);
  const avgSafeRate = scored.length
    ? Math.round(
        scored.reduce((sum, r) => sum + r.safeDecisionRate, 0) / scored.length,
      )
    : 0;
  const totalPlays = rows.reduce((sum, r) => sum + r.plays, 0);

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900">
              <Shield className="h-4.5 w-4.5 text-white" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight tracking-tight">
                ShieldQuest{" "}
                <span className="font-medium text-slate-400">
                  Scenario Management Portal
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Singapore Police Force · Crime Prevention Division
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/play"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              Player view
            </Link>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
              DO
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading + primary action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Active scenarios
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Content currently in the field, with live efficacy data by cohort.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Zap className="h-4 w-4" />
            Deploy Flash Mission
          </button>
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Activity className="h-4 w-4" />}
            label="Live scenarios"
            value={String(live.length)}
            note={`${rows.length - live.length} in draft or scheduled`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Avg. safe decision rate"
            value={`${avgSafeRate}%`}
            note="Across all scored live content"
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Total plays"
            value={totalPlays.toLocaleString()}
            note="All cohorts, last 30 days"
          />
        </div>

        {/* Search */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title or threat type"
              aria-label="Filter scenarios"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="whitespace-nowrap text-xs text-slate-500 tabular-nums">
            {filtered.length} of {rows.length}
          </span>
        </div>

        {/* Table */}
        <div className="mt-3">
          {loading ? (
            <div className="grid place-items-center rounded-xl border border-slate-200 bg-white py-20">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <ScenarioTable rows={filtered} highlightId={justDeployedId} />
          )}
        </div>

        {justDeployedId && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Flash Mission is live. Players in the target cohort receive it on next
            app open.
          </p>
        )}
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-2xl bg-white"
      >
        <FlashMissionForm
          onDeploy={handleDeploy}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{note}</p>
    </div>
  );
}
