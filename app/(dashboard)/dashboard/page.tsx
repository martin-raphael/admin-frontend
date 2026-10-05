import { PageHeader } from "@/components/layout/PageHeader";
import { SessionsPanel } from "@/components/dashboard/SessionsPanel";
import { getCurrentAdmin } from "@/server/auth";
import { apiFetch } from "@/lib/api/client";

type Stats = {
  products: {
    total: number;
    published: number;
    drafts: number;
    featured: number;
  };
  categories: number;
  active_offers: number;
  inquiries_last_7_days: number;
};

export default async function DashboardPage() {
  // Shared with the layout's call — no extra fetch, no race condition.
  const admin = await getCurrentAdmin();

  // The layout is redirecting. Render nothing — no wasted fetch, no error.
  if (!admin) return null;

  const stats = await apiFetch<Stats>("/api/v1/dashboard/stats");

  const cards = [
    { label: "Total products", value: stats.products.total, tone: "blue" as const },
    { label: "Published", value: stats.products.published, tone: "green" as const },
    { label: "Drafts", value: stats.products.drafts, tone: "grey" as const },
    { label: "Featured", value: stats.products.featured, tone: "blue" as const },
    { label: "Categories", value: stats.categories, tone: "grey" as const },
    { label: "Active offers", value: stats.active_offers, tone: "green" as const },
    { label: "Inquiries (7 days)", value: stats.inquiries_last_7_days, tone: "blue" as const },
  ];

  const toneBar: Record<string, string> = {
    blue: "bg-brand-600",
    green: "bg-accent-600",
    grey: "bg-ink-400",
  };

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="A snapshot of your catalog, offers, and recent customer interest."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card relative overflow-hidden p-5">
            <div
              className={`absolute left-0 top-0 h-full w-[3px] ${toneBar[c.tone]}`}
            />
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              {c.label}
            </div>
            <div className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900">
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <SessionsPanel />
    </>
  );
}