"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { AVAILABILITY } from "@/lib/validation";
import { CATEGORY_META, cn, type CategoryId } from "@/lib/utils";

const CATEGORY_IDS = Object.keys(CATEGORY_META) as CategoryId[];

export function VolunteerForm({
  initial,
}: {
  initial: {
    city: string;
    phone: string | null;
    interests: string[];
    availability: string;
    bio: string | null;
  } | null;
}) {
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggle(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (interests.length === 0) {
      setError("Pick at least one cause you care about.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const payload = {
      city: String(form.get("city") ?? ""),
      phone: String(form.get("phone") ?? "") || undefined,
      availability: String(form.get("availability") ?? AVAILABILITY[2]),
      bio: String(form.get("bio") ?? "") || undefined,
      interests: interests as CategoryId[],
    };

    setLoading(true);
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save your profile.");
        return;
      }
      setDone(true);
      toast.success("You're officially a Sahayata volunteer!");
      router.refresh();
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
          <PartyPopper className="h-7 w-7" />
        </span>
        <h3 className="font-display text-2xl font-extrabold text-ink">
          You&apos;re on the roster!
        </h3>
        <p className="max-w-sm text-sm text-mute">
          Your volunteer profile is live. Head to the campaigns page and join
          your first drive — your city is waiting.
        </p>
        <button
          type="button"
          onClick={() => router.push("/campaigns")}
          className="btn btn-primary"
        >
          Find a drive near me
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-glow space-y-6 p-7 sm:p-8">
      {initial && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3 text-[13px] font-semibold text-emerald-500">
          <BadgeCheck className="h-4 w-4" /> You&apos;re a verified volunteer — update your profile anytime.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] font-medium text-rose-400">
          {error}
        </p>
      )}

      <div>
        <span className="label">Causes I care about</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_IDS.map((id) => {
            const m = CATEGORY_META[id];
            const active = interests.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                aria-pressed={active}
                className={cn(
                  "chip cursor-pointer !normal-case !tracking-normal !text-[13px] transition-all duration-300",
                  active
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-500 shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)]"
                    : "border-line text-mute hover:border-emerald-500/40 hover:text-emerald-500"
                )}
              >
                <m.icon className="h-4 w-4" /> {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="vf-city" className="label">Your city</label>
          <input
            id="vf-city"
            name="city"
            required
            minLength={2}
            maxLength={120}
            defaultValue={initial?.city ?? ""}
            placeholder="e.g. Jaipur"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="vf-phone" className="label">Phone (optional)</label>
          <input
            id="vf-phone"
            name="phone"
            type="tel"
            maxLength={20}
            defaultValue={initial?.phone ?? ""}
            placeholder="+91 98XXXXXXXX"
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="vf-availability" className="label">When are you usually free?</label>
        <select
          id="vf-availability"
          name="availability"
          defaultValue={initial?.availability ?? AVAILABILITY[2]}
          className="input appearance-none cursor-pointer"
        >
          {AVAILABILITY.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="vf-bio" className="label">A line about you (optional)</label>
        <textarea
          id="vf-bio"
          name="bio"
          rows={3}
          maxLength={600}
          defaultValue={initial?.bio ?? ""}
          placeholder="e.g. Student who loves teaching kids and early-morning park cleanups."
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full !py-4 text-base">
        <BadgeCheck className="h-5 w-5" />
        {loading ? "Saving…" : initial ? "Update my volunteer profile" : "Register me as a volunteer"}
      </button>
    </form>
  );
}
