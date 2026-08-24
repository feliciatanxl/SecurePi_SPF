import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Eye,
  Gamepad2,
  Link2,
  LockKeyhole,
  MessageCircleHeart,
  MousePointerClick,
  Presentation,
  Printer,
  Radar,
  Settings2,
  ShieldCheck,
  ShieldHalf,
  ShoppingBag,
  Sparkles,
  UserRoundCheck,
  UserRoundCog,
  UsersRound,
  Vote,
  Wallet,
} from "lucide-react";
import { DistrictScene } from "@/components/player/DistrictArt";
import { GuardianPlate } from "@/components/player/GuardianArt";
import { DISTRICT_SKIN } from "@/components/player/districtSkin";
import { MOCK_GUARDIANS } from "@/lib/api/mock-data";
import { PEER_ROLES } from "@/lib/api/peer-roles-data";
import { DISTRICT_CHAPTER } from "@/lib/api/world-data";
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  COMPETENCY_ORDER,
  TARGET_GROUP_AGE,
  type Competency,
  type DistrictId,
  type TargetGroup,
} from "@/lib/types";

const DISTRICTS: {
  id: DistrictId;
  name: string;
  theme: string;
}[] = [
  {
    id: "school",
    name: "School Street",
    theme: "Peer pressure, everyday choices and risky requests.",
  },
  {
    id: "retail",
    name: "Retail District",
    theme: "Shop-theft prevention, dares and social influence.",
  },
  {
    id: "digi",
    name: "Digi-District",
    theme:
      "Easy-money offers, account misuse, digital identity and scam-related risks.",
  },
  {
    id: "community",
    name: "Community Hub",
    theme: "Helping others, trusted support and community responsibility.",
  },
];

/**
 * The six-stage learning loop.
 *
 * Reflection has not gone anywhere — it is still what the debrief, the Casebook
 * and the Think–Vote–Explain explain step are for. It stopped being a stage of
 * its own because it is not a place the learner goes between deciding and
 * protecting; it runs through both.
 */
const EXPERIENCE_STEPS: [string, string][] = [
  ["Explore", "Move through the city and meet a situation."],
  ["Investigate", "Tag the signals that are already there."],
  ["Discuss", "Think privately, then hear how others read it."],
  ["Decide", "Commit to a response, without a marked-correct option."],
  ["Experience", "Live the consequence, including the delayed one."],
  ["Protect", "Carry the skill into looking out for someone else."],
];

/**
 * The learning areas the platform is designed to cover.
 *
 * Design scope, stated as design scope. Some of these are playable in the
 * current build and some exist as authored library entries or planned district
 * content — the section that renders this says which, rather than implying a
 * finished catalogue.
 */
const LEARNING_COVERAGE: [string, string, typeof Radar][] = [
  [
    "Phishing and suspicious links",
    "Unexpected messages that need you to click, log in or confirm something now.",
    Link2,
  ],
  [
    "Job scams",
    "Offers that pay far above the task, with no interview and no employer you can check.",
    BrainCircuit,
  ],
  [
    "Money mule recruitment",
    "Being paid to let money pass through an account in your name.",
    Wallet,
  ],
  [
    "Impersonation",
    "A real-looking account, and someone else behind it.",
    UserRoundCog,
  ],
  [
    "E-commerce scams",
    "Payments moved off-platform, where the only protection either side had disappears.",
    ShoppingBag,
  ],
  [
    "Suspicious digital requests",
    "Logins, one-time codes, account access and payment details asked for by someone who should not need them.",
    LockKeyhole,
  ],
];

/**
 * The three learner segments, as the public site presents them.
 *
 * Deliberately not `TARGET_GROUPS`. That list carries a fourth entry — "All
 * Youth Bands" — which is an *administrative* targeting option for content that
 * applies across every segment, not a fourth kind of learner. Rendering it here
 * would tell a reader the programme is designed around four age groups when it
 * is designed around three, so the public page names the three and the portal
 * keeps the cross-band option it actually needs.
 *
 * Adaptive content design, not a shipped per-band catalogue. The metadata is
 * real and it drives the portal's targeting and filtering; separately authored
 * variants of every scenario per segment are a delivery question, not something
 * this prototype claims to have done.
 */
