import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { assertSameOrigin, createSession, verifyPassword } from "@/lib/auth";
import { signinSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { cooldownSeconds, getLatestCode, issueVerificationCode } from "@/lib/verify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const ip = clientIp(req);
  const rl = rateLimit(`signin:${ip}`, 12, 5 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${rl.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = signinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const emailRl = rateLimit(`signin:${ip}:${email}`, 6, 5 * 60_000);
  if (!emailRl.ok) {
    return NextResponse.json(
      { error: `Too many attempts for this account. Try again in ${emailRl.retryAfter}s.` },
      { status: 429 }
    );
  }

  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];

  if (user && !user.passwordHash) {
    return NextResponse.json(
      { error: "This account uses Continue with Google. Please sign in with Google." },
      { status: 400 }
    );
  }

  const valid = await verifyPassword(password, user?.passwordHash ?? null);
  if (!user || !valid) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (!user.emailVerifiedAt) {
    // Make sure a live code exists so the user can complete verification.
    const latest = await getLatestCode(email);
    const live =
      latest && latest.expiresAt.getTime() > Date.now() && latest.attempts < 5;
    let previewCode: string | undefined;
    if (!live) {
      const issue = await issueVerificationCode(email, user.id, user.name);
      previewCode = issue.previewCode;
    } else {
      // Reveal the sandbox code again so demo users aren't stuck.
      if (!process.env.SMTP_URL && !process.env.SMTP_HOST) {
        previewCode = undefined;
      }
    }

    return NextResponse.json(
      {
        error: "unverified",
        message: "Please verify your email first — we sent you a 6-digit code.",
        email,
        cooldownSeconds: cooldownSeconds(live ? latest : null),
        previewCode,
      },
      { status: 403 }
    );
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
