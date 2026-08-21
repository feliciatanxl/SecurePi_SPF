"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, Sparkles } from "lucide-react";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { Modal } from "@/components/ui/Modal";
import { COMPETENCY_LABEL, COMPETENCY_LETTER, type Competency, type Guardian } from "@/lib/types";

/**
 * Mission Complete.
 *
 * Deliberately separate from the debrief. The debrief explains what happened
 * and why it mattered; this screen closes the loop on the *turn* — what was
 * practised, what progressed, and the way back to the board.
 *
 * It never grades the decision. A player who took the risky option sees the
 * same completion card as one who did not, because completing a mission is
 * participation and the learning is in the debrief they have just read. Shield
 * Tokens shown here are paid once per activity: replaying is encouraged, and
 * farming is not possible.
 */
export function MissionComplete({
  open,
  title,
  competency,
  guardian,
  /** Clues the player tagged, out of those available. Omitted when there are none. */
  signals,
  tokensAwarded,
  guardianAdvanced,
  onViewLearning,
  onClose,
}: {
  open: boolean;
  title: string;
  competency: Competency;
  guardian?: Guardian;
  signals?: { found: number; total: number };
  tokensAwarded: number;
  guardianAdvanced: boolean;
  onViewLearning: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="mission-complete-title"
      className="bg-surface"
    >
      <div className="animate-slide-up flex max-h-[88dvh] min-h-0 flex-col">
        <header className="shrink-0 px-5 pb-3 pt-6 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-100 text-leaf-700"
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-soft">
            {title}
          </p>
          <h2
            id="mission-complete-title"
            className="mt-0.5 text-[26px] font-extrabold uppercase leading-tight tracking-tight text-navy-900"
          >
            Mission complete
          </h2>
        </header>

        <div className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-3">
          <Row
            label={`${COMPETENCY_LABEL[competency]} practised`}
            badge={
              <span
                aria-hidden="true"
                className="grid h-5 w-5 place-items-center rounded bg-navy-900 text-[11px] font-extrabold text-white"
              >
                {COMPETENCY_LETTER[competency]}
              </span>
            }
            value={<Check className="h-4 w-4 text-leaf-700" strokeWidth={3} />}
          />

          {signals && (
            <Row
              label="Warning signs identified"
              value={
                <span className="tabular-nums">
                  {signals.found} / {signals.total}
                </span>
              }
            />
          )}

          {guardian && (
            <Row
              tone="civic"
              label={`${guardian.name} progress`}
              badge={
                <GuardianPlate
                  guardian={guardian}
                  className="h-5 w-5 rounded text-[10px]"
                />
              }
              value={<span>{guardianAdvanced ? "+1" : "No change"}</span>}
            />
          )}

          <Row
            tone="amber"
            label="Shield Tokens"
            badge={<Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />}
            value={
              <span className="tabular-nums">
                {tokensAwarded > 0 ? `+${tokensAwarded}` : "Already earned"}
              </span>
            }
          />

          <p className="pt-1 text-[12px] leading-relaxed text-ink-soft">
            Shield Tokens are participation credit for cosmetics in the Rewards
            Hub. They are not money, they cannot be cashed out, and they are
            paid once per activity.
          </p>
        </div>

        <div className="shrink-0 space-y-2 border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
          >
            Return to city
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onViewLearning}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500 hover:text-civic-700"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            View what I learned
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Row({
  label,
  badge,
  value,
  tone = "neutral",
}: {
  label: string;
  badge?: React.ReactNode;
  value: React.ReactNode;
  tone?: "neutral" | "civic" | "amber";
}) {
  const skin =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "civic"
        ? "border-civic-200 bg-civic-50 text-civic-800"
        : "border-line bg-surface-sunk text-ink";

  return (
    <p
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[14px] font-bold ${skin}`}
    >
      {badge}
      <span className="min-w-0 flex-1">{label}</span>
      <span className="shrink-0 font-extrabold">{value}</span>
    </p>
  );
}
