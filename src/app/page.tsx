import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Compass,
  HeartHandshake,
  HelpCircle,
  MapPinned,
  MousePointerClick,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { getFeaturedCampaigns, getStats } from "@/lib/queries";
import { CATEGORY_META, SITE, cn, type CategoryId } from "@/lib/utils";
import { CampaignCard } from "@/components/campaign-card";
import { Counter, Reveal } from "@/components/motion";

const FAQS = [
  {
    q: "What is Sahayata Web?",
    a: "Sahayata Web is a Digital India volunteer platform that connects everyday heroes with real community needs across India — food donation, senior citizen care, neighbourhood cleanups, education tutoring, and health drives.",
  },
  {
    q: "How do I volunteer for a campaign near me?",
    a: "Simply sign up for a free account, browse live campaigns by city or category, and tap 'Explore campaigns' to join. You'll receive instant event updates and email notifications.",
  },
  {
    q: "Is Sahayata Web completely free to use?",
    a: "Yes! Sahayata Web is 100% free for volunteers, community leaders, schools, and NGOs across Bharat.",
  },
  {
    q: "How can I start a community drive in my city?",
    a: "Click 'Start a campaign', enter your cause details, date, location, and volunteer requirement, and publish instantly. Your campaign will go live on the national directory.",
  },
  {
    q: "Who created Sahayata Web?",
    a: "Sahayata Web was designed and engineered by Vedant Pandey, a Class IX student in India, as a high-impact, student-built Digital India solution.",
  },
];

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sahayata Web — Connect Volunteers with Community Needs in India",
  description: SITE.description,
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    text: "Sign up in seconds with verified email or Google. Your identity stays safe, always.",
  },
  {
    icon: Search,
    title: "Find a cause nearby",
    text: "Browse live campaigns by city and category — elder care, food drives, cleanups and more.",
  },
  {
    icon: HeartHandshake,
    title: "Show up & serve",
    text: "Join with one tap, coordinate with organizers, and watch your impact counter grow.",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verified community",
    text: "Email-verified accounts and protected sessions keep the platform trustworthy.",
  },
  {
    icon: Zap,
    title: "Real-time impact",
    text: "Every signup updates live for everyone — no refresh races, no stale lists.",
  },
  {
    icon: MapPinned,
    title: "Hyperlocal first",
    text: "Discover needs in your own mohalla, ward or city — seva begins next door.",
  },
  {
    icon: BadgeCheck,
    title: "Student-built, India-proud",
    text: "Engineered by a Class IX student as a working Digital India solution.",
  },
];

