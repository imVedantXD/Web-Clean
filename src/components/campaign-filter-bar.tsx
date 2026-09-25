"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { CATEGORY_META, cn, type CategoryId } from "@/lib/utils";

export function CampaignFilterBar({
  initialQ,
  initialCategory,
  initialCity,
  cities,
}: {
  initialQ: string;
  initialCategory: string;
  initialCity: string;
  cities: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [pending, startTransition] = useTransition();
  const first = useRef(true);

  function navigate(nextQ: string, category: string, city: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/campaigns?${qs}` : "/campaigns", { scroll: false });
    });
  }

  // Debounced live search
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => navigate(q, initialCategory, initialCity), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search drives — 'food', 'lake cleanup', 'tutoring'…"
            className="input !rounded-full !py-3.5 !pl-11"
            aria-label="Search campaigns"
          />
        </div>
        <div className="relative sm:w-56">
          <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-faint" />
          <select
            value={initialCity}
            onChange={(e) => navigate(q, initialCategory, e.target.value)}
            className="input !rounded-full !py-3.5 !pl-11 appearance-none cursor-pointer"
            aria-label="Filter by city"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Causes
        </span>
        <button
          type="button"
          onClick={() => navigate(q, "", initialCity)}
          className={cn(
            "chip cursor-pointer transition-all duration-300",
            !initialCategory
              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-500 shadow-[0_0_20px_-4px_rgba(16,185,129,0.6)]"
              : "border-line text-mute hover:border-emerald-500/40 hover:text-emerald-500"
          )}
        >
          All
        </button>
        {(Object.keys(CATEGORY_META) as CategoryId[]).map((id) => {
          const m = CATEGORY_META[id];
          const active = initialCategory === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(q, active ? "" : id, initialCity)}
              className={cn(
                "chip cursor-pointer transition-all duration-300",
                active
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-500 shadow-[0_0_20px_-4px_rgba(16,185,129,0.6)]"
                  : "border-line text-mute hover:border-emerald-500/40 hover:text-emerald-500"
              )}
            >
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {pending && (
        <p className="text-[11px] font-semibold tracking-wide text-emerald-500 uppercase animate-pulse-soft">
          Updating results…
        </p>
      )}
    </div>
  );
}
