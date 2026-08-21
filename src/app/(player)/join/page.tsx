"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Info, QrCode } from "lucide-react";
import { HubPage } from "@/components/player/HubPage";
import { usePlayer } from "@/lib/state/PlayerProvider";
import type { JoinedSession } from "@/lib/types";

/**
 * Join a facilitated session.
 *
 * A prototype flow that shows how ShieldQuest would be used during a youth
 * pilot: a code, or a QR at the front of the room. There is no backend, no
 * lookup and no real session — any code produces the same simulated session,
 * and the screen says so at every step.
 *
 * The labelling is not decoration. Implying that live NYP or SPF sessions
 * currently exist, or that a code was validated against something, would be a
 * false claim about a real organisation.
 */
const SIMULATED_SESSION: Omit<JoinedSession, "code"> = {
  name: "NYP Youth Pilot",
  audience: "ITE / Poly / JC",
  focus: "Digi-District",
};

export default function JoinPage() {
  const { profile, joinSession } = usePlayer();
  const [code, setCode] = useState("NYP-2026-A");
  const joined = profile.joinedSession;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    joinSession({ ...SIMULATED_SESSION, code: trimmed });
  };

  return (
    <HubPage
      eyebrow="ShieldQuest"
      title="Join ShieldQuest"
      backHref="/shield-central"
      intro="How a facilitated pilot session would start."
    >
      <p className="inline-flex rounded-md border border-line-strong bg-surface-sunk px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
        Simulated pilot session
      </p>

      {joined ? (
        <section className="rounded-2xl border border-leaf-200 bg-leaf-50 p-4">
          <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-leaf-700">
            <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            Joined
          </p>
          <h2 className="mt-1 text-[20px] font-extrabold uppercase tracking-tight text-navy-900">
            {joined.name}
          </h2>
          <dl className="mt-2.5 space-y-1.5">
            <Detail label="Session code" value={joined.code} />
            <Detail label="Audience" value={joined.audience} />
            <Detail label="Focus" value={joined.focus} />
            <Detail label="Type" value="Facilitated session" />
          </dl>

          <div className="mt-3.5 space-y-2">
            <Link
              href="/game"
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 text-[15px] font-extrabold text-white transition hover:bg-civic-700"
            >
              Enter ShieldQuest City
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => joinSession(null)}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-line px-4 text-[14px] font-semibold text-ink transition hover:border-civic-500"
            >
              Leave this session
            </button>
          </div>
        </section>
      ) : (
        <>
          <form
            onSubmit={submit}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <label
              htmlFor="session-code"
              className="block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
            >
              Enter session code
            </label>
            <input
              id="session-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 w-full rounded-xl border-2 border-line-strong bg-surface-sunk px-3 py-3 text-center text-[22px] font-extrabold uppercase tracking-[0.18em] text-navy-900 outline-none transition focus:border-civic-500"
            />
            <p className="mt-1.5 text-[12px] text-ink-soft">
              Any code works in this prototype — it is not checked against
              anything.
            </p>
            <button
              type="submit"
              className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-civic-800 bg-civic-600 px-4 text-[15px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-civic-700 active:translate-y-[3px] active:border-b-0"
            >
              Join session
            </button>
          </form>

          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              or
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>

          <div className="rounded-2xl border border-dashed border-line-strong bg-surface-sunk px-4 py-6 text-center">
            <span
              aria-hidden="true"
              className="mx-auto grid h-20 w-20 place-items-center rounded-2xl border-2 border-line-strong bg-surface"
            >
              <QrCode className="h-10 w-10 text-ink-soft" />
            </span>
            <p className="mt-2.5 text-[14px] font-bold text-navy-900">
              Scan pilot QR
            </p>
            <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">
              A facilitator would display this at the start of a session. Camera
              scanning is not part of this prototype.
            </p>
          </div>
        </>
      )}

      <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        This is a demonstration of the joining flow. No live pilot sessions are
        running, nothing is sent anywhere, and no organisation is currently
        operating sessions through this prototype.
      </p>
    </HubPage>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="text-[13.5px] font-extrabold text-navy-900">{value}</dd>
    </div>
  );
}
