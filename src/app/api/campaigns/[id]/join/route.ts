import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { campaigns, campaignSignups } from "@/db/schema";
import { assertSameOrigin, getSessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/utils";
import { z } from "zod";

import { sendCampaignJoinedEmail } from "@/lib/email";

export const runtime = "nodejs";

const joinSchema = z.object({
  message: z.string().trim().max(300).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to join this campaign." },
      { status: 401 }
    );
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Verify your email before joining campaigns." },
      { status: 403 }
    );
  }

  const rl = rateLimit(`join:${user.id}`, 30, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Slow down a little — try again shortly." },
      { status: 429 }
    );
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = joinSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const found = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id))
    .limit(1);
  const campaign = found[0];

  if (!campaign || campaign.status !== "active") {
    return NextResponse.json(
      { error: "This campaign is no longer accepting volunteers." },
      { status: 404 }
    );
  }
  if (campaign.organizerId === user.id) {
    return NextResponse.json(
      { error: "You're the organizer of this campaign." },
      { status: 400 }
    );
  }

  const inserted = await db
    .insert(campaignSignups)
    .values({
      campaignId: campaign.id,
      userId: user.id,
      message: parsed.data.message ? sanitizeText(parsed.data.message) : null,
    })
    .onConflictDoNothing()
    .returning({ id: campaignSignups.id });

  if (inserted.length === 0) {
    return NextResponse.json({ ok: true, alreadyJoined: true });
  }

  await sendCampaignJoinedEmail(
    user.email,
    user.name,
    campaign.title,
    campaign.location,
    campaign.city,
    campaign.startAt
  ).catch((err) => {
    console.error("Campaign joined email error:", err);
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await ctx.params;
  await db
    .delete(campaignSignups)
    .where(
      and(
        eq(campaignSignups.campaignId, id),
        eq(campaignSignups.userId, user.id)
      )
    );

  return NextResponse.json({ ok: true });
}
