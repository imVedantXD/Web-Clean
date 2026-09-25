import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { assertSameOrigin, createSession, sha256 } from "@/lib/auth";
import { verifySchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { getLatestCode } from "@/lib/verify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const rl = rateLimit(`verify:${clientIp(req)}`, 20, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${rl.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid code." },
      { status: 400 }
    );
  }

  const { email, code } = parsed.data;
  const codeRow = await getLatestCode(email);

  if (!codeRow) {
    return NextResponse.json(
      { error: "No verification code found for this email. Request a new one." },
      { status: 400 }
    );
  }
  if (codeRow.attempts >= 5) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Request a fresh code." },
      { status: 429 }
    );
  }
  if (codeRow.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This code has expired. Request a fresh one." },
      { status: 400 }
    );
  }

  if (sha256(code) !== codeRow.codeHash) {
    const attempts = codeRow.attempts + 1;
    await db
      .update(verificationCodes)
      .set({ attempts })
      .where(eq(verificationCodes.id, codeRow.id));
    return NextResponse.json(
      {
        error: `Incorrect code. ${Math.max(0, 5 - attempts)} attempt${
          5 - attempts === 1 ? "" : "s"
        } remaining.`,
      },
      { status: 400 }
    );
  }

  const found = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = found[0];
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  await db
    .delete(verificationCodes)
    .where(eq(verificationCodes.email, email));
  await db
    .update(users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
