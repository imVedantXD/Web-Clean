import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  Flame,
  HeartHandshake,
  MapPin,
  PartyPopper,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserDashboard } from "@/lib/queries";
import { cn, formatDate, initials } from "@/lib/utils";
import {
  CampaignStatusActions,
  LeaveButton,
  SignOutButton,
} from "@/components/dashboard-actions";
import { ProfileForm } from "@/components/profile-form";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Track your volunteering impact, manage your campaigns and update your Sahayata Web profile.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ welcome?: string }> };

const STATUS_STYLES: Record<string, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  completed: "border-sky-500/40 bg-sky-500/10 text-sky-500",
  cancelled: "border-rose-500/40 bg-rose-500/10 text-rose-400",
};

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser("/dashboard");
  if (!user.emailVerifiedAt) {
    redirect(`/auth/verify?email=${encodeURIComponent(user.email)}`);
  }

  const { welcome } = await searchParams;
  const { organized, joined, volunteerProfile } = await getUserDashboard(user.id);
  const impactHours = joined.length * 3 + (volunteerProfile?.hoursLogged ?? 0);

  const stats = [
    { label: "Drives joined", value: joined.length, icon: HeartHandshake },
    { label: "Drives organized", value: organized.length, icon: Compass },
    { label: "Est. impact hours", value: impactHours, icon: Flame },
  ];

  return (
    <div className="container-x py-14 sm:py-16">
      {welcome === "1" && (
        <Reveal>
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-5 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
            <PartyPopper className="h-8 w-8 shrink-0 text-emerald-500" />
            <div>
              <p className="font-display text-lg font-extrabold text-ink">
                Welcome aboard, {user.name.split(" ")[0]}!
              </p>
              <p className="text-sm text-mute">
                Your email is verified and your account is live. Time for your
                first good deed.
              </p>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="avatar-initials h-16 w-16 rounded-2xl text-xl">
              {initials(user.name)}
            </span>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                {user.name}
              </h1>
              {volunteerProfile && (
                <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified volunteer
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-mute">
              {user.email}
              {user.city ? ` · ${user.city}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/campaigns/new" className="btn btn-primary !px-4 !py-2 text-[13px]">
            <Plus className="h-4 w-4" /> New campaign
          </Link>
          <SignOutButton />
        </div>
      </Reveal>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <div className="card-glow flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/25">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-3xl font-extrabold text-ink">
                  {s.value.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] font-bold tracking-[0.14em] text-faint uppercase">
                  {s.label}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {/* ------------------------- Organized drives ------------------------- */}
          <Reveal>
            <div className="card p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-ink">
                  Campaigns you organize
                </h2>
                <Link href="/campaigns/new" className="text-[13px] font-bold text-emerald-500 hover:underline">
                  + Start one
                </Link>
              </div>
              {organized.length > 0 ? (
                <ul className="space-y-3">
                  {organized.map(({ campaign, joined: count }) => (
                    <li key={campaign.id}>
                      <Link
                        href={`/campaigns/${campaign.slug}`}
                        className="block rounded-2xl border border-line bg-elev p-4 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_24px_-8px_rgba(16,185,129,0.5)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-bold text-ink">
                                {campaign.title}
                              </p>
                              <span className={cn("chip !px-2 !py-0.5 !text-[10px]", STATUS_STYLES[campaign.status])}>
                                {campaign.status}
                              </span>
                            </div>
                            <p className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-faint">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDate(campaign.startAt)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {campaign.city}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" /> {count}/{campaign.volunteersNeeded}
                              </span>
                            </p>
                          </div>
                          <CampaignStatusActions campaignId={campaign.id} status={campaign.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
                  <p className="text-sm text-mute">
                    You haven&apos;t organized a drive yet. Your community is
                    waiting for a leader.
                  </p>
                  <Link href="/campaigns/new" className="btn btn-primary mt-4 !py-2.5 text-sm">
                    <Plus className="h-4 w-4" /> Create your first campaign
                  </Link>
                </div>
              )}
            </div>
          </Reveal>

          {/* -------------------------- Joined drives --------------------------- */}
          <Reveal delay={0.08}>
            <div className="card p-6 sm:p-7">
              <h2 className="font-display mb-5 text-xl font-extrabold text-ink">
                Drives you&apos;ve joined
              </h2>
              {joined.length > 0 ? (
                <ul className="space-y-3">
                  {joined.map(({ campaign, organizerName, joinedAt }) => (
                    <li key={campaign.id}>
                      <Link
                        href={`/campaigns/${campaign.slug}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-elev p-4 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_24px_-8px_rgba(16,185,129,0.5)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">
                            {campaign.title}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-faint">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(campaign.startAt)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {campaign.city}
                            </span>
                            <span>by {organizerName}</span>
                            <span className="text-emerald-500/80">
                              joined {formatDate(joinedAt)}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <LeaveButton campaignId={campaign.id} />
                          <ArrowUpRight className="h-4 w-4 text-faint" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
                  <p className="text-sm text-mute">
                    No drives joined yet. Find one that moves you.
                  </p>
                  <Link href="/campaigns" className="btn btn-outline mt-4 !py-2.5 text-sm">
                    Browse campaigns
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* ------------------------------ Sidebar ------------------------------ */}
        <div className="space-y-6">
          <Reveal delay={0.1}>
            <div className="card-glow p-6">
              <h2 className="font-display mb-5 text-lg font-extrabold text-ink">
                Your profile
              </h2>
              <ProfileForm
                initial={{ name: user.name, city: user.city, bio: user.bio }}
              />
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="card-glow p-6">
              {volunteerProfile ? (
                <div className="space-y-3">
                  <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="h-3.5 w-3.5" /> Volunteer roster
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-ink">
                    You&apos;re an active volunteer
                  </h3>
                  <p className="text-[13px] leading-relaxed text-mute">
                    City: <span className="font-semibold text-ink">{volunteerProfile.city}</span>
                    <br />
                    Available: <span className="font-semibold text-ink">{volunteerProfile.availability}</span>
                  </p>
                  <Link href="/volunteer" className="btn btn-outline w-full !py-2.5 text-[13px]">
                    Update volunteer profile
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="chip border-amber-500/40 bg-amber-500/10 text-amber-500">
                    <Flame className="h-3.5 w-3.5" /> One more step
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-ink">
                    Join the volunteer roster
                  </h3>
                  <p className="text-[13px] leading-relaxed text-mute">
                    Tell us your causes and availability so organizers know
                    you&apos;re ready to serve.
                  </p>
                  <Link href="/volunteer" className="btn btn-primary w-full !py-2.5 text-[13px]">
                    Become a volunteer
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
