import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { assertSameOrigin } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { cooldownSeconds, getLatestCode, issueVerificationCode } from "@/lib/verify";

export const runtime = "nodejs";

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const rl = rateLimit(`resend:${clientIp(req)}`, 6, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${rl.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const email = parsed.data.email;

  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];

  // Avoid user enumeration — always respond positively.
  if (!user) {
    return NextResponse.json({ ok: true, delivered: false });
  }
  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const wait = cooldownSeconds(await getLatestCode(email));
  if (wait > 0) {
    return NextResponse.json(
      { error: `Please wait ${wait}s before requesting another code.`, cooldownSeconds: wait },
      { status: 429 }
    );
  }

  const issue = await issueVerificationCode(email, user.id, user.name);
  if (issue.error) {
    return NextResponse.json(
      { error: "We couldn't send the email just now. Please retry in a minute." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    delivered: issue.delivered,
    previewCode: issue.previewCode,
  });
}
