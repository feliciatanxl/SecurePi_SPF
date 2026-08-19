"use client";

import { Coins, ShieldCheck, TrendingDown } from "lucide-react";

type Tone = "reward" | "positive" | "caution";

const TONES: Record<Tone, { wrap: string; Icon: typeof Coins }> = {
  reward: { wrap: "bg-amber-500 text-navy-900", Icon: Coins },
  positive: { wrap: "bg-leaf-700 text-white", Icon: ShieldCheck },
  caution: { wrap: "bg-navy-800 text-white", Icon: TrendingDown },
};

/**
 * The immediate payoff.
 *
 * For a risky choice this is intentionally the most satisfying moment in the
 * flow — the delayed consequence only teaches anything if the reward genuinely
 * felt good first.
 */
export function RewardBurst({
  title,
  amount,
  tone = "reward",
}: {
  title: string;
  amount?: string;
  tone?: Tone;
}) {
  const { wrap, Icon } = TONES[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-4"
    >
      <span
        className={`animate-float-up flex items-center gap-2.5 rounded-2xl px-4 py-2.5 shadow-lg ${wrap}`}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold opacity-90">
            {title}
          </span>
          {amount && (
            <span className="block text-lg font-extrabold tracking-tight tabular-nums">
              {amount}
            </span>
          )}
        </span>
      </span>
    </div>
  );
}
