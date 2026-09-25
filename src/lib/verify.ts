import { db } from "@/db";
import { verificationCodes } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { randomOtp, sha256 } from "./auth";
import { isEmailConfigured, sendVerificationEmail } from "./email";

export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export type IssueResult = {
  delivered: boolean;
  error?: boolean;
  previewCode?: string;
};

/** Creates a fresh OTP, stores its hash, and delivers it. */
export async function issueVerificationCode(
  email: string,
  userId: string,
  name: string
): Promise<IssueResult> {
  const code = randomOtp();

  await db
    .delete(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.purpose, "signup")
      )
    );

  await db.insert(verificationCodes).values({
    email,
    userId,
    codeHash: sha256(code),
    purpose: "signup",
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
    lastSentAt: new Date(),
  });

  try {
    const delivered = await sendVerificationEmail(email, name, code);
    return {
      delivered,
      // Sandbox delivery mode: no SMTP configured → surface code in the UI.
      previewCode: isEmailConfigured() ? undefined : code,
    };
  } catch {
    return {
      delivered: false,
      error: true,
      previewCode: isEmailConfigured() ? undefined : code,
    };
  }
}

export async function getLatestCode(email: string) {
  const rows = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.purpose, "signup")
      )
    )
    .orderBy(desc(verificationCodes.lastSentAt))
    .limit(1);
  return rows[0] ?? null;
}

export function cooldownSeconds(codeRow: { lastSentAt: Date } | null): number {
  if (!codeRow) return 0;
  const remaining =
    codeRow.lastSentAt.getTime() + RESEND_COOLDOWN_MS - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000));
}
