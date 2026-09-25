import { db } from "@/db";
import {
  campaigns,
  campaignSignups,
  users,
  volunteerProfiles,
} from "@/db/schema";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  ilike,
  ne,
  or,
  sql,
} from "drizzle-orm";

export type CampaignCard = {
  campaign: typeof campaigns.$inferSelect;
  organizerName: string;
  joined: number;
};

/* ---------------------------------- Stats ---------------------------------- */

export async function getStats() {
  const [members, volunteers, activeCamps, signupRows, cities] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(users)
        .where(sql`${users.emailVerifiedAt} is not null`),
      db.select({ n: count() }).from(volunteerProfiles),
      db
        .select({ n: count() })
        .from(campaigns)
        .where(eq(campaigns.status, "active")),
      db.select({ n: count() }).from(campaignSignups),
      db.select({ n: countDistinct(campaigns.city) }).from(campaigns),
    ]);

  return {
    members: members[0]?.n ?? 0,
    volunteers: volunteers[0]?.n ?? 0,
    activeCampaigns: activeCamps[0]?.n ?? 0,
    signups: signupRows[0]?.n ?? 0,
    cities: cities[0]?.n ?? 0,
  };
}

/* -------------------------------- Campaigns -------------------------------- */

const joinedCount = count(campaignSignups.id);

export async function getCampaigns(filters: {
  category?: string;
  city?: string;
  q?: string;
  limit?: number;
}): Promise<CampaignCard[]> {
  const conditions = [eq(campaigns.status, "active")];

  if (filters.category) {
    conditions.push(
      eq(
        campaigns.category,
        filters.category as typeof campaigns.$inferSelect.category
      )
    );
  }
  if (filters.city) {
    conditions.push(ilike(campaigns.city, filters.city));
  }
  if (filters.q) {
    const like = `%${filters.q}%`;
    const q = or(ilike(campaigns.title, like), ilike(campaigns.summary, like));
    if (q) conditions.push(q);
  }

  return db
    .select({
      campaign: campaigns,
      organizerName: users.name,
      joined: joinedCount,
    })
    .from(campaigns)
    .innerJoin(users, eq(users.id, campaigns.organizerId))
    .leftJoin(campaignSignups, eq(campaignSignups.campaignId, campaigns.id))
    .where(and(...conditions))
    .groupBy(campaigns.id, users.name)
    .orderBy(asc(campaigns.startAt), desc(campaigns.createdAt))
    .limit(filters.limit ?? 60);
}

export async function getFeaturedCampaigns(limit = 3): Promise<CampaignCard[]> {
  const upcoming = await db
    .select({
      campaign: campaigns,
      organizerName: users.name,
      joined: joinedCount,
    })
    .from(campaigns)
    .innerJoin(users, eq(users.id, campaigns.organizerId))
    .leftJoin(campaignSignups, eq(campaignSignups.campaignId, campaigns.id))
    .where(
      and(eq(campaigns.status, "active"), gt(campaigns.startAt, new Date()))
    )
    .groupBy(campaigns.id, users.name)
    .orderBy(asc(campaigns.startAt))
    .limit(limit);

  if (upcoming.length >= limit) return upcoming;

  const fill = await db
    .select({
      campaign: campaigns,
      organizerName: users.name,
      joined: joinedCount,
    })
    .from(campaigns)
    .innerJoin(users, eq(users.id, campaigns.organizerId))
    .leftJoin(campaignSignups, eq(campaignSignups.campaignId, campaigns.id))
    .where(eq(campaigns.status, "active"))
    .groupBy(campaigns.id, users.name)
    .orderBy(desc(campaigns.createdAt))
    .limit(limit * 2);

  const seen = new Set(upcoming.map((c) => c.campaign.id));
  return [...upcoming, ...fill.filter((c) => !seen.has(c.campaign.id))].slice(
    0,
    limit
  );
}

export async function getCampaignBySlug(slug: string) {
  const rows = await db
    .select({ campaign: campaigns, organizerName: users.name, organizerId: users.id })
    .from(campaigns)
    .innerJoin(users, eq(users.id, campaigns.organizerId))
    .where(eq(campaigns.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const volunteers = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      joinedAt: campaignSignups.createdAt,
      message: campaignSignups.message,
    })
    .from(campaignSignups)
    .innerJoin(users, eq(users.id, campaignSignups.userId))
    .where(eq(campaignSignups.campaignId, row.campaign.id))
    .orderBy(desc(campaignSignups.createdAt));

  return { ...row, volunteers };
}

export async function getRelatedCampaigns(
  category: string,
  excludeId: string
): Promise<CampaignCard[]> {
  return db
    .select({
      campaign: campaigns,
      organizerName: users.name,
      joined: joinedCount,
    })
    .from(campaigns)
    .innerJoin(users, eq(users.id, campaigns.organizerId))
    .leftJoin(campaignSignups, eq(campaignSignups.campaignId, campaigns.id))
    .where(
      and(
        eq(
          campaigns.category,
          category as typeof campaigns.$inferSelect.category
        ),
        eq(campaigns.status, "active"),
        ne(campaigns.id, excludeId)
      )
    )
    .groupBy(campaigns.id, users.name)
    .orderBy(asc(campaigns.startAt))
    .limit(3);
}

export async function getDistinctCities(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ city: campaigns.city })
    .from(campaigns)
    .orderBy(asc(campaigns.city));
  return rows.map((r) => r.city);
}

/* -------------------------------- Dashboard -------------------------------- */

export async function getUserDashboard(userId: string) {
  const organized = await db
    .select({
      campaign: campaigns,
      joined: joinedCount,
    })
    .from(campaigns)
    .leftJoin(campaignSignups, eq(campaignSignups.campaignId, campaigns.id))
    .where(eq(campaigns.organizerId, userId))
    .groupBy(campaigns.id)
    .orderBy(desc(campaigns.createdAt));

  const joined = await db
    .select({
      campaign: campaigns,
      organizerName: users.name,
      joinedAt: campaignSignups.createdAt,
    })
    .from(campaignSignups)
    .innerJoin(campaigns, eq(campaigns.id, campaignSignups.campaignId))
    .innerJoin(users, eq(users.id, campaigns.organizerId))
    .where(eq(campaignSignups.userId, userId))
    .orderBy(desc(campaignSignups.createdAt));

  const profile = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.userId, userId))
    .limit(1);

  return {
    organized,
    joined,
    volunteerProfile: profile[0] ?? null,
  };
}

/* --------------------------------- Sitemap --------------------------------- */

export async function getSitemapCampaigns() {
  return db
    .select({ slug: campaigns.slug, updatedAt: campaigns.updatedAt })
    .from(campaigns)
    .where(eq(campaigns.status, "active"))
    .orderBy(desc(campaigns.createdAt))
    .limit(500);
}

export { joinedCount };
