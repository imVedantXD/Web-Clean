"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { CATEGORY_META, cn, formatDate, type CategoryId } from "@/lib/utils";
import type { Campaign } from "@/db/schema";

export function CampaignCard({
  campaign,
  organizerName,
  joined,
  index = 0,
}: {
  campaign: Campaign;
  organizerName: string;
  joined: number;
  index?: number;
}) {
  const meta = CATEGORY_META[campaign.category as CategoryId];
  const Icon = meta.icon;
  const pct = Math.min(100, Math.round((joined / Math.max(1, campaign.volunteersNeeded)) * 100));
  const spotsLeft = Math.max(0, campaign.volunteersNeeded - joined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/campaigns/${campaign.slug}`}
        className="card-glow group flex h-full flex-col overflow-hidden"
        aria-label={`View campaign: ${campaign.title}`}
      >
        <div className="relative h-48 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className={cn("chip absolute top-3 left-3 backdrop-blur-md", meta.chip)}>
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-300" />
            {formatDate(campaign.startAt)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-lg leading-snug font-bold text-ink transition-colors duration-300 group-hover:text-emerald-500">
            {campaign.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-mute">
            {campaign.summary}
          </p>

          <div className="mt-auto space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-medium text-faint">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                {campaign.city}
              </span>
              <span>by {organizerName}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 text-mute">
                  <Users className="h-3.5 w-3.5" /> {joined}/{campaign.volunteersNeeded} joined
                </span>
                <span className={cn(spotsLeft === 0 ? "text-rose-400" : "text-emerald-500")}>
                  {spotsLeft === 0 ? "Full — waitlist" : `${spotsLeft} spots left`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="divider" />

            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-500">
              View & join
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