const LEARNER_SEGMENTS: {
  band: Extract<
    TargetGroup,
    "Primary / Early Secondary" | "Secondary" | "Post-Secondary / Tertiary"
  >;
  note: string;
}[] = [
  {
    band: "Primary / Early Secondary",
    note: "Simpler language, shorter situations, and everyday settings — games, group chats, school.",
  },
  {
    band: "Secondary",
    note: "Peer pressure, dares and the first digital requests that carry a real cost.",
  },
  {
    band: "Post-Secondary / Tertiary",
    note: "Money, work and independence — job offers, account use, and being recruited rather than tricked.",
  },
];

const PROTOTYPE_FEATURES = [
  "City-board gameplay",
  "Scenario decision-making",
  "Delayed consequences",
  "Peer Shield",
  "Six Guardians and six mini-games",
  "Think · Vote · Explain (simulated group responses)",
  "Shield Tokens and learning progression",
  "Casebook",
  "Scenario Management Portal",
  "Youth-Created Missions moderation queue (simulated)",
  "Flash Mission and City Alert demonstration",
];

/**
 * The design principles the learning mechanics are built on.
 *
 * Four, deliberately, and each one names a mechanic rather than an aspiration —
 * every principle here corresponds to something in the build. The section this
 * renders is a summary of the design rationale, not a literature review, and it
 * carries no citations because inventing publication details to look rigorous
 * would be worse than claiming nothing.
 */
const EVIDENCE_PRINCIPLES: [string, string][] = [
  [
    "Active decision-making",
    "Players make choices and live with them, rather than being told what to avoid.",
  ],
  [
    "Peer discussion",
    "Group reasoning surfaces the assumptions and social pressures a private answer hides.",
  ],
  [
    "Consequence-based learning",
    "Immediate and delayed outcomes make the real trade-off visible in the right order.",
  ],
  [
    "Reflection and transfer",
    "Debriefs, the Casebook and Peer Shield move the skill to situations the player has not seen.",
  ],
];

const RESPONSIBLE_DESIGN = [
  "Privacy by design",
  "No youth crime prediction",
  "No individual participant risk profiling",
  "No real banking or Singpass credentials in prototype scenarios",
  "Simulated scenario data",
  "Learning and prevention focus",
  "No leaderboards or public comparison",
];

