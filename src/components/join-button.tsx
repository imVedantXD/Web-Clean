"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Handshake, LogIn, Undo2 } from "lucide-react";
import { toast } from "sonner";

export function JoinButton({
  campaignId,
  slug,
  joined,
  canJoin,
  isAuthed,
  reason,
}: {
  campaignId: string;
  slug: string;
  joined: boolean;
  canJoin: boolean;
  isAuthed: boolean;
  reason?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isAuthed) {
    return (
      <button
        type="button"
        onClick={() =>
          router.push(`/auth/signin?next=${encodeURIComponent(`/campaigns/${slug}`)}`)
        }
        className="btn btn-primary w-full"
      >
        <LogIn className="h-4 w-4" /> Sign in to join this drive
      </button>
    );
  }

  async function act(method: "POST" | "DELETE") {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/join`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({}) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        return;
      }
      toast.success(
        method === "POST"
          ? "You're in! The organizer can now see you."
          : "You've left this campaign."
      );
      router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (joined) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/12 px-6 py-3 text-sm font-bold text-emerald-500">
          <CheckCircle2 className="h-4 w-4" /> You&apos;re volunteering
        </div>
        <button
          type="button"
          onClick={() => act("DELETE")}
          disabled={loading}
          className="btn btn-outline w-full !py-2 text-xs"
        >
          <Undo2 className="h-3.5 w-3.5" />
          {loading ? "Updating…" : "Leave this drive"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => act("POST")}
      disabled={loading || !canJoin}
      className="btn btn-primary w-full"
      title={reason ?? undefined}
    >
      <Handshake className="h-4 w-4" />
      {loading ? "Joining…" : canJoin ? "Join this drive" : reason ?? "Unavailable"}
    </button>
  );
}
