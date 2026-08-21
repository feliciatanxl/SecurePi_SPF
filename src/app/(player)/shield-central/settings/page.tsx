"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Contrast, RotateCcw, Type, Volume2, Zap } from "lucide-react";
import { HubPage, HubSection } from "@/components/player/HubPage";
import { Modal } from "@/components/ui/Modal";
import { usePlayer } from "@/lib/state/PlayerProvider";
import { playCue } from "@/lib/sound";

/**
 * Settings.
 *
 * Preferences only — there is no account here, because there is no account.
 *
 * Each control layers on top of the operating system rather than overriding it.
 * Reduced Motion can only ever turn motion further down: a device already set
 * to reduce motion stays reduced whatever this switch says. Text size and
 * contrast are applied as attributes on the document root and implemented in
 * `globals.css`, so they reach every surface at once instead of being patched
 * component by component.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { profile, updateSettings, restartOnboarding, reset } = usePlayer();
  const s = profile.settings;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <HubPage
      eyebrow="Shield Central"
      title="Settings"
      measure="medium"
      intro="These apply on this device only."
    >
      <HubSection title="Experience">
        <ul className="space-y-2">
          <Toggle
            icon={<Volume2 className="h-4 w-4" />}
            label="Sound"
            note="Two short cues: rolling the dice, and unlocking a reward."
            checked={s.sound}
            onChange={(next) => {
              updateSettings({ sound: next });
              if (next) playCue("land", true);
            }}
          />
          <Toggle
            icon={<Zap className="h-4 w-4" />}
            label="Reduced motion"
            note="Shortens the dice roll and the board camera. Your device setting is always respected as well."
            checked={s.reducedMotion}
            onChange={(next) => updateSettings({ reducedMotion: next })}
          />
          <Toggle
            icon={<Type className="h-4 w-4" />}
            label="Larger text"
            note="Scales the content of every screen. The navigation bar stays where it is."
            checked={s.textSize === "large"}
            onChange={(next) =>
              updateSettings({ textSize: next ? "large" : "standard" })
            }
          />
          <Toggle
            icon={<Contrast className="h-4 w-4" />}
            label="High contrast"
            note="Darkens body text and strengthens borders across the app."
            checked={s.highContrast}
            onChange={(next) => updateSettings({ highContrast: next })}
          />
        </ul>
      </HubSection>

      <HubSection title="This device">
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => {
                restartOnboarding();
                router.push("/game");
              }}
              className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 text-left transition hover:border-civic-500"
            >
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-sunk text-ink-muted"
              >
                <RotateCcw className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold text-navy-900">
                  Replay tutorial
                </span>
                <span className="block text-[12px] font-semibold text-ink-soft">
                  Show the four intro screens again
                </span>
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-coral-200 bg-coral-50 px-3.5 text-left transition hover:border-coral-600"
            >
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-coral-100 text-coral-700"
              >
                <RotateCcw className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold text-coral-700">
                  Reset local progress
                </span>
                <span className="block text-[12px] font-semibold text-coral-700/80">
                  Clears everything stored on this device
                </span>
              </span>
            </button>
          </li>
        </ul>
      </HubSection>

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
        ShieldQuest stores your progress in this browser only. There is no
        account, no sign-in and nothing sent anywhere. Resetting removes your
        board position, Shield Tokens, unlocked cosmetics, achievements,
        Casebook and completed activities.
      </p>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        labelledBy="reset-title"
        className="bg-surface"
      >
        <div className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5">
          <h2
            id="reset-title"
            className="pr-8 text-[19px] font-extrabold text-navy-900"
          >
            Reset local progress?
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">
            This clears everything ShieldQuest has saved in this browser —
            progress, Shield Tokens, unlocked cosmetics, achievements, your
            Casebook and your board position. It cannot be undone.
          </p>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                reset();
                setConfirmReset(false);
                router.push("/game");
              }}
              className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-coral-600 px-4 text-[15px] font-extrabold text-white transition hover:bg-coral-700"
            >
              Reset everything
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
            >
              Keep my progress
            </button>
          </div>
        </div>
      </Modal>
    </HubPage>
  );
}

function Toggle({
  icon,
  label,
  note,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  note: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-left transition hover:border-civic-500"
      >
        <span
          aria-hidden="true"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
            checked ? "bg-civic-600 text-white" : "bg-surface-sunk text-ink-muted"
          }`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-extrabold text-navy-900">
            {label}
          </span>
          <span className="block text-[12px] leading-snug text-ink-soft">
            {note}
          </span>
        </span>
        {/* State is a word as well as a switch — never colour on its own. */}
        <span className="flex shrink-0 items-center gap-2">
          <span
            className={`text-[11px] font-bold uppercase tracking-wide ${
              checked ? "text-civic-700" : "text-ink-soft"
            }`}
          >
            {checked ? "On" : "Off"}
          </span>
          <span
            aria-hidden="true"
            className={`relative block h-6 w-11 rounded-full transition ${
              checked ? "bg-civic-600" : "bg-line-strong"
            }`}
          >
            <span
              className={`absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-all ${
                checked ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </span>
      </button>
    </li>
  );
}
