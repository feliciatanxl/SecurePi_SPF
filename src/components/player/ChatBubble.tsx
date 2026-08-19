import type { ScenarioMessage } from "@/lib/types";

export function ChatBubble({ message }: { message: ScenarioMessage }) {
  if (message.author === "system") {
    return (
      <div className="animate-rise flex justify-center py-1">
        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {message.body}
        </span>
      </div>
    );
  }

  const isYou = message.author === "you";

  return (
    <div
      className={`animate-rise flex flex-col gap-1 ${isYou ? "items-end" : "items-start"}`}
    >
      {message.displayName && !isYou && (
        <span className="pl-1 text-[11px] font-medium text-slate-500">
          {message.displayName}
        </span>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
          isYou
            ? "rounded-br-sm bg-shield-600 text-white"
            : "rounded-bl-sm bg-ink-700 text-slate-100"
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}
