"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          subject: String(form.get("subject") ?? ""),
          message: String(form.get("message") ?? ""),
          company: String(form.get("company") ?? ""), // honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not send your message.");
        return;
      }
      setDone(true);
      toast.success("Message received — we'll get back to you soon!");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card-glow flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/40 shadow-[0_0_40px_-6px_rgba(16,185,129,0.7)]">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="font-display text-2xl font-extrabold text-ink">Message sent!</h3>
        <p className="max-w-sm text-sm text-mute">
          Dhanyavaad for reaching out. The Sahayata team reads every message and
          typically replies within 2–3 days.
        </p>
        <button type="button" onClick={() => setDone(false)} className="btn btn-outline !py-2 text-sm">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-glow space-y-5 p-7 sm:p-8">
      {error && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] font-medium text-rose-400">
          {error}
        </p>
      )}

      {/* Honeypot — invisible to humans */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className="label">Your name</label>
          <input id="ct-name" name="name" required minLength={2} maxLength={120} placeholder="Full name" className="input" />
        </div>
        <div>
          <label htmlFor="ct-email" className="label">Email</label>
          <input id="ct-email" name="email" type="email" required placeholder="you@example.in" className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="ct-subject" className="label">Subject</label>
        <input id="ct-subject" name="subject" required minLength={4} maxLength={200} placeholder="How can we help?" className="input" />
      </div>

      <div>
        <label htmlFor="ct-message" className="label">Message</label>
        <textarea id="ct-message" name="message" required minLength={10} maxLength={3000} rows={6} placeholder="Tell us everything…" className="input" />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full !py-4 text-base">
        <Send className="h-4 w-4" />
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
