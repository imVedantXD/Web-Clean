import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { VerifyForm } from "@/components/verify-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Enter the 6-digit verification code sent to your email to activate your Sahayata Web account.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  const { email } = await searchParams;
  const cleanEmail = (email ?? "").trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  return (
    <AuthShell
      title="Check your inbox"
      subtitle="One last step to prove it's really you."
      footer={
        <>
          Wrong email?{" "}
          <Link href="/auth/signup" className="font-bold text-emerald-500 hover:underline">
            Start over
          </Link>
        </>
      }
    >
      {valid ? (
        <VerifyForm email={cleanEmail} />
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-mute">
            We need the email address you signed up with to verify your account.
          </p>
          <Link href="/auth/signup" className="btn btn-primary w-full">
            Go to sign up
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
