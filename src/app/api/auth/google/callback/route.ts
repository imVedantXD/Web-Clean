import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { oauthAccounts, users } from "@/db/schema";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

const STATE_COOKIE = "google_oauth_state";

type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

async function exchangeCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("token-exchange-failed");
  return (await res.json()) as { access_token?: string };
}

async function fetchProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("userinfo-failed");
  return (await res.json()) as GoogleProfile;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/auth/signin?error=${reason}`);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("google-not-configured");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("oauth-failed");

  const store = await cookies();
  const expectedState = store.get(STATE_COOKIE)?.value;
  store.delete(STATE_COOKIE);
  if (!expectedState || expectedState !== state) return fail("oauth-failed");

  try {
    const tokens = await exchangeCode(
      code,
      `${origin}/api/auth/google/callback`
    );
    if (!tokens.access_token) return fail("oauth-failed");

    const profile = await fetchProfile(tokens.access_token);
    if (!profile.sub || !profile.email || profile.email_verified === false) {
      return fail("oauth-failed");
    }

    const email = profile.email.toLowerCase();
    const name = (profile.name ?? email.split("@")[0]).slice(0, 120);

    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let userId: string;
    if (found[0]) {
      userId = found[0].id;
      await db
        .update(users)
        .set({
          emailVerifiedAt: found[0].emailVerifiedAt ?? new Date(),
          avatarUrl: found[0].avatarUrl ?? profile.picture ?? null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      const inserted = await db
        .insert(users)
        .values({
          name,
          email,
          avatarUrl: profile.picture ?? null,
          emailVerifiedAt: new Date(),
        })
        .returning({ id: users.id });
      userId = inserted[0].id;
    }

    await db
      .insert(oauthAccounts)
      .values({
        userId,
        provider: "google",
        providerAccountId: profile.sub,
        email,
      })
      .onConflictDoNothing();

    await createSession(userId);
    return NextResponse.redirect(`${origin}/dashboard?welcome=1`);
  } catch {
    return fail("oauth-failed");
  }
}
