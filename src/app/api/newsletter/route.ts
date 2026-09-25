import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { assertSameOrigin } from "@/lib/auth";
import { newsletterSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/ratelimit";

import { sendNewsletterWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const rl = rateLimit(`newsletter:${clientIp(req)}`, 6, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  await db
    .insert(newsletterSubscribers)
    .values({ email: parsed.data.email })
    .onConflictDoNothing();

  // Send beautiful welcome email to subscriber
  await sendNewsletterWelcomeEmail(parsed.data.email).catch((err) => {
    console.error("Newsletter email error:", err);
  });

  return NextResponse.json({ ok: true });
}
