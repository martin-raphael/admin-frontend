"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  apiBrowser,
  ApiError,
  clearTokenCookie,
} from "@/lib/api/browser";
import { toast } from "sonner";

type Rule = { label: string; test: (pw: string) => boolean };

const RULES: Rule[] = [
  { label: "At least 10 characters", test: (p) => p.length >= 10 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function ChangePasswordForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(
    () => RULES.map((r) => ({ ...r, pass: r.test(password) })),
    [password],
  );
  const allPass = results.every((r) => r.pass);
  const matches = password.length > 0 && password === confirm;
  const canSubmit = allPass && matches && !loading;

  function resolvedEmail(): string | null {
    const fromUrl = params.get("email");
    if (fromUrl) return fromUrl;
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("pf_pending_email");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      await apiBrowser("/api/v1/auth/change-password", {
        method: "POST",
        json: {
          new_password: password,
          email: resolvedEmail() ?? undefined,
        },
      });

      // The password change invalidates all sessions — wipe the token.
      clearTokenCookie();
      sessionStorage.removeItem("pf_pending_email");

      toast.success("Password updated");
      router.replace("/login?reason=password-changed");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not update password";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="eyebrow">Step 03</span>
        <span className="h-px flex-1 bg-ink-300/60" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
          Security
        </span>
      </div>

      <h1 className="heading-2 mb-2">Set a new password</h1>
      <p className="muted mb-8">
        Your temporary password must be replaced before you can continue.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="label">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-4 space-y-2">
            {results.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span
                  className={
                    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors " +
                    (r.pass ? "bg-accent-500" : "bg-ink-300")
                  }
                />
                <span
                  className={
                    "text-xs transition-colors " +
                    (r.pass ? "text-accent-700" : "text-ink-500")
                  }
                >
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="label">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirm.length > 0 && !matches && (
            <p className="error-text">Passwords do not match.</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button type="submit" disabled={!canSubmit} className="btn-primary w-full">
          {loading ? "Saving…" : "Save and sign in"}
        </button>
      </form>

      <div className="mt-8 border-t border-ink-300/40 pt-6">
        <p className="text-center text-xs text-ink-500">
          You&apos;ll be asked to sign in again with your new password.
        </p>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="h-[420px]" />}>
      <ChangePasswordForm />
    </Suspense>
  );
}