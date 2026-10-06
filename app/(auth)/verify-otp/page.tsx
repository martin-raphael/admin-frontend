"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  apiBrowser,
  ApiError,
  setTokenCookie,
} from "@/lib/api/browser";
import { toast } from "sonner";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("pf_pending_email");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setEmail(stored);
    inputRefs.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const code = digits.join("");
  const isComplete = code.length === OTP_LENGTH;

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError(null);

    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

    async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || !email) return;

    setError(null);
    setLoading(true);

        try {
      const res = await apiBrowser<{
        must_change_password: boolean;
        session_token?: string;
      }>("/api/v1/auth/verify-otp", {
        method: "POST",
        json: { email, code },
      });

      if (res.session_token) {
        setTokenCookie(res.session_token, SESSION_MAX_AGE);
      }

      sessionStorage.removeItem("pf_pending_email");
      toast.success("Signed in");

      const next = res.must_change_password
        ? "/change-password"
        : "/dashboard";

      // Full-page navigation — forces the browser to send the freshly
      // written pf_token cookie to Vercel's server. router.replace()
      // does an RSC fetch which Vercel may serve from a stale cache.
      setTimeout(() => {
        window.location.href = next;
      }, 100);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Verification failed";
      setError(message);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (seconds > 0 || !email) return;
    try {
      await apiBrowser("/api/v1/auth/resend-otp", {
        method: "POST",
        json: { email },
      });
      toast.success("New code sent");
      setSeconds(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not resend code";
      toast.error(message);
    }
  }

  function maskEmail(value: string) {
    const [local, domain] = value.split("@");
    if (!domain || local.length <= 2) return value;
    return `${local[0]}${"•".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  }

  if (!email) return <div className="h-[420px]" />;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="eyebrow">Step 02</span>
        <span className="h-px flex-1 bg-ink-300/60" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
          Verification
        </span>
      </div>

      <h1 className="heading-2 mb-2">Check your email</h1>
      <p className="muted mb-8">
        We sent a six-digit code to{" "}
        <span className="font-medium text-ink-700">{maskEmail(email)}</span>.
        It expires in 5 minutes.
      </p>

      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <div className="flex justify-between gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={
                  "h-14 w-full rounded-lg border bg-white text-center text-xl font-semibold text-ink-900 " +
                  "transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 " +
                  (error
                    ? "border-red-300"
                    : digit
                      ? "border-brand-400"
                      : "border-ink-300")
                }
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isComplete}
          className="btn-primary w-full"
        >
          {loading ? "Verifying…" : "Verify and continue"}
        </button>
      </form>

      <div className="mt-8 flex items-center justify-between border-t border-ink-300/40 pt-6 text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={seconds > 0}
          className="font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-ink-400"
        >
          {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
        </button>

        <Link href="/login" className="text-ink-500 hover:text-ink-900">
          Use a different account
        </Link>
      </div>
    </div>
  );
}