export default async function HomePage() {
  const [stats, featured] = await Promise.all([
    getStats(),
    getFeaturedCampaigns(3),
  ]);

  const statItems = [
    { label: "Verified members", value: stats.members, icon: Users, suffix: "+" },
    { label: "Live campaigns", value: stats.activeCampaigns, icon: CalendarClock, suffix: "" },
    { label: "Volunteer signups", value: stats.signups, icon: HeartHandshake, suffix: "+" },
    { label: "Cities covered", value: stats.cities, icon: MapPinned, suffix: "" },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div className="noise relative overflow-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative">
        <div className="hero-grid-bg absolute inset-0 -z-10" />
        <div className="glow-orb -top-32 left-1/2 -z-10 h-[480px] w-[720px] -translate-x-1/2 bg-emerald-500/25 animate-float-slow" />
        <div className="glow-orb top-40 -left-40 -z-10 h-96 w-96 bg-teal-500/20 animate-float" />
        <div className="glow-orb top-64 -right-40 -z-10 h-96 w-96 bg-amber-400/15 animate-float" />

        <div className="container-x grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <div className="space-y-8">
            <Reveal>
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Digital India · Community-first platform
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display text-5xl leading-[1.04] font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Small acts.
                <br />
                <span className="gradient-text">Massive change.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="max-w-xl text-lg leading-relaxed text-mute">
                Sahayata Web connects everyday heroes with real community needs —
                senior citizen care, food donation, neighbourhood cleanups,
                teaching and health camps. Find your cause, join a drive, and
                transform your city.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/campaigns" className="btn btn-primary text-base">
                  <Compass className="h-5 w-5" />
                  Explore campaigns
                </Link>
                <Link href="/volunteer" className="btn btn-outline text-base">
                  Become a volunteer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-faint uppercase">
                <MousePointerClick className="h-4 w-4 text-emerald-500" />
                Free forever · Open to every citizen · Built for Bharat
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="relative">
            <div className="relative mx-auto max-w-[520px]">
              <div className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-br from-emerald-500/30 via-teal-500/10 to-transparent blur-2xl" />
              <div className="card-glow overflow-hidden rounded-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero.svg"
                  alt="Indian volunteers working together on a community drive"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              </div>

              <div className="card glass absolute -bottom-6 -left-4 flex items-center gap-3 !rounded-2xl px-4 py-3 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.5)] animate-float sm:-left-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-lg leading-none font-extrabold text-ink">
                    <Counter value={stats.members + stats.signups} suffix="+" />
                  </p>
                  <p className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                    Community heroes
                  </p>
                </div>
              </div>

              <div className="card glass absolute -top-5 -right-3 flex items-center gap-3 !rounded-2xl px-4 py-3 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.5)] animate-float-slow sm:-right-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-lg leading-none font-extrabold text-ink">
                    <Counter value={stats.activeCampaigns} />
                  </p>
                  <p className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                    Drives happening now
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* --------------------------- STATS BAND --------------------------- */}
        <div className="container-x pb-6">
          <Reveal>
            <div className="card grid grid-cols-2 gap-y-8 px-6 py-8 sm:px-10 lg:grid-cols-4">
              {statItems.map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                      <Counter value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------- CATEGORY MARQUEE ------------------------- */}
      <section className="overflow-hidden border-y border-line bg-elev py-5" aria-hidden="true">
        <div className="flex w-max gap-10 animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10">
              {(Object.keys(CATEGORY_META) as CategoryId[]).map((id) => {
                const m = CATEGORY_META[id];
                return (
                  <span
                    key={`${dup}-${id}`}
                    className="flex items-center gap-2.5 text-sm font-bold tracking-[0.2em] text-faint uppercase"
                  >
                    <m.icon className="h-4 w-4 text-emerald-500" />
                    {m.label}
                    <span className="ml-6 h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------- CATEGORIES ---------------------------- */}
      <section className="container-x py-24">
        <Reveal className="mb-14 max-w-2xl space-y-4">
          <span className="eyebrow">Causes that matter</span>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Choose where your{" "}
            <span className="gradient-text">heart leads</span>
          </h2>
          <p className="text-lg text-mute">
            Five battlefronts of everyday seva — each powered by neighbours who
            refuse to look away.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(CATEGORY_META) as CategoryId[]).map((id, i) => {
            const m = CATEGORY_META[id];
            return (
              <Reveal key={id} delay={i * 0.07} className={cn(i === 0 && "lg:col-span-2")}>
                <Link
                  href={`/campaigns?category=${id}`}
                  className={cn(
                    "card-glow group relative block h-full min-h-[220px] overflow-hidden",
                    i === 0 && "min-h-[260px]"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image}
                    alt={m.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-500" />
                  <div className="relative flex h-full flex-col justify-end gap-2 p-6">
                    <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", m.gradient)}>
                      <m.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-xl font-extrabold text-white">
                      {m.label}
                    </h3>
                    <p className="max-w-md text-sm text-white/75">{m.tagline}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-300 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Explore drives <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------ FEATURED CAMPAIGNS ------------------------ */}
      <section className="relative border-y border-line bg-elev py-24">
        <div className="glow-orb top-0 right-0 h-80 w-80 bg-teal-500/10" />
        <div className="container-x">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <span className="eyebrow">Happening near you</span>
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Live campaigns, <span className="gradient-text">updated in real time</span>
              </h2>
            </div>
            <Link href="/campaigns" className="btn btn-outline">
              View all campaigns <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          {featured.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((c, i) => (
                <CampaignCard
                  key={c.campaign.id}
                  campaign={c.campaign}
                  organizerName={c.organizerName}
                  joined={c.joined}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="card flex flex-col items-center gap-4 px-8 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h3 className="font-display text-2xl font-bold text-ink">
                  Be the first spark
                </h3>
                <p className="max-w-md text-mute">
                  No campaigns yet in the directory. Start one today and rally
                  your whole neighbourhood behind it.
                </p>
                <Link href="/campaigns/new" className="btn btn-primary">
                  Start a campaign <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ---------------------------- HOW IT WORKS --------------------------- */}
      <section className="container-x py-24">
        <Reveal className="mb-14 max-w-2xl space-y-4">
          <span className="eyebrow">Effortless by design</span>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Three steps to <span className="gradient-text">your first seva</span>
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="card-glow group relative h-full overflow-hidden p-7">
                <span className="font-display absolute -top-4 right-4 text-7xl font-extrabold text-emerald-500/8 transition-colors duration-500 group-hover:text-emerald-500/15">
                  0{i + 1}
                </span>
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-3.5 text-emerald-950 shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <s.icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <h3 className="font-display mt-5 text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------- WHY / VALUES -------------------------- */}
      <section className="relative border-y border-line bg-elev py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="space-y-6">
            <span className="eyebrow">Why Sahayata Web</span>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              A digital bridge between{" "}
              <span className="gradient-text">kindness and need</span>
            </h2>
            <p className="text-lg leading-relaxed text-mute">
              India has no shortage of willing hearts — only a shortage of
              coordination. Sahayata Web is Digital India in action: a secure,
              real-time platform that turns good intentions into organised
              street-level impact.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="card-glow p-5 transition-transform duration-300"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-3 text-[15px] font-bold text-ink">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-mute">
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-br from-teal-500/25 via-emerald-500/10 to-transparent blur-2xl" />
            <div className="card-glow overflow-hidden rounded-[28px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/campaigns/cleanup.svg"
                alt="Volunteers cleaning a public park together"
                className="aspect-[4/5] w-full object-cover sm:aspect-square"
                loading="lazy"
              />
            </div>
            <div className="card glass absolute -bottom-6 left-6 right-6 flex items-center justify-between gap-4 !rounded-2xl px-5 py-4 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">End-to-end secure</p>
                  <p className="text-[11px] text-faint">Verified emails · Encrypted sessions</p>
                </div>
              </div>
              <Link href="/about" className="text-[13px] font-bold text-emerald-500 hover:underline">
                Our story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- FAQ SECTION ---------------------------- */}
      <section className="container-x py-24">
        <Reveal className="mb-14 max-w-2xl space-y-4">
          <span className="eyebrow">
            <HelpCircle className="h-3.5 w-3.5" /> Frequently asked questions
          </span>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Everything you need to <span className="gradient-text">know</span>
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.08}>
              <div className="card-glow p-6 sm:p-8">
                <h3 className="font-display text-lg font-extrabold text-ink">
                  {faq.q}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">
                  {faq.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------- CTA -------------------------------- */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-8 py-16 text-center shadow-[0_40px_120px_-30px_rgba(16,185,129,0.5)] sm:px-16">
            <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 0, transparent 30%), radial-gradient(circle at 80% 70%, white 0, transparent 30%)" }} />
            <div className="relative mx-auto max-w-2xl space-y-6">
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Your neighbourhood needs you. Today.
              </h2>
              <p className="text-lg text-emerald-50/90">
                Join Sahayata Web — it takes less time than brewing chai. Find a
                campaign or start your own, and watch your city change.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="btn !bg-white !font-bold !text-emerald-700 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]"
                >
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/campaigns"
                  className="btn border border-white/40 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Browse campaigns
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
