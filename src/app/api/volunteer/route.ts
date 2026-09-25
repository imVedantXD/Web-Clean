import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, volunteerProfiles } from "@/db/schema";
import { assertSameOrigin, getSessionUser } from "@/lib/auth";
import { volunteerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/utils";

import { sendVolunteerWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in first." },
      { status: 401 }
    );
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Verify your email to become a volunteer." },
      { status: 403 }
    );
  }

  const rl = rateLimit(`volunteer:${user.id}`, 10, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = volunteerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const city = sanitizeText(d.city);

  await db
    .insert(volunteerProfiles)
    .values({
      userId: user.id,
      city,
      phone: d.phone ? sanitizeText(d.phone) : null,
      interests: d.interests,
      availability: d.availability,
      bio: d.bio ? sanitizeText(d.bio) : null,
    })
    .onConflictDoUpdate({
      target: volunteerProfiles.userId,
      set: {
        city,
        phone: d.phone ? sanitizeText(d.phone) : null,
        interests: d.interests,
        availability: d.availability,
        bio: d.bio ? sanitizeText(d.bio) : null,
      },
    });

  if (user.role !== "volunteer") {
    await db
      .update(users)
      .set({ role: "volunteer", updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  await sendVolunteerWelcomeEmail(user.email, user.name, city).catch((err) => {
    console.error("Volunteer welcome email error:", err);
  });

  return NextResponse.json({ ok: true });
}
