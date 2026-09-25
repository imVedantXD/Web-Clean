import type { MetadataRoute } from "next";
import { getSitemapCampaigns } from "@/lib/queries";
import { SITE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1, changeFrequency: "daily" as const },
    { path: "/campaigns", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/volunteer", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/auth/signup", priority: 0.4, changeFrequency: "monthly" as const },
  ].map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let campaignRoutes: MetadataRoute.Sitemap = [];
  try {
    const items = await getSitemapCampaigns();
    campaignRoutes = items.map((c) => ({
      url: `${SITE.url}/campaigns/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build time — static routes still ship.
  }

  return [...staticRoutes, ...campaignRoutes];
}
