import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { paymentIntents } from "@/db/schema";
import { assertSameOrigin } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const confirmSchema = z.object({
  reference: z.string().regex(/^ASF-[A-Z0-9]+-[A-Z0-9]{6}$/),
  utr: z.string().trim().regex(/^[A-Za-z0-9-]{6,64}$/),
});

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const rl = rateLimit(`ashafuel-confirm:${clientIp(req)}`, 6, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const parsed = confirmSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the UTR shown by your bank app." }, { status: 400 });

  const now = new Date();
  let updated: { reference: string }[];
  try {
    updated = await db.update(paymentIntents)
      .set({ status: "submitted", utr: parsed.data.utr, submittedAt: now })
      .where(and(
        eq(paymentIntents.reference, parsed.data.reference),
        eq(paymentIntents.status, "pending"),
        isNull(paymentIntents.utr),
        gt(paymentIntents.expiresAt, now),
      ))
      .returning({ reference: paymentIntents.reference });
  } catch (error) {
    console.error("AshaFuel payment confirmation failed", error);
    return NextResponse.json({ error: "Payment details could not be saved. Please try again." }, { status: 503 });
  }

  if (!updated[0]) return NextResponse.json({ error: "This payment reference is expired, already submitted, or invalid." }, { status: 409 });
  return NextResponse.json({ ok: true, reference: updated[0].reference, status: "submitted" });
}