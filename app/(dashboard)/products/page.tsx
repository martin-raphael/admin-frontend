import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PaginatedProducts } from "@/lib/api/products";
import type { Category } from "@/lib/api/categories";

function formatKES(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category_id?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const [data, categories] = await Promise.all([
    apiFetch<PaginatedProducts>(
      `/api/v1/products?page=${page}&page_size=20` +
        (sp.q ? `&q=${encodeURIComponent(sp.q)}` : "") +
        (sp.category_id ? `&category_id=${sp.category_id}` : "") +
        (sp.status ? `&status=${sp.status}` : ""),
    ),
    apiFetch<Category[]>("/api/v1/categories"),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <PageHeader
        eyebrow="Catalog · 01"
        title="Products"
        description="Every piece in your catalog. Draft, publish, feature, and set offers here."
        action={
          <Link href="/products/new" className="btn-primary">
            Add product
          </Link>
        }
      />

      {/* Filter bar */}
      <form className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[220px] flex-1">
          <label className="label">Search</label>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Name or SKU"
            className="input"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="label">Category</label>
          <select
            name="category_id"
            defaultValue={sp.category_id ?? ""}
            className="input"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[150px]">
          <label className="label">Status</label>
          <select name="status" defaultValue={sp.status ?? ""} className="input">
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <button type="submit" className="btn-secondary">
          Apply
        </button>
        {(sp.q || sp.category_id || sp.status) && (
          <Link href="/products" className="btn-ghost">
            Clear
          </Link>
        )}
      </form>

      {data.items.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Your catalog is empty. Add your first piece to get started."
          action={
            <Link href="/products/new" className="btn-primary">
              Add your first product
            </Link>
          }
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-16">#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th className="text-right">Price</th>
                  <th>Status</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p, i) => {
                  const rowNumber = String((page - 1) * 20 + i + 1).padStart(3, "0");
                  return (
                    <tr key={p.id}>
                      <td className="text-[11px] font-semibold tracking-widest text-ink-400">
                        {rowNumber}
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-surface-subtle" />
                          )}
                          <div>
                            <Link
                              href={`/products/${p.id}/edit`}
                              className="font-medium text-ink-900 hover:text-brand-600"
                            >
                              {p.name}
                            </Link>
                            {p.is_featured && (
                              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                                Featured
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-xs tabular-nums text-ink-500">
                        {p.sku}
                      </td>
                      <td className="text-sm">
                        {catMap.get(p.category_id) ?? "—"}
                      </td>
                      <td className="text-right">
                        {p.offer_price ? (
                          <div>
                            <div className="font-medium text-accent-700">
                              {formatKES(p.offer_price)}
                            </div>
                            <div className="text-xs text-ink-400 line-through">
                              {formatKES(p.price)}
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {formatKES(p.price)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            p.status === "published"
                              ? "badge-green"
                              : "badge-grey"
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/products/${p.id}/edit`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-ink-500">
                Page {data.page} of {data.pages} · {data.total} total
              </div>
              <div className="flex gap-2">
                {data.page > 1 && (
                  <Link
                    href={`/products?page=${data.page - 1}`}
                    className="btn-secondary"
                  >
                    Previous
                  </Link>
                )}
                {data.page < data.pages && (
                  <Link
                    href={`/products?page=${data.page + 1}`}
                    className="btn-secondary"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}