import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import {
  Award,
  CalendarHeart,
  Heart,
  LogIn,
  MailWarning,
  Network,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { volunteerProfiles } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { VolunteerForm } from "@/components/volunteer-form";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Volunteer — Join India's Seva Movement",
  description:
    "Register as a Sahayata Web volunteer. Pick your causes — senior care, food donation, cleanups, education, health — set your availability, and start changing your city today.",
  alternates: { canonical: "/volunteer" },
};

const PERKS = [
  {
    icon: CalendarHeart,
    title: "Serve on your schedule",
    text: "Weekend warrior or weekday hero — pick drives that fit your life.",
  },
  {
    icon: Network,
    title: "Meet your people",
    text: "Join a warm community of students, professionals and retirees who care.",
  },
  {
    icon: TrendingUp,
    title: "Grow real skills",
    text: "Leadership, organising, communication — service teaches what books can't.",
  },
  {
    icon: Award,
    title: "Track your impact",
    text: "Your dashboard counts every drive and hour of good you put in.",
  },
];

export default async function VolunteerPage() {
  const user = await getSessionUser();
  let profile = null;
  if (user) {
    const rows = await db
      .select()
      .from(volunteerProfiles)
      .where(eq(volunteerProfiles.userId, user.id))
      .limit(1);
    profile = rows[0] ?? null;
  }

  return (
    <div className="relative overflow-clip">
      <div className="hero-grid-bg absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="glow-orb -top-24 left-1/4 -z-10 h-96 w-96 bg-emerald-500/20 animate-float-slow" />
      <div className="glow-orb top-40 right-0 -z-10 h-80 w-80 bg-amber-400/10 animate-float" />

      <div className="container-x py-16 sm:py-20">
        <Reveal className="mb-12 max-w-3xl space-y-5">
          <span className="eyebrow">
            <Heart className="h-3.5 w-3.5" /> Become a volunteer
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
            The cape is optional.
            <br />
            <span className="gradient-text">The heart isn&apos;t.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-mute">
            Register once, choose the causes that move you, and get matched with
            campaigns in your city. No fees, no forms in triplicate — just seva.
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-4">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.07}>
                <div className="card-glow flex gap-4 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_10px_26px_-8px_rgba(16,185,129,0.6)]">
                    <p.icon className="h-5 w-5" strokeWidth={2.3} />
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-bold text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-mute">
                      {p.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <div className="card flex items-center gap-3 border-emerald-500/25 bg-emerald-500/5 p-5">
                <Sparkles className="h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-[13px] leading-relaxed text-mute">
                  <span className="font-bold text-ink">Students:</span> volunteering
                  hours look brilliant on portfolios — and even better on your soul.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            {!user ? (
              <div className="card-glow flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/30">
                  <LogIn className="h-7 w-7" />
                </span>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  First, create your free account
                </h2>
                <p className="max-w-sm text-sm text-mute">
                  Volunteers need a verified Sahayata Web account — it keeps the
                  community safe for everyone. Takes under a minute.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/auth/signup" className="btn btn-primary">
                    Create account
                  </Link>
                  <Link href="/auth/signin?next=/volunteer" className="btn btn-outline">
                    Sign in
                  </Link>
                </div>
              </div>
            ) : !user.emailVerifiedAt ? (
              <div className="card-glow flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/12 text-amber-500 ring-1 ring-amber-500/30">
                  <MailWarning className="h-7 w-7" />
                </span>
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  Verify your email first
                </h2>
                <p className="max-w-sm text-sm text-mute">
                  We sent a 6-digit code to{" "}
                  <span className="font-bold text-ink">{user.email}</span>. Enter it
                  to unlock volunteering.
                </p>
                <Link
                  href={`/auth/verify?email=${encodeURIComponent(user.email)}`}
                  className="btn btn-primary"
                >
                  Enter verification code
                </Link>
              </div>
            ) : (
              <VolunteerForm
                initial={
                  profile
                    ? {
                        city: profile.city,
                        phone: profile.phone,
                        interests: profile.interests,
                        availability: profile.availability,
                        bio: profile.bio,
                      }
                    : { city: user.city ?? "", phone: null, interests: [], availability: "Weekends", bio: null }
                }
              />
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
