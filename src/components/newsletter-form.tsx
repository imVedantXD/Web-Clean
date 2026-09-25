"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading || !email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setDone(true);
      const submittedEmail = email;
      setEmail("");
      toast.success(
        `Subscribed! A welcome email has been sent to ${submittedEmail}.`,
        { duration: 5000 }
      );
      setTimeout(() => setDone(false), 5000);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.in"
          aria-label="Email for newsletter"
          disabled={loading}
          className="input !pl-10 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading || done}
        className="btn btn-primary !px-5 !py-3 font-semibold text-sm transition-all duration-300"
        aria-label="Subscribe to newsletter"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Joining…</span>
          </>
        ) : done ? (
          <>
            <Check className="h-4 w-4 text-emerald-950" />
            <span>Subscribed!</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Subscribe</span>
          </>
        )}
      </button>
    </form>
  );
}
