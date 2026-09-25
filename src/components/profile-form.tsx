"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; city: string | null; bio: string | null };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          city: String(form.get("city") ?? "") || undefined,
          bio: String(form.get("bio") ?? "") || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not save your profile.");
        return;
      }
      toast.success("Profile updated.");
      router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="pf-name" className="label">Display name</label>
        <input id="pf-name" name="name" required minLength={2} maxLength={80} defaultValue={initial.name} className="input" />
      </div>
      <div>
        <label htmlFor="pf-city" className="label">City</label>
        <input id="pf-city" name="city" maxLength={120} defaultValue={initial.city ?? ""} placeholder="Where do you serve?" className="input" />
      </div>
      <div>
        <label htmlFor="pf-bio" className="label">Bio</label>
        <textarea id="pf-bio" name="bio" rows={3} maxLength={600} defaultValue={initial.bio ?? ""} placeholder="Tell the community who you are…" className="input resize-none" />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        <Save className="h-4 w-4" />
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
