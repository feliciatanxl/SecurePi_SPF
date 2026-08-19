import Link from "next/link";
import { ArrowRight, Gamepad2, LayoutDashboard, Shield, Users } from "lucide-react";

const VIEWS = [
  {
    href: "/play",
    icon: Gamepad2,
    tag: "View 1 · Player",
    title: "Scenario Encounter",
    body: "You are the target. A stranger offers S$300 to receive money into your bank account. Choose Accept and the reward lands instantly — the bill arrives three seconds later.",
  },
  {
    href: "/peer-shield",
    icon: Users,
    tag: "View 2 · Bystander",
    title: "Peer Shield Mode",
    body: "Same threat, different seat. Your friend has already sent his account number. Constructive intervention earns Community Resilience Points; silence costs them.",
  },
  {
    href: "/admin",
    icon: LayoutDashboard,
    tag: "View 3 · SPF",
    title: "Scenario Management Portal",
    body: "The operational console. Live efficacy data by cohort, and a no-code Flash Mission form that puts an emerging scam trend in front of youths without a release cycle.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#16213a_0%,#05080f_65%)]">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-shield-600/20 ring-1 ring-shield-500/40">
            <Shield className="h-5 w-5 text-shield-400" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight">
              Shield<span className="text-shield-400">Quest</span>
            </p>
            <p className="text-xs text-slate-500">
              Interactive prototype · mock data
            </p>
          </div>
        </div>

        <h1 className="mt-10 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Crime prevention you{" "}
          <span className="text-shield-400">practise</span>, not a talk you sit
          through.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
          Singapore youths already know the rules. The gap is retrieving them in
          the three seconds that matter — under peer pressure, on a deadline,
          with a reward on the table. ShieldQuest rehearses that moment.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {VIEWS.map(({ href, icon: Icon, tag, title, body }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-white/10 bg-ink-900/60 p-5 transition hover:border-shield-500/40 hover:bg-ink-850 focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-400"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <Icon className="h-4 w-4 text-shield-400" />
              </span>
              <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {tag}
              </span>
              <span className="mt-1 text-base font-bold text-white">
                {title}
              </span>
              <span className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">
                {body}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-shield-400">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-14 max-w-2xl text-xs leading-relaxed text-slate-600">
          Prototype note: all data is hardcoded in{" "}
          <code className="rounded bg-white/5 px-1 py-0.5 text-slate-500">
            src/lib/api/mock-data.ts
          </code>{" "}
          and served through the{" "}
          <code className="rounded bg-white/5 px-1 py-0.5 text-slate-500">
            ShieldQuestApi
          </code>{" "}
          interface, so the UI can be pointed at the real Node.js backend by
          swapping a single implementation class.
        </p>
      </div>
    </div>
  );
}
