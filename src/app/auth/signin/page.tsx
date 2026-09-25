import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { SigninFooter, SigninForm } from "@/components/auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Sahayata Web to join and organise community campaigns near you.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function SigninPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your seva journey."
      footer={<SigninFooter />}
    >
      <SigninForm next={safeNext} initialError={error ?? null} />
    </AuthShell>
  );
}
