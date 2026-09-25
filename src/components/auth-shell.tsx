import Link from "next/link";
import type { ReactNode } from "react";
import { HeartHandshake } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-68px)] items-center justify-center overflow-clip py-14">
      <div className="hero-grid-bg absolute inset-0 -z-10" />
      <div className="glow-orb -top-24 left-1/4 -z-10 h-96 w-96 bg-emerald-500/20 animate-float-slow" />
      <div className="glow-orb bottom-0 right-1/4 -z-10 h-96 w-96 bg-teal-500/15 animate-float" />

      <div className="w-full max-w-md px-5">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="group flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-[0_16px_40px_-8px_rgba(16,185,129,0.7)] transition-transform duration-300 hover:rotate-6 hover:scale-105">
            <HeartHandshake className="h-7 w-7" strokeWidth={2.4} />
          </Link>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            {title}
          </h1>
          <p className="text-sm text-mute">{subtitle}</p>
        </div>

        <div className="card-glow p-7 sm:p-8">{children}</div>

        {footer && (
          <div className="mt-6 text-center text-sm text-mute">{footer}</div>
        )}
      </div>
    </div>
  );
}
