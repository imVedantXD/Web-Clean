"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function VerifyForm({ email }: { email: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const submittedRef = useRef(false);

  // Load any sandbox-delivered code saved by the signup/signin flow.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`sahayata_preview:${email}`);
      if (saved) setPreviewCode(saved);
    } catch {
      /* ignore */
    }
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = useCallback(
    async (code: string) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          try {
            sessionStorage.removeItem(`sahayata_preview:${email}`);
          } catch {
            /* ignore */
          }
          toast.success("Email verified — welcome to Sahayata Web!");
          router.push("/dashboard?welcome=1");
          router.refresh();
          return;
        }
        setError(data.error ?? "Verification failed. Please try again.");
        setDigits(Array(6).fill(""));
        submittedRef.current = false;
        refs.current[0]?.focus();
      } catch {
        setError("Network error — please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, loading, router]
  );

  // Auto-submit once all six digits are in.
  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6 && !submittedRef.current) {
      submittedRef.current = true;
      submit(code);
    }
  }, [digits, submit]);

  function handleChange(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (!clean) return;
    setDigits((d) => {
      const nd = [...d];
      nd[i] = clean.slice(-1);
      return nd;
    });
    if (i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      setDigits((d) => {
        const nd = [...d];
        if (nd[i]) {
          nd[i] = "";
        } else if (i > 0) {
          nd[i - 1] = "";
          refs.current[i - 1]?.focus();
        }
        return nd;
      });
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const nd = Array(6).fill("");
    for (let i = 0; i < text.length; i++) nd[i] = text[i];
    setDigits(nd);
    refs.current[Math.min(text.length, 5)]?.focus();
  }

  async function resend() {
    if (cooldown > 0) return;
    setError(null);
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not resend right now.");
        if (data.cooldownSeconds) setCooldown(data.cooldownSeconds);
        return;
      }
      setCooldown(60);
      setDigits(Array(6).fill(""));
      submittedRef.current = false;
      if (data.previewCode) {
        setPreviewCode(data.previewCode);
        try {
          sessionStorage.setItem(`sahayata_preview:${email}`, data.previewCode);
        } catch {
          /* ignore */
        }
      }
      toast.success("A fresh code is on its way.");
    } catch {
      setError("Network error — please try again.");
    }
  }

  function autofill(code: string) {
    setDigits(code.split(""));
    refs.current[5]?.focus();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3 text-[13px] text-mute">
        <Mail className="h-4 w-4 shrink-0 text-emerald-500" />
        <span>
          We sent a 6-digit code to{" "}
          <span className="font-bold text-ink">{email}</span>. It expires in 10
          minutes.
        </span>
      </div>

      {previewCode && (
        <div className="overflow-hidden rounded-2xl border border-dashed border-emerald-500/50">
          <div className="flex items-center gap-2 bg-emerald-500/12 px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] text-emerald-500 uppercase">
            <ShieldCheck className="h-4 w-4" /> Sandbox mail · demo delivery
          </div>
          <div className="space-y-3 bg-emerald-500/5 px-4 py-4">
            <p className="text-[13px] leading-relaxed text-mute">
              No SMTP server is configured on this deployment, so your code is
              shown here instead of being emailed:
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-3xl font-bold tracking-[0.35em] text-emerald-400">
                {previewCode}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewCode).catch(() => {});
                    toast.success("Code copied");
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-mute transition-all hover:border-emerald-500/50 hover:text-emerald-500"
                  aria-label="Copy code"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => autofill(previewCode)}
                  className="btn btn-primary !px-4 !py-2 text-xs"
                >
                  Autofill
                </button>
              </div>
            </div>
            <p className="text-[11px] text-faint">
              Configure <code className="font-mono">SMTP_URL</code> (or Resend /
              any SMTP) to deliver codes to real inboxes.
            </p>
          </div>
        </div>
      )}

      <div
        className="flex justify-between gap-2"
        role="group"
        aria-label="Verification code"
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={loading}
            className="otp-box"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] font-medium text-rose-400">
          {error}
        </p>
      )}

      {loading && (
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-500">
          <CheckCircle2 className="h-4 w-4 animate-pulse-soft" />
          Verifying your code…
        </p>
      )}

      <button
        type="button"
        onClick={resend}
        disabled={cooldown > 0}
        className="btn btn-outline w-full !py-2.5 text-sm"
      >
        <RefreshCw className={`h-4 w-4 ${cooldown > 0 ? "animate-spin-slow" : ""}`} />
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend verification code"}
      </button>
    </div>
  );
}
