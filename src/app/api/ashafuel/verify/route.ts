import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({ error: "UPI payments are confirmed in your bank app." }, { status: 410 });
}