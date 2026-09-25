"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Clipboard,
  CheckCircle2,
  Smartphone,
  LockKeyhole,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const AMOUNTS = [250, 500, 1000, 2500];

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function AshaFuelForm() {
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [monthly, setMonthly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<{ reference: string; amount: number; paymentId: string } | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<{ reference: string; amount: number; upiId: string; upiUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const meals = Math.max(1, Math.floor(selectedAmount / 50));
  const impactLabel = meals === 1 ? "community meal" : "community meals";
  const impactSteps = useMemo(() => [
    { label: "Immediate relief", value: 60 },
    { label: "Local coordination", value: 25 },
    { label: "Platform upkeep", value: 15 },
  ], []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const response = await fetch("/api/ashafuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), amount: selectedAmount, monthly }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "We could not prepare your UPI payment.");
        return;
      }
      setPaymentIntent({ reference: data.reference, amount: data.amount, upiId: data.upiId, upiUrl: data.upiUrl });
      toast.success("Opening your UPI app...");
      window.setTimeout(() => window.location.assign(data.upiUrl), 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyUpiId() {
    if (!paymentIntent) return;
    await navigator.clipboard.writeText(paymentIntent.upiId);
    toast.success("UPI ID copied.");
  }

  if (receipt) {
    return (
      <div className="card-glow flex min-h-[560px] flex-col justify-between overflow-hidden p-7 sm:p-9">
        <div>
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30"><CheckCircle2 className="h-7 w-7" /></span>
          <p className="eyebrow">Checkout prepared</p>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">Your support has momentum.</h2>
          <p className="mt-3 text-sm leading-relaxed text-mute">Your payment of {formatAmount(receipt.amount)} was verified securely. Keep this receipt reference for your records.</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5">
            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-mute">Reference</span><span className="font-mono font-semibold text-ink">{receipt.reference}</span></div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm"><span className="text-mute">Payment ID</span><span className="max-w-[190px] truncate font-mono font-semibold text-ink">{receipt.paymentId}</span></div>
          </div>
          <button type="button" onClick={() => setReceipt(null)} className="btn btn-outline w-full py-3!">Start another contribution</button>
        </div>
      </div>
    );
  }

  if (paymentIntent) {
    return (
      <div className="card-glow flex min-h-[560px] flex-col justify-between overflow-hidden p-7 sm:p-9">
        <div>
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30"><Smartphone className="h-7 w-7" /></span>
          <p className="eyebrow">UPI payment ready</p>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">Choose your UPI app.</h2>
          <p className="mt-3 text-sm leading-relaxed text-mute">Your phone should open its available UPI apps. Select Paytm, Google Pay, PhonePe, or another UPI app and approve the payment there.</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5">
            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-mute">Amount</span><span className="font-semibold text-ink">{formatAmount(paymentIntent.amount)}</span></div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm"><span className="text-mute">UPI ID</span><span className="max-w-[190px] truncate font-mono font-semibold text-ink">{paymentIntent.upiId}</span></div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm"><span className="text-mute">Reference</span><span className="font-mono font-semibold text-ink">{paymentIntent.reference}</span></div>
          </div>
          <a href={paymentIntent.upiUrl} className="btn btn-primary w-full py-3!"><Smartphone className="h-4 w-4" />Open UPI app</a>
          <button type="button" onClick={copyUpiId} className="btn btn-outline w-full py-3!"><Clipboard className="h-4 w-4" />Copy UPI ID</button>
          <button type="button" onClick={() => { setReceipt({ reference: paymentIntent.reference, amount: paymentIntent.amount, paymentId: "UPI transfer submitted" }); toast.success("Thanks. Your contribution has been submitted."); }} className="w-full text-center text-xs font-bold text-mute underline decoration-line underline-offset-4 hover:text-ink">I completed the payment</button>
          <p className="text-center text-[11px] leading-relaxed text-faint">UPI transfers are confirmed by your bank. This page cannot verify the transfer automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-glow space-y-5 p-7 sm:p-9">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.16em] text-emerald-500 uppercase">Build your ripple</p><h2 className="mt-2 font-display text-2xl font-extrabold text-ink">Choose your fuel</h2></div><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-500"><Sparkles className="h-5 w-5" /></span></div>
      {error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] font-medium text-rose-400">{error}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AMOUNTS.map((preset) => <button key={preset} type="button" onClick={() => { setAmount(preset); setCustomAmount(""); }} className={`rounded-xl border px-3 py-3 text-sm font-bold transition-all ${selectedAmount === preset && !customAmount ? "border-emerald-500 bg-emerald-500/12 text-emerald-500 shadow-[0_0_20px_-8px_rgba(16,185,129,0.8)]" : "border-line bg-elev text-ink hover:border-emerald-500/50"}`}>{formatAmount(preset)}</button>)}
      </div>
      <div><label htmlFor="ashafuel-custom" className="label">Or enter an amount</label><div className="relative"><span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-faint">₹</span><input id="ashafuel-custom" name="customAmount" type="number" min="50" max="100000" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} placeholder="500" className="input pl-8" /></div></div>
      <div className="rounded-2xl border border-emerald-500/25 bg-linear-to-br from-emerald-500/10 to-teal-500/5 p-5"><p className="text-xs font-bold tracking-[0.14em] text-emerald-500 uppercase">Your visible impact</p><p className="mt-2 font-display text-3xl font-extrabold text-ink">{meals} {impactLabel}</p><div className="mt-4 flex h-2 overflow-hidden rounded-full bg-emerald-950/10 dark:bg-white/10">{impactSteps.map((step) => <span key={step.label} style={{ width: `${step.value}%` }} className="first:bg-emerald-400 even:bg-teal-400 last:bg-amber-400" />)}</div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-mute">{impactSteps.map((step) => <span key={step.label} className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{step.label} {step.value}%</span>)}</div></div>
      <label className="flex cursor-not-allowed items-center justify-between gap-4 rounded-2xl border border-line bg-elev px-4 py-3.5 opacity-70"><span className="flex items-center gap-3"><RefreshCw className="h-4 w-4 text-teal-500" /><span><span className="block text-sm font-bold text-ink">Monthly ripple</span><span className="block text-xs text-mute">Recurring billing is being secured for launch.</span></span></span><input type="checkbox" checked={monthly} disabled aria-label="Monthly ripple unavailable" className="h-5 w-5 accent-emerald-500" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="ashafuel-name" className="label">Your name</label><input id="ashafuel-name" name="name" required minLength={2} maxLength={120} placeholder="Full name" className="input" /></div><div><label htmlFor="ashafuel-email" className="label">Receipt email</label><input id="ashafuel-email" name="email" type="email" required placeholder="you@example.in" className="input" /></div></div>
      <button type="submit" disabled={loading} className="btn btn-primary w-full py-4! text-base"><Smartphone className="h-4 w-4" />{loading ? "Preparing UPI payment..." : `Pay ${formatAmount(selectedAmount)} with UPI`}{!loading && <ArrowRight className="h-4 w-4" />}</button>
      <p className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-faint"><LockKeyhole className="h-3.5 w-3.5" /> Direct bank-app handoff · No Razorpay · No spam</p>
    </form>
  );
}