"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { revokeSession } from "@/lib/api/sessions";
import { ApiError } from "@/lib/api/browser";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function RevokeSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function revoke() {
    setBusy(true);
    try {
      await revokeSession(sessionId);
      toast.success("Session revoked");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not revoke session",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        disabled={busy}
        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        Revoke
      </button>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={revoke}
        title="Revoke this session?"
        description="That device will be signed out immediately and will need to log in again."
        confirmLabel="Revoke session"
      />
    </>
  );
}