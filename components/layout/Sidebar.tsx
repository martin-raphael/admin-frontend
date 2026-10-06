"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", index: "01" },
  { href: "/products", label: "Products", index: "02" },
  { href: "/categories", label: "Categories", index: "03" },
  { href: "/offers", label: "Offers", index: "04" },
  // { href: "/media", label: "Media", index: "05" },
  { href: "/testimonials", label: "Testimonials", index: "05" },
  { href: "/inquiries", label: "Inquiries", index: "06" },
  { href: "/settings", label: "Settings", index: "07" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-ink-300/40 bg-surface-subtle md:flex md:flex-col">
      {/* Brand block */}
      <div className="border-b border-ink-300/40 px-6 py-5">
        <Link href="/dashboard" className="block">
          <div className="font-display text-[19px] font-bold tracking-tight text-ink-900">
            Furnitures enSuite
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Nav — text only, numeric index, active accent bar */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map(({ href, label, index }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("nav-item", active && "nav-item-active")}
            >
              <span
                className={cn(
                  "mr-3 text-[10px] font-semibold tabular-nums tracking-widest",
                  active ? "text-brand-600" : "text-ink-400",
                )}
              >
                {index}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-ink-300/40 px-6 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
          Version 0.1.0
        </div>
      </div>
    </aside>
  );
}