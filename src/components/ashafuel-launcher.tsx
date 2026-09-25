"use client";

import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";

export function AshaFuelLauncher() {
  return (
    <Link
      href="/support"
      aria-label="Open AshaFuel contribution page"
      className="fixed top-20 right-4 z-40 flex items-center gap-2 rounded-full border border-amber-400/40 bg-[linear-gradient(135deg,#fbbf24,#f97316)] px-3 py-2 text-amber-950 shadow-[0_14px_34px_-10px_rgba(245,158,11,0.7)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-10px_rgba(245,158,11,0.85)] sm:top-24 sm:right-6"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
        <Flame className="h-4 w-4" />
      </span>
      <span className="hidden text-left sm:block">
        <span className="block text-[10px] font-extrabold tracking-[0.16em] uppercase">AshaFuel</span>
        <span className="block text-xs font-bold">Power a good thing</span>
      </span>
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}