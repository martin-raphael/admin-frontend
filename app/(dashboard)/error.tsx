"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AUTH_ERROR_CODES = new Set([
  "NOT_AUTHENTICATED",
  "INVALID_SESSION",
  "SESSION_REVOKED",
  "SESSION_EXPIRED",
  "IDLE_TIMEOUT",
  "ACCOUNT_DISABLED",
  "UNAUTHORIZED",
]);

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { code?: string; status?: number; digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const isAuthError =
    error.status === 401 ||
    (error.code !== undefined && AUTH_ERROR_CODES.has(error.code));

//   useEffect(() => {
//     if (!isAuthError) return;
//     const reason = error.code === "IDLE_TIMEOUT" ? "idle" : "expired";
//     router.replace(`/login?reason=${reason}`);
//   }, [isAuthError, error.code, router]);
  useEffect(() => {
    if (!isAuthError) return;

    // Clear the stale cookie so the middleware doesn't bounce us back.
    fetch("/api/logout", { method: "POST" }).catch(() => {});

    const reason = error.code === "IDLE_TIMEOUT" ? "idle" : "expired";
    router.replace(`/login?reason=${reason}`);
  }, [isAuthError, error.code, router]);

  // While the redirect is in-flight, show nothing jarring.
  if (isAuthError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink-500">Your session ended. Redirecting…</p>
      </div>
    );
  }

  // Non-auth error: show a real error state with a retry.
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <div className="eyebrow mb-3">Something went wrong</div>
      <h1 className="heading-2 mb-3">We couldn&rsquo;t load this page.</h1>
      <p className="muted mb-8">{error.message || "An unexpected error occurred."}</p>
      <div className="flex justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-secondary"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}