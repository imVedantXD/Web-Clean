"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AtSign, Eye, EyeOff, Lock, TriangleAlert, User } from "lucide-react";
import { toast } from "sonner";
import { GoogleButton } from "./google-button";

/* ------------------------------ Shared pieces ----------------------------- */

function PasswordInput({
  value,
  onChange,
  onScore,
}: {
  value: string;
  onChange: (v: string) => void;
  onScore?: (score: number) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        type={show ? "text" : "password"}
        required
        autoComplete="new-password"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          if (onScore) {
            let s = 0;
            if (v.length >= 8) s++;
            if (/[A-Z]/.test(v)) s++;
            if (/[0-9]/.test(v)) s++;
            if (/[^A-Za-z0-9]/.test(v)) s++;
            onScore(s);
          }
        }}
        placeholder="8+ characters, letters & numbers"
        className="input !pr-12 !pl-10"
        minLength={8}
        maxLength={72}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((v) => !v)}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-faint transition-colors hover:text-emerald-500"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] font-medium text-rose-400">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-[11px] font-bold tracking-[0.2em] text-faint uppercase">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function savePreviewCode(email: string, code?: string) {
  if (typeof window === "undefined" || !code) return;
  sessionStorage.setItem(`sahayata_preview:${email}`, code);
}

/* -------------------------------- Sign up --------------------------------- */

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.previewCode) savePreviewCode(email.trim().toLowerCase(), data.previewCode);

      if (data.pending || data.ok) {
        toast.success("Verification code sent! Check your inbox.");
        router.push(`/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }
      setError(data.error ?? "Could not create your account. Please try again.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ErrorBanner message={error} />
      <GoogleButton label="Sign up with Google" />
      <OrDivider />

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className="label">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="signup-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="input !pl-10"
              autoComplete="name"
              maxLength={80}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="label">Email address</label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.in"
              className="input !pl-10"
              autoComplete="email"/>
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="label">Password</label>
          <PasswordInput value={password} onChange={setPassword} onScore={setScore} />
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < score
                        ? score <= 1
                          ? "bg-rose-400"
                          : score === 2
                            ? "bg-amber-400"
                            : score === 3
                              ? "bg-lime-400"
                              : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        : "bg-black/10 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-faint">
                {["Weak", "Weak", "Okay", "Good", "Strong"][score]}
              </span>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Creating account…" : "Create account"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
        By joining, you agree to serve with honesty and respect. We&apos;ll email
        you a 6-digit verification code — no code, no entry.
      </p>
    </div>
  );
}

export function SignupFooter() {
  return (
    <>
      Already have an account?{" "}
      <Link href="/auth/signin" className="font-bold text-emerald-500 hover:underline">
        Sign in
      </Link>
    </>
  );
}

/* -------------------------------- Sign in --------------------------------- */

export function SigninForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "google-not-configured"
      ? "Google sign-in will activate once GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET are set on the server."
      : initialError
        ? "Google sign-in didn't complete. Please try again."
        : null
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        toast.success("Welcome back to the movement!");
        router.push(next || "/dashboard");
        router.refresh();
        return;
      }

      if (data.error === "unverified") {
        if (data.previewCode) savePreviewCode(email.trim().toLowerCase(), data.previewCode);
        toast.info("Please verify your email first.");
        router.push(`/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }

      setError(data.error ?? "Could not sign you in. Please try again.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ErrorBanner message={error} />
      <GoogleButton />
      <OrDivider />

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="signin-email" className="label">Email address</label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.in"
              className="input !pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="signin-password" className="label">Password</label>
          </div>
          <PasswordInput value={password} onChange={setPassword} />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

export function SigninFooter() {
  return (
    <>
      New to Sahayata Web?{" "}
      <Link href="/auth/signup" className="font-bold text-emerald-500 hover:underline">
        Create an account
      </Link>
    </>
  );
}
