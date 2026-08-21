"use client";

import { useState } from "react";
import { ChevronDown, LifeBuoy } from "lucide-react";
import { HubPage } from "@/components/player/HubPage";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { GUARDIAN_BEACON } from "@/lib/api/mock-data";
import { usePlayer } from "@/lib/state/PlayerProvider";

/**
 * Trusted Help.
 *
 * Beacon's screen. The guidance is deliberately generic and behavioural: pause,
 * step out of the situation safely, and bring in someone who can actually help.
 *
 * What is *not* here matters as much as what is. No hotline numbers, no agency
 * contacts, no legal claims and no reporting instructions — inventing any of
 * those in a prototype would be worse than useless to a young person in a real
 * situation. Nothing here asks a youth to investigate, gather evidence,
 * confront anyone or put themselves in the middle of something.
 */

const CATEGORIES = [
  {
    id: "unsure",
    title: "I'm not sure what to do",
    guidance: [
      "Not being sure is a good reason to slow down, not to guess.",
      "Step away from the conversation before you reply. Anything genuinely legitimate survives a delay.",
      "Say it out loud to someone you trust — a family member, a teacher, a coach, an older sibling. Describing it usually makes the answer clearer.",
      "If something asks you to move money, share an account or keep it quiet, treat that as your signal to stop.",
    ],
  },
  {
    id: "happened",
    title: "Something happened to me",
    guidance: [
      "What happened to you is not a verdict on you. People are targeted precisely because the approach is designed to work.",
      "Stop the contact rather than negotiating your way out of it.",
      "Tell a trusted adult as early as you can. Situations like this get harder to unwind the longer they run.",
      "Keep what you already have — messages, screenshots — but do not go looking for more, and do not confront anyone yourself.",
      "If you feel unsafe right now, tell an adult who is physically near you.",
    ],
  },
  {
    id: "friend",
    title: "I'm worried about a friend",
    guidance: [
      "Say something privately rather than in the group. It lets your friend step back without losing face, which is the biggest barrier to changing their mind.",
      "Name the risk, not the person. \"That sounds risky\" lands very differently from \"you're being stupid\".",
      "Give them a next step: hold off, check it properly, ask someone.",
      "If it has already gone past advice, bring in a trusted adult. That is not telling on them — it is the point at which peer help runs out.",
    ],
  },
  {
    id: "adult",
    title: "I need a trusted adult",
    guidance: [
      "A trusted adult is simply someone who will take it seriously and is in a position to act — a parent or guardian, a teacher, a school counsellor, a youth worker, a coach.",
      "You do not need to have the whole story straight before you speak to them.",
      "If the first person does not help, that is not the end of it. Ask someone else.",
      "Where an official channel is involved, use one you have found yourself through a source you already trust — never a link or a number someone sent you.",
    ],
  },
];

export default function TrustedHelpPage() {
  const { guardians } = usePlayer();
  const beacon = guardians.find((g) => g.id === GUARDIAN_BEACON) ?? guardians[0];
  const [open, setOpen] = useState<string | null>(CATEGORIES[0].id);

  return (
    <HubPage eyebrow="Shield Central" title="Trusted Help" measure="reading">
      <section className="flex items-start gap-3 rounded-2xl border border-civic-200 bg-civic-50 p-3.5">
        <GuardianPlate
          guardian={beacon}
          className="h-12 w-12 shrink-0 rounded-2xl text-lg"
        />
        <div className="min-w-0">
          <p className="text-[16px] font-extrabold leading-snug text-navy-900">
            “You do not have to handle it alone.”
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {beacon.name} · {beacon.skill}
          </p>
        </div>
      </section>

      <ul className="space-y-2">
        {CATEGORIES.map((category) => {
          const expanded = open === category.id;
          return (
            <li
              key={category.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : category.id)}
                aria-expanded={expanded}
                aria-controls={`help-${category.id}`}
                className="flex min-h-[56px] w-full items-center gap-2.5 px-3.5 text-left"
              >
                <LifeBuoy
                  className="h-4 w-4 shrink-0 text-teal-600"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 text-[14px] font-extrabold text-navy-900">
                  {category.title}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${expanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {expanded && (
                <ul
                  id={`help-${category.id}`}
                  className="space-y-2 border-t border-line px-3.5 py-3"
                >
                  {category.guidance.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
                      />
                      <span className="text-[13.5px] leading-relaxed text-ink">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <p className="rounded-xl border border-line bg-surface-sunk px-3.5 py-3 text-[12px] leading-relaxed text-ink-muted">
        ShieldQuest is a learning prototype. It deliberately does not list
        hotline numbers, agency contacts or emergency instructions — in a real
        situation those should come from a source you can verify, not from a
        game. If someone is in immediate danger, tell an adult who is with you.
      </p>
    </HubPage>
  );
}