export default function ProjectShieldPage() {
  return (
    <div className="min-h-full overflow-x-clip bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/95 text-white shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[68px] max-w-[1180px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="#top"
            aria-label="Project SHIELD home"
            className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl"
          >
            <Image
              src="/assets/shieldquest/brand/shieldquest-icon.svg"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 shrink-0 rounded-xl"
            />
            <span className="min-w-0 leading-none">
              <span className="block text-[9px] font-extrabold uppercase tracking-[0.2em] text-amber-400">
                Project SHIELD
              </span>
              <span className="mt-1 block text-[17px] font-extrabold tracking-tight">
                Shield<span className="text-civic-400">Quest</span>
              </span>
            </span>
          </Link>

          <nav aria-label="Public website" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1 text-[12px] font-bold text-white/75">
              {[
                ["About", "#about"],
                ["How it works", "#how-it-works"],
                ["Guardians", "#guardians"],
                ["What it covers", "#coverage"],
                ["Districts", "#districts"],
                ["Evidence-informed", "#evidence"],
                ["Responsible design", "#responsible-design"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center rounded-lg px-3 transition hover:bg-white/8 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/*
            No call to action in the bar itself. The page already opens on
            "Play ShieldQuest" in the hero, repeats it in the districts section
            and closes on it, so a sixth amber button up here was competing with
            the section links rather than adding a route in.
          */}
        </div>
      </header>

      <main id="main">
        <section
          id="top"
          className="relative isolate overflow-hidden bg-navy-950 text-white"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_18%,rgba(42,125,216,0.35),transparent_34%),radial-gradient(circle_at_12%_80%,rgba(30,149,138,0.2),transparent_30%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]"
          />

          <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-amber-400/45 bg-amber-400/10 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Working prototype
              </span>
              <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.28em] text-civic-300">
                Project SHIELD
              </p>
              <h1 className="mt-2 text-[clamp(3.25rem,8vw,6.6rem)] font-black leading-[0.84] tracking-[-0.065em]">
                Shield<span className="text-civic-400">Quest</span>
              </h1>
              <p className="mt-5 text-xl font-extrabold tracking-tight text-amber-300 sm:text-2xl">
                Choose Right. Protect Together.
              </p>
              <p className="mt-6 max-w-[670px] text-[17px] font-semibold leading-relaxed text-white/88 sm:text-[19px]">
                A youth-led interactive crime-prevention experience that turns
                awareness into decision-making, peer intervention and community
                resilience.
              </p>
              <p className="mt-3 max-w-[620px] text-[14px] leading-relaxed text-navy-100/78 sm:text-[15px]">
                Practise difficult choices in a safe environment before
                encountering them in real life.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/game"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-b-4 border-amber-700 bg-amber-400 px-5 text-[14px] font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-amber-300 active:translate-y-0.5 active:border-b-2"
                >
                  <Gamepad2 className="h-5 w-5" aria-hidden="true" />
                  Play ShieldQuest
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/8 px-5 text-[13px] font-extrabold uppercase tracking-wide text-white transition hover:border-white/50 hover:bg-white/12"
                >
                  <Settings2 className="h-5 w-5" aria-hidden="true" />
                  View scenario portal
                </Link>
              </div>

              <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-white/72">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Concept prototype for demonstration. Not an official Singapore
                Police Force application or endorsed product.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute -inset-8 -z-10 rounded-full bg-civic-500/18 blur-3xl" />
              <div className="overflow-hidden rounded-[32px] border border-white/18 bg-white/8 p-3 shadow-[0_32px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-4">
                <div className="rounded-[24px] border border-white/12 bg-navy-900 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-amber-400">
                        ShieldQuest City
                      </p>
                      <p className="mt-1 text-[15px] font-extrabold">
                        Four places. Real choices.
                      </p>
                    </div>
                    <span className="rounded-lg border border-white/15 bg-white/8 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/70">
                      Youth PWA
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {DISTRICTS.map((district) => (
                      <div
                        key={district.id}
                        className="relative isolate h-[112px] overflow-hidden rounded-2xl border border-white/14 sm:h-[138px]"
                      >
                        <DistrictScene districtId={district.id} />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 -z-0 bg-gradient-to-t from-navy-950 via-navy-950/45 to-transparent"
                        />
                        <p className="absolute inset-x-3 bottom-3 z-10 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white sm:text-[12px]">
                          {district.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-teal-200/20 bg-teal-500/12 px-3 py-2.5">
                    <ShieldHalf className="h-5 w-5 shrink-0 text-teal-200" aria-hidden="true" />
                    <p className="text-[11px] font-semibold leading-snug text-white/78">
                      The board creates momentum. Decisions, reflection and peer
                      protection create the learning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-it-matters" className="scroll-mt-24 bg-amber-50">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:py-20">
            <div>
              <SectionLabel>Why it exists</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                Awareness is a start. Young people also need a safe place to
                practise the moment.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Peer pressure", UsersRound],
                ["Temptation", Sparkles],
                ["Uncertainty", BrainCircuit],
                ["Apparently harmless risks", Eye],
                ["Suspicious easy-money offers", Radar],
                ["Account and digital misuse", LockKeyhole],
              ].map(([label, Icon]) => {
                const ItemIcon = Icon as typeof UsersRound;
                return (
                  <div
                    key={label as string}
                    className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                      <ItemIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="text-[14px] font-bold leading-snug text-navy-900">
                      {label as string}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid items-end gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <SectionLabel>What is ShieldQuest?</SectionLabel>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                  The youth-facing PWA within Project SHIELD.
                </h2>
              </div>
              <p className="max-w-[700px] text-[16px] leading-relaxed text-ink-muted lg:justify-self-end">
                Players move through a city, meet situations and practise safer
                choices. The board is the engagement layer; the learning
                substance is scenario decisions, delayed consequences, Peer
                Shield, S.H.I.E.L.D. skills and reflection.
              </p>
            </div>

            <h3
              id="how-it-works"
              className="mt-10 scroll-mt-24 text-[11px] font-extrabold uppercase tracking-[0.2em] text-civic-700"
            >
              The six-stage learning loop
            </h3>
            <ol
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
              aria-label="ShieldQuest learning loop"
            >
              {EXPERIENCE_STEPS.map(([step, detail], index) => (
                <li
                  key={step}
                  className="relative rounded-2xl border border-line bg-surface-sunk px-3 py-4"
                >
                  <span className="text-[10px] font-extrabold tabular-nums text-civic-700">
                    0{index + 1}
                  </span>
                  <p className="mt-3 text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
                    {step}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-snug text-ink-muted">
                    {detail}
                  </p>
                  {index < EXPERIENCE_STEPS.length - 1 && (
                    <ChevronRight
                      className="absolute -right-2 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-white text-civic-600 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-3 max-w-[80ch] text-[13px] leading-relaxed text-ink-muted">
              Reflection is not a separate stop on the loop. It runs through
              Discuss, Experience and Protect — in the debrief after a decision,
              in the Casebook a player keeps, and in the explain step of a
              facilitated Think–Vote–Explain round.
            </p>
          </div>
        </section>

        <section id="guardians" className="scroll-mt-24 bg-surface-sunk">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel>The Guardians</SectionLabel>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-[720px] text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                Six Guardians. One for each prevention skill.
              </h2>
              <p className="max-w-[440px] text-[13px] leading-relaxed text-ink-muted">
                A Guardian is the visible form of a S.H.I.E.L.D. skill, not a
                collectible. Each one strengthens only when its own skill is
                practised in a mission — so progress is evidence of learning
                rather than of time spent.
              </p>
            </div>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_GUARDIANS.map((guardian) => (
                <li
                  key={guardian.id}
                  className="flex items-start gap-3.5 rounded-3xl border border-line bg-white p-5 shadow-[0_18px_50px_-44px_rgba(11,37,69,0.8)]"
                >
                  <GuardianPlate
                    guardian={guardian}
                    className="h-16 w-16 shrink-0 rounded-2xl text-xl"
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold uppercase leading-tight tracking-wide text-navy-950">
                      {guardian.name}
                    </h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-civic-700">
                      {guardian.skill}
                      <span
                        aria-hidden="true"
                        className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[10px] font-extrabold text-white"
                      >
                        {COMPETENCY_LETTER[guardian.competency]}
                      </span>
                      <span className="font-semibold text-ink-soft">
                        {COMPETENCY_LABEL[guardian.competency]}
                      </span>
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                      {guardian.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="coverage" className="scroll-mt-24">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel>Scam and civic prevention scope</SectionLabel>
            <div className="mt-3 grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                  What the platform is designed to cover.
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
                  These are the learning areas the content model is built
                  around. The working prototype plays a subset of them
                  end-to-end and carries the rest as authored library entries or
                  district content still marked “Coming soon” — the app says
                  which is which rather than implying a finished catalogue.
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                  Alongside these sit the offline behaviours the districts
                  cover: peer pressure, dares, shop theft and holding something
                  for someone else.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {LEARNING_COVERAGE.map(([title, body, Icon]) => (
                  <li
                    key={title}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-surface-sunk px-4 py-3.5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[14px] font-extrabold leading-snug text-navy-900">
                        {title}
                      </p>
                      <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="districts" className="scroll-mt-24 bg-navy-950 text-white">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel tone="light">Four districts</SectionLabel>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-[720px] text-3xl font-black tracking-tight sm:text-4xl">
                One city, four learning contexts.
              </h2>
              <p className="max-w-[420px] text-[13px] leading-relaxed text-white/72">
                The themes describe the intended learning journey. Some district
                activities remain planned and are labelled “Coming soon” in the
                working prototype.
              </p>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2">
              {DISTRICTS.map((district, index) => {
                const skin = DISTRICT_SKIN[district.id];
                const Icon = skin.icon;
                return (
                  <article
                    key={district.id}
                    className="group overflow-hidden rounded-3xl border border-white/14 bg-white/7"
                  >
                    <div className="relative isolate h-[170px] overflow-hidden sm:h-[190px]">
                      <DistrictScene districtId={district.id} />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent"
                      />
                      <span className="absolute left-4 top-4 rounded-lg border border-white/30 bg-navy-950/76 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]">
                        District 0{index + 1}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-5">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${skin.plate}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-lg font-extrabold uppercase tracking-wide">
                          {district.name}
                        </h3>
                        <p className="mt-1 text-[13px] font-bold text-civic-200">
                          {DISTRICT_CHAPTER[district.id].title}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-white/75">
                          {district.theme}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel>Signature mechanics</SectionLabel>
            <h2 className="mt-3 max-w-[760px] text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
              Designed around choices, consequences and looking out for others.
            </h2>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FeatureCard
                icon={Clock3}
                eyebrow="Decision practice"
                title="Delayed Consequence Engine"
                body="Risky choices may initially look rewarding before later consequences reveal the warning signs and wider impact."
                tone="coral"
              />
              <FeatureCard
                icon={Vote}
                eyebrow="Facilitated discussion"
                title="Think · Vote · Explain"
                body="Learners think privately, lock in a vote, see how the group split, say what was behind their answer, then decide again. During facilitated sessions, rotating roles spread the participation. Hearing a peer's reason is what moves people—not being told the answer."
                tone="coral"
              />
              <FeatureCard
                icon={MessageCircleHeart}
                eyebrow="Peer intervention"
                title="Peer Shield"
                body="Players practise what they would do when a friend is entering a risky situation—without public scoring or comparison."
                tone="teal"
              />
              <FeatureCard
                icon={ShieldHalf}
                eyebrow="Prevention skills"
                title="Guardian System"
                body="Six Guardians—VeriFox, Echo, Cluepaw, ByteBuddy, Beacon and Shieldfin—each stand for one S.H.I.E.L.D. skill and strengthen only when that skill is practised."
                tone="amber"
              />
            </div>

            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-coral-200 bg-coral-50 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral-600 text-white">
                <UsersRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-coral-700">
                  Honest about Think · Vote · Explain
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                  In a facilitated room the group half of this mechanic is real
                  people. The working prototype runs it on a single device: the
                  private think, the vote, the reasoning and the second vote are
                  the learner’s own, and every figure attributed to a group is
                  an authored simulation, labelled as one on screen. There is no
                  live multiplayer, no session server and no participant data
                  behind it.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-700">
                <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
                Rotating facilitated roles
              </p>
              <p className="mt-1.5 max-w-[80ch] text-[14px] leading-relaxed text-ink-muted">
                In a facilitated session each participant holds a job for the
                round, and the jobs rotate — so the same young person is not
                always the one who speaks, and three readings of a situation
                reach the group before anyone has to agree.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {PEER_ROLES.map((role) => (
                  <li
                    key={role.id}
                    className="rounded-2xl border border-teal-200 bg-white px-4 py-3"
                  >
                    <p className="text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
                      {role.name}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
                      {role.purpose}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl border border-civic-200 bg-civic-50 px-5 py-4 text-[13px] leading-relaxed text-civic-800">
              <strong>Learning-linked Shield Tokens</strong> recognise activity
              completion and participation. They support expression inside the
              prototype; they are not money, a score of a young person or a
              reward for dice luck.
            </div>
          </div>
        </section>

        <section id="audience" className="scroll-mt-24 bg-amber-50">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel>Adaptive by age band</SectionLabel>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-[700px] text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                The same skills, pitched at the right age.
              </h2>
              <p className="max-w-[440px] text-[13px] leading-relaxed text-ink-muted">
                Content is tagged to an audience band, and the facilitator
                portal filters and targets by it. This is adaptive content
                design — the prototype demonstrates the targeting model, not a
                finished set of variants for every scenario.
              </p>
            </div>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LEARNER_SEGMENTS.map(({ band, note }) => (
                <li
                  key={band}
                  className="rounded-3xl border border-amber-200 bg-white p-5"
                >
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-700 tabular-nums">
                    {TARGET_GROUP_AGE[band]}
                  </p>
                  <h3 className="mt-1.5 text-[17px] font-extrabold leading-tight text-navy-950">
                    {band}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                    {note}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-amber-200 bg-white p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-900 text-white">
                <Printer className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-civic-700">
                  Planned pilot companion
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                  A printable offline board-game kit is planned as a companion
                  delivery mode for settings without devices, so a facilitator
                  can run the same districts, Situation Cards and Think · Vote ·
                  Explain rounds on a table. It is a future deliverable — there
                  is nothing to download today, and this prototype does not
                  pretend otherwise.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-civic-50">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel>S.H.I.E.L.D. framework</SectionLabel>
            <div className="mt-3 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                  Six actions players can carry beyond the screen.
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
                  Each activity points back to a simple prevention skill instead
                  of turning the learning into a points chase.
                </p>
              </div>
              <ol className="grid gap-2 sm:grid-cols-2">
                {COMPETENCY_ORDER.map((competency) => (
                  <li
                    key={competency}
                    className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-civic-200 bg-white px-4 py-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-base font-black text-white">
                      {COMPETENCY_LETTER[competency]}
                    </span>
                    <p className="min-w-0">
                      <span className="block text-[14px] font-extrabold text-navy-900">
                        {COMPETENCY_LABEL[competency]}
                      </span>
                      <span className="block text-[12px] font-semibold text-civic-700">
                        {guardianFor(competency)}
                      </span>
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel>One prototype, two views</SectionLabel>
            <h2 className="mt-3 max-w-[760px] text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
              The player journey and the content-management story connect.
            </h2>
            <div className="mt-9 grid gap-5 lg:grid-cols-2">
              <ExperienceCard
                icon={CircleUserRound}
                label="Player experience"
                title="ShieldQuest"
                body="Players navigate districts, encounter scenarios, make decisions and develop prevention skills."
                href="/game"
                cta="Play ShieldQuest"
                badge="Working youth PWA"
              />
              <ExperienceCard
                icon={UserRoundCog}
                label="Admin / facilitator experience"
                title="Scenario Management Portal"
                body="Demonstrates how reviewed scenarios can be added, monitored and updated without rebuilding the application."
                href="/admin"
                cta="View Scenario Management Portal"
                badge="Prototype admin view · simulated data"
              />
            </div>

            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-coral-200 bg-coral-50 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral-600 text-white">
                <Radar className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-coral-700">
                  Flash Mission connection
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                  The prototype demonstrates how an administrator can introduce
                  a new scenario and surface it to the youth experience as a City
                  Alert. This is a simulated product workflow—not a live police
                  intelligence or warning feed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="evidence" className="scroll-mt-24 bg-surface-sunk">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionLabel>Evidence-informed design</SectionLabel>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-[720px] text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                Gameplay is the lesson, not the wrapper.
              </h2>
              <p className="max-w-[460px] text-[13px] leading-relaxed text-ink-muted">
                Purposeful play, discussion and reflection are built into how
                ShieldQuest teaches, rather than added on top of a message as
                decorative gamification.
              </p>
            </div>

            <ol className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {EVIDENCE_PRINCIPLES.map(([title, body], index) => (
                <li
                  key={title}
                  className="rounded-3xl border border-line bg-white p-5 shadow-[0_18px_50px_-40px_rgba(11,37,69,0.8)]"
                >
                  <span className="text-[10px] font-extrabold tabular-nums text-civic-700">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-[15px] font-black uppercase leading-tight tracking-wide text-navy-950">
                    {title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                    {body}
                  </p>
                </li>
              ))}
            </ol>

            {/*
              Stated rather than dressed up. The proposal's evidence base is
              cited in the proposal itself; repeating a reference list here
              without the sources to hand would mean inventing publication
              details, which is a worse outcome than saying where they live.
            */}
            <p className="mt-5 max-w-[92ch] text-[13px] leading-relaxed text-ink-muted">
              These principles come from the Project SHIELD proposal's
              evidence-informed approach to youth crime prevention. The proposal
              carries the full reference list; the prototype has not completed a
              youth pilot and makes no claim of measured impact.
            </p>
          </div>
        </section>

        <section id="responsible-design" className="scroll-mt-24 bg-teal-50">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-20">
            <div>
              <SectionLabel>Responsible design</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                Prevention-focused by design.
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
                Project SHIELD is framed as a learning environment, not a system
                for judging, predicting or ranking young people.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {RESPONSIBLE_DESIGN.map((item) => (
                <li
                  key={item}
                  className="flex min-h-[62px] items-center gap-3 rounded-2xl border border-teal-200 bg-white px-4 py-3 text-[13px] font-bold text-navy-900"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-surface-sunk">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="rounded-[28px] border border-line bg-white p-5 shadow-[0_24px_70px_-50px_rgba(11,37,69,0.7)] sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
                <div>
                  <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-amber-100 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
                    <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
                    Working prototype
                  </span>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-navy-950 sm:text-4xl">
                    A transparent proof of concept.
                  </h2>
                  <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
                    The current build demonstrates the connected experience while
                    keeping unfinished district content visibly planned or coming
                    soon. It does not hide prototype limitations.
                  </p>
                </div>
                <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                  {PROTOTYPE_FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 border-b border-line py-2.5 text-[13px] font-semibold text-ink-muted"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-navy-900 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(242,174,51,0.24),transparent_46%),radial-gradient(circle_at_88%_18%,rgba(42,125,216,0.28),transparent_34%)]"
          />
          <div className="mx-auto max-w-[900px] px-4 py-16 text-center sm:px-6 lg:py-20">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-amber-400">
              Project SHIELD prototype
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Ready to explore Project SHIELD?
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[14px] leading-relaxed text-white/75">
              Enter the youth experience, then view the simulated facilitator
              workflow behind the prototype.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/game"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-[14px] font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-amber-300"
              >
                <Gamepad2 className="h-5 w-5" aria-hidden="true" />
                Play ShieldQuest
              </Link>
              <Link
                href="/admin"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/8 px-5 text-[13px] font-extrabold uppercase tracking-wide transition hover:border-white/50 hover:bg-white/12"
              >
                <Settings2 className="h-5 w-5" aria-hidden="true" />
                View scenario portal
              </Link>
            </div>
            <Link
              href="/game?presentation=1"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-[12px] font-bold text-civic-200 underline decoration-civic-400/50 underline-offset-4 transition hover:text-white"
            >
              <Presentation className="h-4 w-4" aria-hidden="true" />
              Open Presentation Mode
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-navy-950 text-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-400">
              Project SHIELD
            </p>
            <p className="mt-1 text-[13px] font-bold text-white/78">
              ShieldQuest · Choose Right. Protect Together.
            </p>
          </div>
          <p className="max-w-[560px] text-[11px] leading-relaxed text-white/72 md:text-right">
            Concept prototype for pitch, learning and portfolio demonstration.
            Simulated content and data. No official endorsement is implied.
          </p>
        </div>
      </footer>
    </div>
  );
}

/** The Guardian that stands for a S.H.I.E.L.D. skill. One-to-one, by design. */
function guardianFor(competency: Competency) {
  const guardian = MOCK_GUARDIANS.find((g) => g.competency === competency);
  return guardian ? `${guardian.name} · ${guardian.skill}` : "";
}

function SectionLabel({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${
        tone === "light" ? "text-amber-400" : "text-civic-700"
      }`}
    >
      {children}
    </p>
  );
}

function FeatureCard({
  icon: Icon,
  eyebrow,
  title,
  body,
  tone,
}: {
  icon: typeof BrainCircuit;
  eyebrow: string;
  title: string;
  body: string;
  tone: "coral" | "teal" | "amber";
}) {
  const palette = {
    coral: "border-coral-200 bg-coral-50 text-coral-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];

  return (
    <article className="rounded-3xl border border-line bg-white p-5 shadow-[0_18px_50px_-40px_rgba(11,37,69,0.8)]">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl border ${palette}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-lg font-black uppercase leading-tight tracking-wide text-navy-950">
        {title}
      </h3>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{body}</p>
    </article>
  );
}

function ExperienceCard({
  icon: Icon,
  label,
  title,
  body,
  href,
  cta,
  badge,
}: {
  icon: typeof CircleUserRound;
  label: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  badge: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-line bg-surface-sunk p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-900 text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-civic-700">
            {label}
          </p>
          <h3 className="mt-1 text-xl font-black text-navy-950">{title}</h3>
        </div>
      </div>
      <p className="mt-4 flex-1 text-[14px] leading-relaxed text-ink-muted">{body}</p>
      <p className="mt-4 inline-flex self-start rounded-lg border border-line bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
        {badge}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-center text-[12px] font-extrabold uppercase tracking-wide text-white transition hover:bg-navy-800"
      >
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
