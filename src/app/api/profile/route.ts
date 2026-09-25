import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { assertSameOrigin, getSessionUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/utils";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid profile." },
      { status: 400 }
    );
  }

  await db
    .update(users)
    .set({
      name: sanitizeText(parsed.data.name),
      city: parsed.data.city ? sanitizeText(parsed.data.city) : null,
      bio: parsed.data.bio ? sanitizeText(parsed.data.bio) : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}
