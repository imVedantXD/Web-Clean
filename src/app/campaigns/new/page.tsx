import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lightbulb, ShieldCheck, Users, Zap } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { CampaignForm } from "@/components/campaign-form";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start a Campaign",
  description:
    "Rally your neighbourhood around a cause — publish a volunteering campaign on Sahayata Web and watch verified helpers join in real time.",
  robots: { index: false, follow: false },
};

const TIPS = [
  {
    icon: Lightbulb,
    title: "Be specific",
    text: "Exact venue, start time and what to bring — clarity gets signups.",
  },
  {
    icon: Users,
    title: "Right-size the ask",
    text: "Set a realistic volunteer count. Small full teams beat big empty ones.",
  },
  {
    icon: Zap,
    title: "It's instantly public",
    text: "The moment you publish, every visitor can see and join your drive.",
  },
  {
    icon: ShieldCheck,
    title: "Stay safe",
    text: "Meet in public places, brief volunteers, and respect local rules.",
  },
];

export default async function NewCampaignPage() {
  const user = await requireUser("/campaigns/new");
  if (!user.emailVerifiedAt) {
    redirect(`/auth/verify?email=${encodeURIComponent(user.email)}`);
  }

  return (
    <div className="relative overflow-clip">
      <div className="hero-grid-bg absolute inset-x-0 top-0 h-[360px] -z-10" />
      <div className="glow-orb -top-20 left-1/3 -z-10 h-80 w-80 bg-emerald-500/15 animate-float-slow" />

      <div className="container-x py-16 sm:py-20">
        <Reveal className="mb-12 max-w-2xl space-y-4">
          <span className="eyebrow">Lead the change</span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Start a <span className="gradient-text">community drive</span>
          </h1>
          <p className="text-lg text-mute">
            Namaste, {user.name.split(" ")[0]}. Describe the need, set the plan,
            and publish — volunteers across India will see it immediately.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Reveal delay={0.08}>
            <div className="card-glow p-7 sm:p-9">
              <CampaignForm />
            </div>
          </Reveal>

          <div className="space-y-4">
            {TIPS.map((t, i) => (
              <Reveal key={t.title} delay={0.12 + i * 0.06}>
                <div className="card-glow flex gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{t.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-mute">
                      {t.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
