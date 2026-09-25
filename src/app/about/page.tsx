import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Flag,
  GraduationCap,
  Heart,
  HeartHandshake,
  Lightbulb,
  Quote,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { getStats } from "@/lib/queries";
import { Counter, Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Story — Built for Bharat, by a Student",
  description:
    "Sahayata Web is a student-built, working Digital India solution connecting volunteers with community needs — senior care, food donation, cleanups and more. Read the story behind the platform.",
  alternates: { canonical: "/about" },
};

const PILLARS = [
  {
    icon: Users,
    title: "Digital infrastructure for seva",
    text: "Just as UPI digitised payments, Sahayata Web digitises community volunteering — discovery, coordination and trust, all online.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by design",
    text: "Verified emails, encrypted sessions and rate-limited APIs make doing good safe for every citizen.",
  },
  {
    icon: Zap,
    title: "Real-time citizen power",
    text: "A campaign posted in Jaipur is instantly visible in Mumbai. One platform, one connected Bharat.",
  },
];

const STACK = [
  "Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "Node.js",
];

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <div className="relative overflow-clip">
      <div className="hero-grid-bg absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="glow-orb -top-24 right-1/4 -z-10 h-96 w-96 bg-emerald-500/20 animate-float-slow" />

      {/* ------------------------------- Hero -------------------------------- */}
      <section className="container-x py-20 sm:py-24">
        <Reveal className="max-w-3xl space-y-6">
          <span className="eyebrow">
            <HeartHandshake className="h-3.5 w-3.5" /> Our story
          </span>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
            Kindness was always there.
            <br />
            <span className="gradient-text">Coordination wasn&apos;t.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-mute">
            Every street has someone who needs help and someone who wants to
            give it — they simply never meet. Sahayata Web is that meeting
            point: a secure, real-time platform where local needs find local
            heroes.
          </p>
        </Reveal>
      </section>

      {/* -------------------------- Problem → Solution ------------------------ */}
      <section className="container-x pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card-glow h-full p-8">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-400 ring-1 ring-rose-500/25">
                <Target className="h-6 w-6" />
              </span>
              <h2 className="font-display text-2xl font-extrabold text-ink">The problem</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-mute">
                <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" /> Elders wait days for small errands while helpers live next door.</li>
                <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" /> Food drives and cleanups are announced on WhatsApp groups nobody reads.</li>
                <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" /> Students want to serve but have no trusted, organised channel.</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-glow h-full p-8">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25">
                <Lightbulb className="h-6 w-6" />
              </span>
              <h2 className="font-display text-2xl font-extrabold text-ink">The solution</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-mute">
                <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" /> A public, searchable directory of live campaigns — by city and cause.</li>
                <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" /> One-tap joining with verified accounts, visible to everyone instantly.</li>
                <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" /> Dashboards that turn scattered goodwill into measurable community impact.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- Digital India --------------------------- */}
      <section className="border-y border-line bg-elev py-20">
        <div className="container-x">
          <Reveal className="mb-12 max-w-2xl space-y-4">
            <span className="eyebrow">
              <Flag className="h-3.5 w-3.5" /> Aligned with Digital India
            </span>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Technology that <span className="gradient-text">serves the server</span>
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="card-glow h-full p-7">
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_10px_26px_-8px_rgba(16,185,129,0.6)]">
                    <p.icon className="h-5 w-5" strokeWidth={2.3} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Creator ------------------------------- */}
      <section className="container-x py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="card-glow relative overflow-hidden p-8 text-center">
              <div className="glow-orb -top-10 left-1/2 h-56 w-56 -translate-x-1/2 bg-emerald-500/25" />
              <span className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 font-display text-3xl font-extrabold text-emerald-950 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.7)]">
                VP
              </span>
              <h3 className="font-display text-2xl font-extrabold text-ink">
                Vedant Pandey
              </h3>
              <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
                <GraduationCap className="h-3.5 w-3.5" /> Class IX · Student Developer
              </p>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-mute">
                Designer, engineer and the entire product team of Sahayata Web —
                built as a working solution for the community problems around him.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="space-y-6">
            <Quote className="h-10 w-10 text-emerald-500/40" />
            <blockquote className="font-display text-2xl leading-snug font-bold text-ink sm:text-3xl">
              &ldquo;If a Class IX student can build a secure, real-time platform
              for community service — imagine what a billion connected Indians
              can do. Sahayata Web is my small answer to a big question:
              <span className="gradient-text"> what is technology for, if not for each other?</span>&rdquo;
            </blockquote>
            <div className="divider" />
            <div>
              <p className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-faint uppercase">
                <Cpu className="h-4 w-4 text-emerald-500" /> Crafted with a modern, secure stack
              </p>
              <div className="flex flex-wrap gap-2">
                {STACK.map((s) => (
                  <span key={s} className="chip border-line text-mute">{s}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ Live counts ---------------------------- */}
      <section className="container-x pb-20">
        <Reveal>
          <div className="card grid grid-cols-2 gap-6 px-8 py-10 text-center sm:grid-cols-4">
            {[
              { label: "Verified members", value: stats.members },
              { label: "Live campaigns", value: stats.activeCampaigns },
              { label: "Volunteer signups", value: stats.signups },
              { label: "Cities reached", value: stats.cities },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-extrabold text-emerald-500 sm:text-4xl">
                  <Counter value={s.value} suffix="+" />
                </p>
                <p className="mt-1 text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-10 overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-8 py-14 text-center shadow-[0_40px_120px_-30px_rgba(16,185,129,0.5)]">
            <div className="relative mx-auto max-w-xl space-y-5">
              <BookOpen className="mx-auto h-8 w-8 text-emerald-100" />
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                The story continues with you
              </h2>
              <p className="text-emerald-50/90">
                Every hero on this platform started as a reader. Take the next step.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/signup" className="btn !bg-white !font-bold !text-emerald-700 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5">
                  Join Sahayata Web <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/campaigns" className="btn border border-white/40 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10">
                  See live campaigns
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-x pb-8 text-center">
        <p className="inline-flex items-center gap-1.5 text-sm text-faint">
          Made with <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> by
          <span className="font-bold text-ink">Vedant Pandey</span>, Class IX — for a kinder, more connected India.
        </p>
      </section>
    </div>
  );
}
