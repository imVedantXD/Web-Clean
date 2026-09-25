import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { assertSameOrigin, getSessionUser, randomToken } from "@/lib/auth";
import { campaignSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";
import { CATEGORY_META, sanitizeText, slugify, type CategoryId } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to create a campaign." },
      { status: 401 }
    );
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Verify your email before creating campaigns." },
      { status: 403 }
    );
  }

  const rl = rateLimit(`campaigns:create:${user.id}`, 8, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You are creating campaigns too quickly. Please wait a while." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid campaign details." },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const startAt = new Date(d.startAt);
  const endAt = d.endAt ? new Date(d.endAt) : null;

  if (endAt && endAt <= startAt) {
    return NextResponse.json(
      { error: "The end time must be after the start time." },
      { status: 400 }
    );
  }

  const slug = `${slugify(d.title)}-${randomToken(3)}`;
  const imageUrl = CATEGORY_META[d.imageKey as CategoryId].image;

  await db.insert(campaigns).values({
    slug,
    title: sanitizeText(d.title),
    summary: sanitizeText(d.summary),
    description: sanitizeText(d.description),
    category: d.category,
    city: sanitizeText(d.city),
    location: sanitizeText(d.location),
    imageUrl,
    startAt,
    endAt,
    volunteersNeeded: d.volunteersNeeded,
    organizerId: user.id,
  });

  return NextResponse.json({ ok: true, slug });
}
