"use client";

import { useRouter } from "next/navigation";
import type { Admin } from "@/server/auth";
import { apiBrowser } from "@/lib/api/browser";

export function Topbar({ admin }: { admin: Admin }) {
  const router = useRouter();

  async function logout() {
    try {
      await apiBrowser("/api/v1/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  }

  const initials = admin.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-300/40 bg-white/80 px-6 backdrop-blur-md lg:px-10">
      <div className="flex items-center gap-3">
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500 sm:block">
          Signed in as
        </span>
        <span className="hidden h-4 w-px bg-ink-300 sm:block" />
        <span className="text-sm font-medium text-ink-900">
          {admin.email_display}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <div className="text-sm font-medium leading-tight text-ink-900">
              {admin.name}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] leading-tight text-brand-600">
              {admin.role}
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials || "A"}
          </div>
        </div>

        <span className="hidden h-6 w-px bg-ink-300 sm:block" />

        <button
          onClick={logout}
          className="btn-ghost text-[13px] font-semibold uppercase tracking-wider"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}