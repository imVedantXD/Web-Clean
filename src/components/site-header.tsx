"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  HeartHandshake,
  LayoutDashboard,
  LogIn,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/support", label: "AshaFuel" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type HeaderUser = { name: string; email: string; avatarUrl: string | null } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "glass sticky top-0 z-50 border-b transition-shadow duration-300",
        scrolled && "shadow-[0_8px_40px_-16px_rgba(0,0,0,0.45)]"
      )}
    >
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Sahayata Web — home">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_8px_24px_-6px_rgba(16,185,129,0.6)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <HeartHandshake className="h-5 w-5" strokeWidth={2.4} />
            <span className="absolute -inset-1 -z-10 rounded-2xl bg-emerald-400/30 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Sahayata<span className="gradient-text"> Web</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn("nav-link", pathname === l.href && "active")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href="/campaigns/new"
                className="btn btn-primary hidden !px-4 !py-2 text-[13px] sm:inline-flex"
              >
                <Plus className="h-4 w-4" /> Start a drive
              </Link>
              <Link
                href="/dashboard"
                title="Open your dashboard"
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-elev py-1 pr-3 pl-1 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_24px_-6px_rgba(16,185,129,0.6)]"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="avatar-initials h-8 w-8 text-[11px]">
                    {initials(user.name)}
                  </span>
                )}
                <span className="hidden max-w-[110px] truncate text-[13px] font-semibold text-ink md:block">
                  {user.name.split(" ")[0]}
                </span>
                <LayoutDashboard className="hidden h-3.5 w-3.5 text-faint transition-colors group-hover:text-emerald-500 md:block" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn btn-outline hidden !px-4 !py-2 text-[13px] sm:inline-flex">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/auth/signup" className="btn btn-primary !px-4 !py-2 text-[13px]">
                Join the movement
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-elev text-ink transition-colors hover:border-emerald-500/50 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn("nav-link !py-3", pathname === l.href && "active")}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                {user ? (
                  <Link href="/campaigns/new" className="btn btn-primary flex-1 !py-2.5 text-sm">
                    <Plus className="h-4 w-4" /> Start a drive
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin" className="btn btn-outline flex-1 !py-2.5 text-sm">
                      Sign in
                    </Link>
                    <Link href="/auth/signup" className="btn btn-primary flex-1 !py-2.5 text-sm">
                      Join us
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
