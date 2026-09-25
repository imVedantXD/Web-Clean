"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCheck, LogOut, RotateCcw, Undo2 } from "lucide-react";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      toast.success("Signed out. See you soon!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={signOut} disabled={loading} className="btn btn-outline !px-4 !py-2 text-[13px]">
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function CampaignStatusActions({
  campaignId,
  status,
}: {
  campaignId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(action: "complete" | "cancel" | "reactivate") {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not update the campaign.");
        return;
      }
      toast.success("Campaign updated.");
      router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" onClick={(e) => e.preventDefault()}>
      {status === "active" ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => act("complete")}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-500 transition-all hover:shadow-[0_0_16px_-4px_rgba(16,185,129,0.7)]"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark completed
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => act("cancel")}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-400 transition-all hover:shadow-[0_0_16px_-4px_rgba(244,63,94,0.7)]"
          >
            <Ban className="h-3.5 w-3.5" /> Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => act("reactivate")}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-bold text-mute transition-all hover:border-emerald-500/40 hover:text-emerald-500"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reactivate
        </button>
      )}
    </div>
  );
}

export function LeaveButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function leave() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/join`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not leave right now.");
        return;
      }
      toast.success("You've left this campaign.");
      router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        leave();
      }}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-bold text-mute transition-all hover:border-rose-500/40 hover:text-rose-400"
      title="Leave this campaign"
    >
      <Undo2 className="h-3.5 w-3.5" />
      {loading ? "Leaving…" : "Leave"}
    </button>
  );
}
