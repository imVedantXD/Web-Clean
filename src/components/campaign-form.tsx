"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  FileText,
  Image as ImageIcon,
  MapPin,
  Rocket,
  Type,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_META, cn, type CategoryId } from "@/lib/utils";

const CATEGORY_IDS = Object.keys(CATEGORY_META) as CategoryId[];

export function CampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryId>("cleanup");
  const [imageKey, setImageKey] = useState<CategoryId>("cleanup");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "");
    const summary = String(form.get("summary") ?? "");
    const description = String(form.get("description") ?? "");
    const city = String(form.get("city") ?? "");
    const location = String(form.get("location") ?? "");
    const volunteersNeeded = Number(form.get("volunteersNeeded") ?? 20);
    const startLocal = String(form.get("startAt") ?? "");
    const endLocal = String(form.get("endAt") ?? "");

    if (!startLocal) {
      setError("Pick a start date & time for your drive.");
      return;
    }

    const payload = {
      title,
      summary,
      description,
      category,
      city,
      location,
      volunteersNeeded,
      imageKey,
      startAt: new Date(startLocal).toISOString(),
      endAt: endLocal ? new Date(endLocal).toISOString() : undefined,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not create the campaign.");
        return;
      }
      toast.success("Campaign published — visible to everyone, instantly!");
      router.push(`/campaigns/${data.slug}`);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] font-medium text-rose-400">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="cf-title" className="label">
          <Type className="mr-1 inline h-3.5 w-3.5 text-emerald-500" /> Campaign title
        </label>
        <input id="cf-title" name="title" required minLength={6} maxLength={160} placeholder="e.g. Sunday Lake Cleanup at Sankey Tank" className="input" />
      </div>

      <div>
        <span className="label">Cause category</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_IDS.map((id) => {
            const m = CATEGORY_META[id];
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCategory(id);
                  setImageKey(id);
                }}
                className={cn(
                  "chip cursor-pointer transition-all duration-300 !normal-case !tracking-normal !text-[13px]",
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
          <label htmlFor="cf-city" className="label">
            <MapPin className="mr-1 inline h-3.5 w-3.5 text-emerald-500" /> City
          </label>
          <input id="cf-city" name="city" required minLength={2} maxLength={120} placeholder="e.g. Bengaluru" className="input" />
        </div>
        <div>
          <label htmlFor="cf-location" className="label">Exact venue / area</label>
          <input id="cf-location" name="location" required minLength={3} maxLength={255} placeholder="e.g. Sankey Tank main gate" className="input" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-start" className="label">
            <CalendarClock className="mr-1 inline h-3.5 w-3.5 text-emerald-500" /> Starts
          </label>
          <input id="cf-start" name="startAt" type="datetime-local" required className="input" />
        </div>
        <div>
          <label htmlFor="cf-end" className="label">Ends (optional)</label>
          <input id="cf-end" name="endAt" type="datetime-local" className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="cf-summary" className="label">
          <FileText className="mr-1 inline h-3.5 w-3.5 text-emerald-500" /> One-line summary
        </label>
        <textarea id="cf-summary" name="summary" required minLength={20} maxLength={300} rows={2} placeholder="A crisp pitch volunteers will see on the card — what, where, why." className="input resize-none" />
      </div>

      <div>
        <label htmlFor="cf-description" className="label">Full description</label>
        <textarea id="cf-description" name="description" required minLength={50} maxLength={5000} rows={6} placeholder="Plan of the day, what to bring, who to contact on arrival, impact goals…" className="input" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-needed" className="label">
            <Users className="mr-1 inline h-3.5 w-3.5 text-emerald-500" /> Volunteers needed
          </label>
          <input id="cf-needed" name="volunteersNeeded" type="number" min={1} max={5000} defaultValue={20} required className="input" />
        </div>
        <div>
          <span className="label">
            <ImageIcon className="mr-1 inline h-3.5 w-3.5 text-emerald-500" /> Cover image
          </span>
          <div className="flex gap-2">
            {CATEGORY_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setImageKey(id)}
                aria-label={`Use ${CATEGORY_META[id].label} cover`}
                className={cn(
                  "relative h-12 w-16 overflow-hidden rounded-lg border-2 transition-all duration-300",
                  imageKey === id
                    ? "border-emerald-500 shadow-[0_0_16px_-2px_rgba(16,185,129,0.7)]"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CATEGORY_META[id].image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full !py-4 text-base">
        <Rocket className="h-5 w-5" />
        {loading ? "Publishing…" : "Publish campaign"}
      </button>
    </form>
  );
}
