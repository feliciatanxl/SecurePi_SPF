import { CircleDashed, FlaskConical, ShieldCheck } from "lucide-react";
import {
  KPI_STATUS_LABEL,
  type KpiStatus,
  type PilotKpi,
} from "@/lib/types";

/**
 * The six-KPI pilot evaluation framework.
 *
 * The status on each row is the whole reason this table exists. Anyone can list
 * six KPIs; what a reviewer needs to know is which of them this build can
 * actually speak to, which are authored figures, and which need the funded
 * pilot before there is anything to say at all. Sorting that out on the page is
 * more useful than a row of confident percentages would be.
 *
 * Nothing here reports an outcome. The prototype has not run the youth pilot,
 * so there is no measured change in risk recognition, decision accuracy or
 * anything else to report — only the mechanism that would produce it.
 */

const STATUS_STYLE: Record<
  KpiStatus,
  { skin: string; Icon: typeof ShieldCheck }
> = {
  DEMONSTRATED: {
    skin: "border-leaf-200 bg-leaf-50 text-leaf-700",
    Icon: ShieldCheck,
  },
  SIMULATED: {
    skin: "border-amber-200 bg-amber-50 text-amber-700",
    Icon: FlaskConical,
  },
  PLANNED: {
    skin: "border-line-strong bg-surface-sunk text-ink-soft",
    Icon: CircleDashed,
  },
};

/** Status in words as well as colour, so it survives print and greyscale. */
export function KpiStatusBadge({ status }: { status: KpiStatus }) {
  const { skin, Icon } = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${skin}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {KPI_STATUS_LABEL[status]}
    </span>
  );
}

export function PilotEvaluationFramework({ kpis }: { kpis: PilotKpi[] }) {
  return (
    <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <li
          key={kpi.id}
          className="flex h-full flex-col rounded-xl border border-line bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-bold tabular-nums text-civic-700">
              KPI {kpi.number}
            </p>
            <KpiStatusBadge status={kpi.status} />
          </div>

          <h3 className="mt-1.5 text-[15px] font-bold text-navy-900">
            {kpi.name}
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {kpi.measures}
          </p>

          <div className="mt-3 border-t border-line pt-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              {kpi.status === "PLANNED"
                ? "Pilot method"
                : kpi.status === "SIMULATED"
                  ? "Simulated demonstration"
                  : "Prototype demonstration"}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink">
              {kpi.method}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
