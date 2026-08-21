"use client";

import { useMemo, useState } from "react";
import { Check, Gift, Info, Lock, Sparkles } from "lucide-react";
import { HubPage } from "@/components/player/HubPage";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { AchievementList } from "@/components/player/AchievementList";
import { Modal } from "@/components/ui/Modal";
import { REWARDS, findReward } from "@/lib/api/rewards-data";
import { useShieldProgress } from "@/lib/hooks/useShieldProgress";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { playCue } from "@/lib/sound";
import type { Reward } from "@/lib/types";

type Tab = "FEATURED" | "GUARDIANS" | "CITY_STYLE" | "ACHIEVEMENTS";

const TABS: { id: Tab; label: string }[] = [
  { id: "FEATURED", label: "Featured" },
  { id: "GUARDIANS", label: "Guardians" },
  { id: "CITY_STYLE", label: "City Style" },
  { id: "ACHIEVEMENTS", label: "Achievements" },
];

/**
 * The Rewards Hub.
 *
 * Everything here is cosmetic and everything here has a price on it. There are
 * no crates, no draws, no duplicates, no timers and no random outcomes: a
 * player reads the cost, decides, and receives exactly the thing they chose.
 * Nothing on this page can change a scenario, an outcome, a Guardian's level or
 * what content is available.
 */
