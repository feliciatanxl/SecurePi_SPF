import { MetricCard } from "@/components/admin/AdminChrome";
import type { EngagementMetric } from "@/lib/types";

/**
 * KPI 6 — Engagement.
 *
 * Four aggregate figures across one row, each with the sentence that says what
 * it counts. The sentence matters more than the number here: "79%" on its own
 * invites the reader to supply their own definition, and the definitions are the
 * part a pilot would have to agree before measuring anything.
 *
 * Aggregate only, by design. There is no participant column, no per-youth
 * engagement rating and nothing here that resolves to an individual — engagement
 * is a property of the session, not a score attached to a young person.
 */
export function EngagementPanel({ metrics }: { metrics: EngagementMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          note={metric.note}
        />
      ))}
    </div>
  );
}
