import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { assertSameOrigin } from "@/lib/auth";
import { contactSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/utils";

import { sendContactConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const rl = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many messages. Please try again in ${rl.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);

  // Honeypot: silently accept bot submissions without storing them.
  if (body && typeof body === "object" && (body as { company?: string }).company) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message." },
      { status: 400 }
    );
  }

  const name = sanitizeText(parsed.data.name);
  const email = parsed.data.email;
  const subject = sanitizeText(parsed.data.subject);

  await db.insert(contactMessages).values({
    name,
    email,
    subject,
    message: sanitizeText(parsed.data.message),
  });

  await sendContactConfirmationEmail(email, name, subject).catch((err) => {
    console.error("Contact confirmation email error:", err);
  });

  return NextResponse.json({ ok: true });
}
