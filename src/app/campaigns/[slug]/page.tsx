import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getCampaignBySlug, getRelatedCampaigns } from "@/lib/queries";
import {
  CATEGORY_META,
  SITE,
  cn,
  formatDate,
  formatDateTime,
  initials,
  type CategoryId,
} from "@/lib/utils";
import { CampaignCard } from "@/components/campaign-card";
import { JoinButton } from "@/components/join-button";
import { ShareButton } from "@/components/share-button";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCampaignBySlug(slug);
  if (!data) return { title: "Campaign not found" };

  const title = data.campaign.title;
  return {
    title,
    description: data.campaign.summary,
    alternates: { canonical: `/campaigns/${data.campaign.slug}` },
    openGraph: {
      title: `${title} — volunteer with Sahayata Web`,
      description: data.campaign.summary,
      type: "article",
      images: [{ url: data.campaign.imageUrl, width: 1200, height: 675 }],
    },
  };
}

function firstNameFull(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last[0] ? `${last[0]}.` : ""}`.trim();
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const [data, user] = await Promise.all([getCampaignBySlug(slug), getSessionUser()]);
  if (!data) notFound();

  const { campaign, organizerName, organizerId, volunteers } = data;
  const meta = CATEGORY_META[campaign.category as CategoryId];
  const Icon = meta.icon;
  const now = new Date();

  const joined = volunteers.length;
  const pct = Math.min(100, Math.round((joined / Math.max(1, campaign.volunteersNeeded)) * 100));
  const joinedByMe = user ? volunteers.some((v) => v.id === user.id) : false;
  const isOwner = user?.id === organizerId;

  const statusLabel =
    campaign.status === "cancelled"
      ? "Cancelled"
      : campaign.status === "completed"
        ? "Completed"
        : campaign.startAt > now
          ? "Upcoming"
          : campaign.endAt && campaign.endAt < now
            ? "Wrapped up"
            : "Happening now";

  const canJoin = campaign.status === "active" && !isOwner;
  const joinReason = isOwner
    ? "You organize this drive"
    : campaign.status !== "active"
      ? `This drive is ${campaign.status}`
      : null;

  const related = await getRelatedCampaigns(campaign.category, campaign.id);

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SocialEvent",
        name: campaign.title,
        description: campaign.summary,
        startDate: campaign.startAt.toISOString(),
        endDate: campaign.endAt ? campaign.endAt.toISOString() : undefined,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: campaign.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: campaign.city,
            addressCountry: "IN",
          },
        },
        image: [
          campaign.imageUrl.startsWith("http")
            ? campaign.imageUrl
            : `${SITE.url}${campaign.imageUrl}`,
        ],
        organizer: {
          "@type": "Person",
          name: organizerName,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${SITE.url}/campaigns/${campaign.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Campaigns",
            item: `${SITE.url}/campaigns`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: campaign.title,
            item: `${SITE.url}/campaigns/${campaign.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="relative overflow-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <div className="container-x py-10 sm:py-14">
        <Reveal>
          <Link
            href="/campaigns"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-mute transition-colors hover:text-emerald-500"
          >
            <ArrowLeft className="h-4 w-4" /> All campaigns
          </Link>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ------------------------------- Main ------------------------------ */}
          <div className="space-y-8">
            <Reveal>
              <div className="card-glow overflow-hidden">
                <div className="relative h-72 sm:h-96">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className={cn("chip backdrop-blur-md", meta.chip)}>
                      <Icon className="h-3.5 w-3.5" /> {meta.label}
                    </span>
                    <span
                      className={cn(
                        "chip backdrop-blur-md",
                        statusLabel === "Happening now"
                          ? "border-amber-400/40 bg-amber-400/15 text-amber-300"
                          : statusLabel === "Upcoming"
                            ? "border-sky-400/40 bg-sky-400/15 text-sky-300"
                            : "border-white/25 bg-white/10 text-white"
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="absolute right-0 bottom-0 left-0 p-6 sm:p-8">
                    <h1 className="font-display max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      {campaign.title}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">
                      {campaign.summary}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: CalendarDays,
                    label: "Date & time",
                    value: formatDateTime(campaign.startAt),
                  },
                  {
                    icon: Clock,
                    label: "Ends",
                    value: campaign.endAt ? formatDateTime(campaign.endAt) : "Flexible",
                  },
                  {
                    icon: MapPin,
                    label: "Venue",
                    value: `${campaign.location}, ${campaign.city}`,
                  },
                ].map((f) => (
                  <div key={f.label} className="card p-4">
                    <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25">
                      <f.icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-faint uppercase">
                      {f.label}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug font-semibold text-ink">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="card p-6 sm:p-8">
                <h2 className="font-display mb-4 text-xl font-extrabold text-ink">
                  About this drive
                </h2>
                <div className="space-y-4 text-[15px] leading-relaxed text-mute">
                  {campaign.description.split(/\n+/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="card p-6 sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-xl font-extrabold text-ink">
                    Volunteer wall
                  </h2>
                  <span className="text-xs font-bold text-faint">
                    {joined} joined
                  </span>
                </div>
                {volunteers.length > 0 ? (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {volunteers.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center gap-3 rounded-xl border border-line bg-elev px-4 py-3 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_20px_-8px_rgba(16,185,129,0.5)]"
                      >
                        {v.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.avatarUrl}
                            alt={v.name}
                            className="h-9 w-9 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="avatar-initials h-9 w-9 text-[11px]">
                            {initials(v.name)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {firstNameFull(v.name)}
                          </p>
                          <p className="text-[11px] text-faint">
                            joined {formatDate(v.joinedAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-mute">
                    No volunteers yet — be the first name on this wall.
                  </p>
                )}
              </div>
            </Reveal>
          </div>

          {/* ------------------------------ Sidebar ----------------------------- */}
          <div className="space-y-5">
            <Reveal delay={0.1}>
              <div className="card-glow sticky top-24 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                    <Users className="h-4 w-4 text-emerald-500" />
                    {joined} / {campaign.volunteersNeeded} volunteers
                  </span>
                  <span className="text-xs font-bold text-emerald-500">{pct}%</span>
                </div>
                <div className="mb-6 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <JoinButton
                  campaignId={campaign.id}
                  slug={campaign.slug}
                  joined={joinedByMe}
                  canJoin={canJoin}
                  isAuthed={Boolean(user)}
                  reason={joinReason}
                />

                {isOwner && (
                  <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3 py-2 text-center text-[12px] font-semibold text-emerald-500">
                    You are organizing this drive — manage it from your dashboard.
                  </p>
                )}

                <div className="divider my-5" />

                <ShareButton title={campaign.title} />

                <div className="divider my-5" />

                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/30">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-faint uppercase">
                      Organized by
                    </p>
                    <p className="text-sm font-bold text-ink">{organizerName}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ------------------------------ Related ------------------------------ */}
        {related.length > 0 && (
          <div className="mt-20">
            <Reveal className="mb-8">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                More {meta.label.toLowerCase()} drives
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((c, i) => (
                <CampaignCard
                  key={c.campaign.id}
                  campaign={c.campaign}
                  organizerName={c.organizerName}
                  joined={c.joined}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