export default function RewardsPage() {
  const { profile, guardians, unlockReward, equipReward, unequipSlot, equippedIn } =
    usePlayer();
  const { achievements } = useShieldProgress();

  const [tab, setTab] = useState<Tab>("FEATURED");
  const [detail, setDetail] = useState<Reward | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<Reward | null>(null);

  const shown = useMemo(() => {
    if (tab === "FEATURED") {
      return [
        ...REWARDS.filter((r) => r.featured),
        ...REWARDS.filter((r) => !r.featured),
      ];
    }
    if (tab === "GUARDIANS") return REWARDS.filter((r) => r.category === "GUARDIANS");
    if (tab === "CITY_STYLE") return REWARDS.filter((r) => r.category === "CITY_STYLE");
    return [];
  }, [tab]);

  const handleUnlock = (reward: Reward) => {
    if (!unlockReward(reward.id)) return;
    playCue("reward", profile.settings.sound);
    setDetail(null);
    setJustUnlocked(reward);
  };

  return (
    <HubPage
      eyebrow="Shield Central"
      title="Rewards"
      intro="Earn rewards by building prevention skills."
      action={
        <p className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-right">
          <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-navy-100/70">
            Shield Tokens
          </span>
          <span className="block text-[17px] font-extrabold leading-tight tabular-nums text-amber-400">
            {profile.shieldTokens.toLocaleString()}
          </span>
        </p>
      }
    >
      {/* Category tabs. */}
      <div
        role="tablist"
        aria-label="Reward categories"
        className="thin-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-[40px] shrink-0 rounded-lg border px-3 text-[12px] font-extrabold uppercase tracking-wide transition ${
              tab === id
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-line bg-surface text-ink-muted hover:border-civic-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ACHIEVEMENTS" ? (
        <AchievementList achievements={achievements} />
      ) : (
        <ul className="grid grid-cols-2 gap-2.5">
          {shown.map((reward) => {
            const owned = profile.unlockedRewards.includes(reward.id);
            const equipped = equippedIn(reward.slot) === reward.id;
            const guardian = reward.guardianId
              ? guardians.find((g) => g.id === reward.guardianId)
              : undefined;

            return (
              <li key={reward.id}>
                <button
                  type="button"
                  onClick={() => setDetail(reward)}
                  className="flex h-full w-full flex-col rounded-2xl border border-line bg-surface p-2.5 text-left transition hover:-translate-y-0.5 hover:border-civic-500"
                >
                  <span
                    className={`mb-2 grid h-[70px] w-full place-items-center rounded-xl bg-gradient-to-br ${reward.swatch}`}
                  >
                    {guardian ? (
                      <GuardianPlate
                        guardian={guardian}
                        className="h-12 w-12 rounded-xl text-[16px]"
                      />
                    ) : (
                      <Sparkles
                        className="h-7 w-7 text-white/90"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="text-[13px] font-extrabold leading-tight text-navy-900">
                    {reward.name}
                  </span>
                  <span className="mt-auto flex items-center gap-1 pt-1.5 text-[11px] font-bold">
                    {equipped ? (
                      <span className="inline-flex items-center gap-1 text-leaf-700">
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        Equipped
                      </span>
                    ) : owned ? (
                      <span className="text-civic-700">Unlocked</span>
                    ) : (
                      <span className="text-amber-700 tabular-nums">
                        {reward.cost} Shield Tokens
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pilot rewards — informational only. */}
      <section className="rounded-2xl border border-line bg-surface-sunk p-3.5">
        <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          <Gift className="h-3.5 w-3.5" aria-hidden="true" />
          Pilot rewards
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
          Selected facilitated pilots may offer approved participation rewards.
          Availability depends on the pilot organiser and participating
          partners.
        </p>
        <p className="mt-2 inline-flex rounded-md border border-line-strong bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          Available during selected pilots
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-ink-soft">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Nothing here is claimable in this prototype, and no reward is promised
          by any organisation.
        </p>
      </section>

      <RewardDetail
        reward={detail}
        balance={profile.shieldTokens}
        owned={detail ? profile.unlockedRewards.includes(detail.id) : false}
        equipped={detail ? equippedIn(detail.slot) === detail.id : false}
        guardianPlate={
          detail?.guardianId
            ? guardians.find((g) => g.id === detail.guardianId)
            : undefined
        }
        onUnlock={handleUnlock}
        onEquip={(r) => {
          equipReward(r.id);
          setDetail(null);
        }}
        onUnequip={(r) => {
          unequipSlot(r.slot);
          setDetail(null);
        }}
        onClose={() => setDetail(null)}
      />

      <RewardUnlocked
        reward={justUnlocked}
        onEquip={() => {
          if (justUnlocked) equipReward(justUnlocked.id);
          setJustUnlocked(null);
        }}
        onClose={() => setJustUnlocked(null)}
      />
    </HubPage>
  );
}

/* ------------------------------------------------------------------ */
/* Reward details                                                      */
/* ------------------------------------------------------------------ */

function RewardDetail({
  reward,
  balance,
  owned,
  equipped,
  guardianPlate,
  onUnlock,
  onEquip,
  onUnequip,
  onClose,
}: {
  reward: Reward | null;
  balance: number;
  owned: boolean;
  equipped: boolean;
  guardianPlate?: Parameters<typeof GuardianPlate>[0]["guardian"];
  onUnlock: (reward: Reward) => void;
  onEquip: (reward: Reward) => void;
  onUnequip: (reward: Reward) => void;
  onClose: () => void;
}) {
  const affordable = reward ? balance >= reward.cost : false;

  return (
    <Modal
      open={reward !== null}
      onClose={onClose}
      labelledBy="reward-detail-title"
      className="bg-surface"
    >
      {reward && (
        <div className="flex max-h-[86dvh] min-h-0 flex-col">
          <div
            className={`grid h-[132px] w-full shrink-0 place-items-center bg-gradient-to-br ${reward.swatch}`}
          >
            {guardianPlate ? (
              <GuardianPlate
                guardian={guardianPlate}
                className="h-20 w-20 rounded-3xl text-2xl"
              />
            ) : (
              <Sparkles className="h-12 w-12 text-white/90" aria-hidden="true" />
            )}
          </div>

          <header className="shrink-0 border-b border-line px-5 pb-3 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
              {reward.category === "GUARDIANS" ? "Guardian cosmetic" : "City style"}
            </p>
            <h2
              id="reward-detail-title"
              className="mt-0.5 pr-10 text-[21px] font-extrabold uppercase leading-tight tracking-tight text-navy-900"
            >
              {reward.name}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              {reward.description}
            </p>
          </header>

          <div className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-3.5">
            <dl className="rounded-xl border border-line bg-surface-sunk px-3.5 py-1">
              <CostRow label="Cost" value={`${reward.cost} tokens`} />
              <CostRow label="Current balance" value={`${balance} tokens`} />
              <CostRow
                label={owned ? "Already unlocked" : "After unlock"}
                value={
                  owned
                    ? "—"
                    : `${Math.max(0, balance - reward.cost)} remaining`
                }
                last
              />
            </dl>

            <p className="text-[12px] leading-relaxed text-ink-soft">
              Cosmetic only. Unlocking this changes how something looks and
              nothing else — no activity, no outcome and no Guardian is affected.
            </p>
          </div>

          <div className="shrink-0 space-y-2 border-t border-line px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
            {!owned ? (
              <button
                type="button"
                disabled={!affordable}
                onClick={() => onUnlock(reward)}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-500 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-navy-900 transition hover:bg-amber-400 active:translate-y-[3px] active:border-b-0 disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-surface-sunk disabled:text-ink-soft"
              >
                {affordable ? (
                  <>Unlock · {reward.cost}</>
                ) : (
                  <>
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Need {reward.cost - balance} more tokens
                  </>
                )}
              </button>
            ) : equipped ? (
              <button
                type="button"
                onClick={() => onUnequip(reward)}
                className="flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[15px] font-semibold text-ink transition hover:border-civic-500"
              >
                Unequip
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onEquip(reward)}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
              >
                Equip
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function CostRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${last ? "" : "border-b border-line"}`}
    >
      <dt className="text-[13px] font-semibold text-ink-muted">{label}</dt>
      <dd className="text-[13px] font-extrabold tabular-nums text-navy-900">
        {value}
      </dd>
    </div>
  );
}

function RewardUnlocked({
  reward,
  onEquip,
  onClose,
}: {
  reward: Reward | null;
  onEquip: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={reward !== null}
      onClose={onClose}
      labelledBy="reward-unlocked-title"
      className="bg-surface"
    >
      {reward && (
        <div className="animate-slide-up flex flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 text-center">
          <span
            aria-hidden="true"
            className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${reward.swatch}`}
          >
            <Check className="h-9 w-9 text-white" strokeWidth={3} />
          </span>
          <h2
            id="reward-unlocked-title"
            className="mt-3.5 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-navy-900"
          >
            Reward unlocked
          </h2>
          <p className="mt-1 text-[15px] font-bold text-civic-700">{reward.name}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {reward.description}
          </p>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={onEquip}
              className="flex min-h-[52px] w-full items-center justify-center rounded-xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
            >
              Equip now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
