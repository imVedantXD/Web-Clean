import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/utils";

export const runtime = "nodejs";

const ashafuelSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  amount: z.number().finite().int().min(50).max(100000),
  monthly: z.boolean().default(false),
});

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const rl = rateLimit(`ashafuel:${clientIp(req)}`, 8, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const body = await req.json().catch(() => null);
  const parsed = ashafuelSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a name, valid email, and amount between ₹50 and ₹1,00,000." }, { status: 400 });

  if (parsed.data.monthly) {
    return NextResponse.json({ error: "Monthly contributions are being secured for recurring billing. Please choose a one-time contribution for now." }, { status: 400 });
  }

  const upiId = process.env.UPI_ID?.trim();
  const payeeName = process.env.UPI_PAYEE_NAME?.trim() || "Sahayata Web";
  if (!upiId || !/^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/.test(upiId)) {
    return NextResponse.json({ error: "UPI payments are temporarily unavailable. The donation UPI ID is not configured yet." }, { status: 503 });
  }

  const reference = `ASF-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const upiUrl = new URL("upi://pay");
  upiUrl.search = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: parsed.data.amount.toFixed(2),
    cu: "INR",
    tn: `AshaFuel ${reference}`,
    tr: reference,
  }).toString();

  console.info("AshaFuel UPI intent created", {
    reference,
    amount: parsed.data.amount,
    donorEmail: parsed.data.email,
    donorName: sanitizeText(parsed.data.name).slice(0, 120),
  });

  return NextResponse.json({ ok: true, amount: parsed.data.amount, currency: "INR", reference, upiId, upiUrl: upiUrl.toString() });
}