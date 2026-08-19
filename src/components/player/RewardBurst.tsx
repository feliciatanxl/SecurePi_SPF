"use client";

import { Coins, ShieldCheck, TrendingDown } from "lucide-react";

type Tone = "reward" | "resilience" | "penalty";

/**
 * The immediate payoff. For risky choices this is intentionally the most
 * satisfying moment in the whole flow — the delayed consequence only lands if
 * the reward felt genuinely good first.
 */
export function RewardBurst({
  label,
  tone = "reward",
}: {
  label: string;
  tone?: Tone;
}) {
  const styles: Record<Tone, string> = {
    reward: "bg-gold-400 text-ink-950 shadow-gold-400/40",
    resilience: "bg-safe-500 text-ink-950 shadow-safe-500/40",
    penalty: "bg-danger-500 text-white shadow-danger-500/40",
  };
  const Icon =
    tone === "penalty" ? TrendingDown : tone === "resilience" ? ShieldCheck : Coins;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center"
    >
      <span
        className={`animate-float-up flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold tracking-tight shadow-lg ${styles[tone]}`}
      >
        <Icon className="h-4 w-4" strokeWidth={2.5} />
        {label}
      </span>
    </div>
  );
}
