import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Plus, SearchX } from "lucide-react";
import { getCampaigns, getDistinctCities } from "@/lib/queries";
import { CATEGORY_META, isCategory } from "@/lib/utils";
import { CampaignCard } from "@/components/campaign-card";
import { CampaignFilterBar } from "@/components/campaign-filter-bar";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Volunteer Campaigns Near You in India",
  description:
    "Find live volunteering campaigns across India — senior citizen care, food donation drives, neighbourhood cleanups, education and health camps. Filter by city & cause, and join in one tap.",
  alternates: { canonical: "/campaigns" },
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
};

export default async function CampaignsPage({ searchParams }: Props) {
  const { q, category, city } = await searchParams;
  const cat = category && isCategory(category) ? category : undefined;

  const [items, cities] = await Promise.all([
    getCampaigns({ q, category: cat, city }),
    getDistinctCities(),
  ]);

  return (
    <div className="relative overflow-clip">
      <div className="hero-grid-bg absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="glow-orb -top-24 right-1/4 -z-10 h-80 w-80 bg-emerald-500/15 animate-float-slow" />

      <div className="container-x py-16 sm:py-20">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <span className="eyebrow">
              <Compass className="h-3.5 w-3.5" /> Community directory
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Find your <span className="gradient-text">next good deed</span>
            </h1>
            <p className="text-lg text-mute">
              {items.length} live {items.length === 1 ? "campaign" : "campaigns"}
              {cat ? ` in ${CATEGORY_META[cat].label.toLowerCase()}` : ""}
              {city ? ` · ${city}` : ""} — updated in real time for everyone.
            </p>
          </div>
          <Link href="/campaigns/new" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Start a campaign
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="card mb-10 p-5 sm:p-6">
          <CampaignFilterBar
            initialQ={q ?? ""}
            initialCategory={cat ?? ""}
            initialCity={city ?? ""}
            cities={cities}
          />
        </Reveal>

        {items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c, i) => (
              <CampaignCard
                key={c.campaign.id}
                campaign={c.campaign}
                organizerName={c.organizerName}
                joined={c.joined}
                index={i % 3}
              />
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="card flex flex-col items-center gap-4 px-8 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/30">
                <SearchX className="h-7 w-7" />
              </span>
              <h2 className="font-display text-2xl font-bold text-ink">
                Nothing matches — yet
              </h2>
              <p className="max-w-md text-mute">
                Try a different search or city. Better still — if your community
                needs it, start this campaign yourself and lead the change.
              </p>
              <Link href="/campaigns/new" className="btn btn-primary">
                <Plus className="h-4 w-4" /> Start this campaign
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
