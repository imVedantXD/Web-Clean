import {
  createHash,
  randomBytes,
  scrypt as cryptoScrypt,
  timingSafeEqual,
} from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

const SCRYPT_N = 16384;

function scrypt(
  password: string,
  salt: Buffer,
  keylen: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    cryptoScrypt(
      password,
      salt,
      keylen,
      { N: SCRYPT_N, r: 8, p: 1 },
      (err, derivedKey) => (err ? reject(err) : resolve(derivedKey))
    );
  });
}

export const SESSION_COOKIE = "sahayata_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const RENEW_WITHIN_MS = 1000 * 60 * 60 * 24 * 15; // refresh when < 15 days left

/* ------------------------------- Hashing utils ----------------------------- */

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function randomOtp(): string {
  // 6-digit code, cryptographically random
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${SCRYPT_N}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null
): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const N = parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  const derived = await scrypt(password, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/* --------------------------------- Sessions -------------------------------- */

export type SessionUser = User;

function cookieSecure(): boolean {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return base.startsWith("https://");
}

async function sessionExpiryContext() {
  const h = await headers();
  return {
    userAgent: (h.get("user-agent") ?? "").slice(0, 500),
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim().slice(0, 64) || null,
  };
}

/** Route-handler only: creates a session row and sets the httpOnly cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = randomToken(32);
  const tokenHash = sha256(token);
  const ctx = await sessionExpiryContext();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    userAgent: ctx.userAgent,
    ip: ctx.ip,
    expiresAt,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    expires: expiresAt,
  });
}

/** Route-handler only: destroys the current session and clears the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
  }
  store.delete(SESSION_COOKIE);
}

/** Safe anywhere (server components included): resolves the logged-in user. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);
  const rows = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Sliding renewal (DB-only; cookie token stays the same)
  const remaining = row.session.expiresAt.getTime() - Date.now();
  if (remaining < RENEW_WITHIN_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_TTL_MS), lastSeenAt: new Date() })
      .where(eq(sessions.id, row.session.id));
  }

  return row.user;
}

/** Page guard: redirects guests to sign-in, preserving their destination. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/auth/signin?next=${encodeURIComponent(next)}`);
  }
  return user;
}

/** API guard: verifies Origin header matches Host to blunt CSRF. */
export function assertSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
