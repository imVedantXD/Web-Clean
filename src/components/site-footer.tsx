import Link from "next/link";
import {
  AtSign,
  Flag,
  Globe,
  Heart,
  HeartHandshake,
  MessageCircle,
  Share2,
} from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { SITE } from "@/lib/utils";

const PLATFORM = [
  { href: "/campaigns", label: "Browse campaigns" },
  { href: "/volunteer", label: "Become a volunteer" },
  { href: "/campaigns/new", label: "Start a campaign" },
  { href: "/dashboard", label: "My dashboard" },
];

const CAUSES = [
  { href: "/campaigns?category=senior-care", label: "Senior citizen care" },
  { href: "/campaigns?category=food-relief", label: "Food donation" },
  { href: "/campaigns?category=cleanup", label: "Neighbourhood cleanup" },
  { href: "/campaigns?category=education", label: "Education & mentorship" },
  { href: "/campaigns?category=health", label: "Health & wellness" },
];

const COMPANY = [
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact us" },
  { href: "/auth/signup", label: "Create account" },
  { href: "/auth/signin", label: "Sign in" },
];

const SOCIALS = [
  { href: "https://x.com", icon: AtSign, label: "X (Twitter)" },
  { href: "https://instagram.com", icon: Globe, label: "Instagram" },
  { href: "https://linkedin.com", icon: Share2, label: "LinkedIn" },
  { href: "https://github.com", icon: MessageCircle, label: "GitHub" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line bg-elev">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_8px_24px_-6px_rgba(16,185,129,0.6)]">
              <HeartHandshake className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Sahayata<span className="gradient-text"> Web</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-mute">
            {SITE.description.split(" — ")[0]} — one neighbourhood at a time.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-500">
            <Flag className="h-3.5 w-3.5" /> Proudly powering Digital India
          </div>
          <div className="flex gap-2 pt-1">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-mute transition-all duration-300 hover:border-emerald-500/50 hover:text-emerald-500 hover:shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)]"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          { title: "Platform", links: PLATFORM },
          { title: "Causes", links: CAUSES },
          { title: "Company", links: COMPANY },
        ].map((col) => (
          <nav key={col.title} aria-label={col.title} className="space-y-4">
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-faint uppercase">
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-mute transition-all duration-200 hover:pl-1 hover:text-emerald-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-start justify-between gap-5 py-6 md:flex-row md:items-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-faint uppercase">
              Weekly seva digest
            </p>
            <p className="text-sm text-mute">
              New campaigns near you, once a week. No spam — promise.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-center text-[13px] text-faint md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} Sahayata Web · Seva, made simple.
          </p>
          <p className="inline-flex flex-wrap items-center justify-center gap-1.5">
            Designed & engineered with
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            by <span className="font-semibold text-ink">Vedant Pandey</span>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-500">
              Class IX
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
