import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { SignupFooter, SignupForm } from "@/components/auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your free account",
  description:
    "Join Sahayata Web — India's community volunteering platform. Verify your email and start serving your neighbourhood today.",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      title="Join the movement"
      subtitle="One verified account. A city full of good deeds."
      footer={<SignupFooter />}
    >
      <SignupForm />
    </AuthShell>
  );
}
