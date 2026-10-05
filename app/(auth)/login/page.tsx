"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiBrowser, ApiError } from "@/lib/api/browser";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiBrowser("/api/v1/auth/login", {
        method: "POST",
        json: { email, password },
      });
      sessionStorage.setItem("pf_pending_email", email.toLowerCase());
      toast.success("Verification code sent");
      router.push("/verify-otp");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Unable to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        <span className="eyebrow">Step 01</span>
        <span className="h-px flex-1 bg-ink-300/60" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
          Identity
        </span>
      </div>

      <h1 className="heading-2 mb-2">Sign in</h1>
      <p className="muted mb-8">
        Enter your credentials to access the admin console.
      </p>

      {reason === "idle" && (
        <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-sm font-medium text-brand-800">
            You were signed out due to inactivity.
          </p>
          <p className="mt-0.5 text-xs text-brand-700">
            Sign in again to continue where you left off.
          </p>
        </div>
      )}

      {reason === "expired" && (
        <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-sm font-medium text-brand-800">
            Your session has ended.
          </p>
          <p className="mt-0.5 text-xs text-brand-700">
            Sign in again to continue.
          </p>
        </div>
      )}

      {reason === "password-changed" && (
        <div className="mb-6 rounded-lg border border-accent-200 bg-accent-50 px-4 py-3">
          <p className="text-sm font-medium text-accent-800">
            Password updated successfully.
          </p>
          <p className="mt-0.5 text-xs text-accent-700">
            Sign in with your new password.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            className="input"
            placeholder="you@primefurnitures.co.ke"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="btn-primary w-full"
        >
          {loading ? "Verifying…" : "Continue"}
        </button>
      </form>

      <div className="mt-8 border-t border-ink-300/40 pt-6">
        <p className="text-center text-xs text-ink-500">
          Having trouble?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Reset your password
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-[420px]" />}>
      <LoginForm />
    </Suspense>
  );
}