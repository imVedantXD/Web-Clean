import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, BarChart3, HandHeart, Layers3, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { AshaFuelForm } from "@/components/ashafuel-form";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "AshaFuel — Power the Next Good Thing",
  description: "AshaFuel turns small contributions into visible, local community impact through Sahayata Web.",
  alternates: { canonical: "/support" },
};

const FEATURES = [
  { icon: Layers3, title: "Directed by need", text: "Support is routed toward active local drives, from meal kits to health camps." },
  { icon: BarChart3, title: "See the ripple", text: "Every contribution gets an impact estimate, a clear split, and a reference." },
  { icon: ShieldCheck, title: "Trust is visible", text: "Verified organisers, protected checkout handoff, and a receipt for every supporter." },
];

export default function SupportPage() {
  return (
    <div className="relative overflow-clip">
      <div className="hero-grid-bg absolute inset-x-0 top-0 h-[560px] -z-10" />
      <div className="glow-orb -top-20 right-1/4 -z-10 h-96 w-96 bg-emerald-500/20 animate-float-slow" />
      <section className="container-x py-16 sm:py-24"><div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"><Reveal className="max-w-xl space-y-7 lg:sticky lg:top-28"><span className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> A new way to back good work</span><h1 className="font-display text-5xl leading-[1.05] font-extrabold tracking-tight text-ink sm:text-6xl">Put power behind the <span className="gradient-text">next good thing.</span></h1><p className="text-lg leading-relaxed text-mute"><strong className="text-ink">AshaFuel</strong> is Sahayata Web&apos;s contribution layer: a simple, transparent way to keep community drives resourced after the volunteer signups begin.</p><div className="flex flex-wrap gap-3 text-xs font-bold tracking-wide text-faint uppercase"><span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-500" /> Verified drives</span><span className="inline-flex items-center gap-2"><HandHeart className="h-4 w-4 text-rose-400" /> Local impact</span></div><div className="rounded-2xl border border-line bg-elev/70 p-5"><p className="text-sm font-bold text-ink">The idea is intentionally simple.</p><p className="mt-2 text-sm leading-relaxed text-mute">You choose the amount and rhythm. Organisers keep doing the work. Sahayata keeps the connection clear.</p></div></Reveal><Reveal delay={0.12}><AshaFuelForm /></Reveal></div></section>
      <section className="border-y border-line bg-elev py-20"><div className="container-x"><Reveal className="mb-10 max-w-2xl space-y-4"><span className="eyebrow"><Users className="h-3.5 w-3.5" /> More than a checkout</span><h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">A contribution should feel <span className="gradient-text">connected.</span></h2></Reveal><div className="grid gap-5 md:grid-cols-3">{FEATURES.map((feature, index) => <Reveal key={feature.title} delay={index * 0.08}><div className="card-glow h-full p-7"><span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25"><feature.icon className="h-5 w-5" /></span><h3 className="font-display text-lg font-bold text-ink">{feature.title}</h3><p className="mt-2 text-sm leading-relaxed text-mute">{feature.text}</p></div></Reveal>)}</div></div></section>
      <section className="container-x py-20"><div className="card-glow flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center"><div><p className="text-xs font-bold tracking-[0.16em] text-emerald-500 uppercase">Keep exploring</p><h2 className="mt-2 font-display text-2xl font-extrabold text-ink">Find a drive that needs people power.</h2></div><Link href="/campaigns" className="btn btn-outline">Browse campaigns <ArrowRight className="h-4 w-4" /></Link></div></section>
    </div>
  );
}