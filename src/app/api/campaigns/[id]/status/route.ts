import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { assertSameOrigin, getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

const statusSchema = z.object({
  action: z.enum(["complete", "cancel", "reactivate"]),
});

const ACTION_TO_STATUS = {
  complete: "completed",
  cancel: "cancelled",
  reactivate: "active",
} as const;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const { id } = await ctx.params;

  const updated = await db
    .update(campaigns)
    .set({
      status: ACTION_TO_STATUS[parsed.data.action],
      updatedAt: new Date(),
    })
    .where(and(eq(campaigns.id, id), eq(campaigns.organizerId, user.id)))
    .returning({ id: campaigns.id });

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "Campaign not found or not yours." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, status: ACTION_TO_STATUS[parsed.data.action] });
}
