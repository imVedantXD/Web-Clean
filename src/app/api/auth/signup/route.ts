import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { assertSameOrigin, hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { cooldownSeconds, getLatestCode, issueVerificationCode } from "@/lib/verify";
import { sanitizeText } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const rl = rateLimit(`signup:${clientIp(req)}`, 8, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${rl.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 }
    );
  }

  const name = sanitizeText(parsed.data.name);
  const email = parsed.data.email;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const existingUser = existing[0];

  if (existingUser?.emailVerifiedAt) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in instead." },
      { status: 409 }
    );
  }

  // Cooldown for re-signups of the same pending email
  if (existingUser) {
    const wait = cooldownSeconds(await getLatestCode(email));
    if (wait > 0) {
      return NextResponse.json(
        {
          ok: true,
          pending: true,
          email,
          cooldownSeconds: wait,
          message: "A verification code was already sent. Please check your inbox.",
        },
        { status: 200 }
      );
    }
  }

  const passwordHash = await hashPassword(parsed.data.password);
  let userId: string;

  if (existingUser) {
    await db
      .update(users)
      .set({ name, passwordHash, updatedAt: new Date() })
      .where(eq(users.id, existingUser.id));
    userId = existingUser.id;
  } else {
    const inserted = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id });
    userId = inserted[0].id;
  }

  const issue = await issueVerificationCode(email, userId, name);
  if (issue.error) {
    return NextResponse.json(
      {
        error:
          "We couldn't send the verification email just now. Please try resending in a minute.",
        pending: true,
        email,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    pending: true,
    email,
    delivered: issue.delivered,
    previewCode: issue.previewCode,
  });
}
