import { UserRound } from "lucide-react";
import type { ScenarioMessage as Message } from "@/lib/types";

/**
 * Message cards rather than a plain chat log — a named sender with an avatar
 * makes the "who is actually talking to me?" question visible, which is the
 * first thing the scenario is teaching.
 */
export function ScenarioMessage({
  message,
  accent = "civic",
}: {
  message: Message;
  accent?: "civic" | "teal";
}) {
  if (message.author === "system") {
    return (
      <div className="animate-rise">
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-sunk px-3 py-1.5">
          <p className="text-[12px] font-semibold leading-snug text-ink-muted">
            {message.body}
          </p>
          {message.meta && (
            <p className="mt-0.5 text-[12px] text-ink-soft">{message.meta}</p>
          )}
        </div>
      </div>
    );
  }

  const isYou = message.author === "you";

  if (isYou) {
    return (
      <div className="animate-rise flex justify-end">
        <p
          className={`max-w-[86%] rounded-2xl rounded-br-md px-3 py-2 text-[13.5px] leading-snug text-white ${
            accent === "teal" ? "bg-teal-600" : "bg-civic-600"
          }`}
        >
          {message.body}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-rise flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-100 text-navy-800"
      >
        <UserRound className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        {message.displayName && (
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            {message.displayName}
          </p>
        )}
        <p className="max-w-[92%] rounded-2xl rounded-tl-md border border-line bg-surface-sunk px-3 py-2 text-[13.5px] leading-snug text-ink">
          {message.body}
        </p>
      </div>
    </div>
  );
}
