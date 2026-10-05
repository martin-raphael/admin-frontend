import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Inquiry } from "@/lib/api/inquiries";

export default async function InquiriesPage() {
  const inquiries = await apiFetch<Inquiry[]>("/api/v1/inquiries");

  // Summary counts
  const total = inquiries.length;
  const whatsapp = inquiries.filter((i) => i.channel === "whatsapp").length;
  const email = inquiries.filter((i) => i.channel === "email").length;

  // Top products by inquiry count
  const counts = new Map<string, { name: string; count: number }>();
  inquiries.forEach((i) => {
    const existing = counts.get(i.product_id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(i.product_id, { name: i.product_name, count: 1 });
    }
  });
  const topProducts = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Customer interest"
        title="Inquiries"
        description="Every time a customer taps Order on WhatsApp or Email, it's logged here."
      />

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card relative overflow-hidden p-5">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-brand-600" />
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Total inquiries
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900">
            {total}
          </div>
        </div>
        <div className="card relative overflow-hidden p-5">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-accent-500" />
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Via WhatsApp
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900">
            {whatsapp}
          </div>
        </div>
        <div className="card relative overflow-hidden p-5">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-ink-400" />
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Via email
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900">
            {email}
          </div>
        </div>
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <div className="card mb-8 p-6">
          <h2 className="heading-3 mb-4">Most inquired products</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const max = topProducts[0].count;
              const pct = (p.count / max) * 100;
              return (
                <div key={p.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-ink-900">
                      {p.name}
                    </span>
                    <span className="ml-4 shrink-0 tabular-nums text-ink-500">
                      {p.count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full log */}
      {inquiries.length === 0 ? (
        <EmptyState
          title="No inquiries yet"
          description="As customers browse your storefront and tap Order on WhatsApp or Email, their interest will show up here."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-right">Price at time</th>
                <th>Channel</th>
                <th className="text-right">When</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((i, idx) => (
                <tr key={i.id}>
                  <td className="text-[11px] font-semibold tracking-widest text-ink-400">
                    {String(idx + 1).padStart(3, "0")}
                  </td>
                  <td>
                    <Link
                      href={`/products/${i.product_id}/edit`}
                      className="font-medium text-ink-900 hover:text-brand-600"
                    >
                      {i.product_name}
                    </Link>
                  </td>
                  <td className="text-xs tabular-nums text-ink-500">
                    {i.product_sku}
                  </td>
                  <td className="text-right tabular-nums">
                    KES {i.price_at_time.toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={
                        i.channel === "whatsapp"
                          ? "badge-green"
                          : "badge-blue"
                      }
                    >
                      {i.channel === "whatsapp" ? "WhatsApp" : "Email"}
                    </span>
                  </td>
                  <td className="text-right text-xs text-ink-500">
                    {new Date(i.created_at).toLocaleString("en-KE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}