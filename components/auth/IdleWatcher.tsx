"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBrowser, clearTokenCookie } from "@/lib/api/browser";

const EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

export function IdleWatcher({
  idleMinutes = 60,
  warnAtMinutes = 55,
}: {
  idleMinutes?: number;
  warnAtMinutes?: number;
}) {
  const router = useRouter();
  const [warn, setWarn] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function logout() {
    try {
      await apiBrowser("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    clearTokenCookie();
    router.replace("/login?reason=idle");
  }

  function schedule() {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    setWarn(false);
    warnTimer.current = setTimeout(() => setWarn(true), warnAtMinutes * 60 * 1000);
    idleTimer.current = setTimeout(logout, idleMinutes * 60 * 1000);
  }

  useEffect(() => {
    const handler = () => schedule();
    EVENTS.forEach((e) =>
      window.addEventListener(e, handler, { passive: true }),
    );
    schedule();
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!warn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="eyebrow mb-2">Session timeout</div>
        <h3 className="heading-2 mb-2">Still there?</h3>
        <p className="muted mb-6">
          You&apos;ll be signed out in a few minutes due to inactivity.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={logout} className="btn-secondary">
            Sign out now
          </button>
          <button onClick={schedule} className="btn-primary">
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}