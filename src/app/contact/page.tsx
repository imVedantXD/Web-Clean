import type { Metadata } from "next";
import { Clock3, Headset, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions, partnerships or ideas for Sahayata Web? Reach the team — we read every message about volunteering, campaigns and community impact.",
  alternates: { canonical: "/contact" },
};

const CARDS = [
  {
    icon: Mail,
    title: "Email us",
    value: "hello@sahayataweb.in",
    sub: "For partnerships, schools & NGOs",
  },
  {
    icon: Clock3,
    title: "Response time",
    value: "2–3 working days",
    sub: "Every message is read by a human",
  },
  {
    icon: MapPin,
    title: "Based in",
    value: "Bharat (India)",
    sub: "Serving every pin code, digitally",
  },
];

export default function ContactPage() {
  return (
    <div className="relative overflow-clip">
      <div className="hero-grid-bg absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="glow-orb -top-24 left-1/3 -z-10 h-96 w-96 bg-emerald-500/20 animate-float-slow" />

      <div className="container-x py-16 sm:py-20">
        <Reveal className="mb-12 max-w-2xl space-y-5">
          <span className="eyebrow">
            <Headset className="h-3.5 w-3.5" /> We&apos;re listening
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
            Say <span className="gradient-text">namaste</span>
          </h1>
          <p className="text-lg text-mute">
            Ideas, feedback, school partnerships, or a cause that needs a
            spotlight — drop us a line and it lands straight in our inbox.
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.07}>
                <div className="card-glow flex gap-4 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.16em] text-faint uppercase">
                      {c.title}
                    </p>
                    <p className="font-display text-lg font-bold text-ink">{c.value}</p>
                    <p className="text-[13px] text-mute">{c.sub}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.25}>
              <div className="card border-emerald-500/25 bg-emerald-500/5 p-6">
                <h3 className="font-display text-sm font-bold text-ink">
                  Want to bring Sahayata Web to your school or society?
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-mute">
                  Mention your institution in the message — we&apos;ll help you
                  launch your first community drive, end to end.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
