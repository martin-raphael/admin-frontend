"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createOffer,
  updateOffer,
  deleteOffer,
  type Offer,
  type OfferInput,
} from "@/lib/api/offers";
import type { Product } from "@/lib/api/products";
import { ApiError } from "@/lib/api/browser";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowLocalInput() {
  return toLocalInput(new Date().toISOString());
}

function plusDaysLocalInput(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalInput(d.toISOString());
}

type Draft = {
  id?: string;
  name: string;
  description: string;
  discount_percent: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  product_ids: string[];
  bannerFile: File | null;
  bannerPreview: string | null;
  existingBannerUrl: string | null;
};

function emptyDraft(): Draft {
  return {
    name: "",
    description: "",
    discount_percent: "10",
    start_at: nowLocalInput(),
    end_at: plusDaysLocalInput(7),
    is_active: true,
    product_ids: [],
    bannerFile: null,
    bannerPreview: null,
    existingBannerUrl: null,
  };
}

function offerToDraft(o: Offer): Draft {
  return {
    id: o.id,
    name: o.name,
    description: o.description ?? "",
    discount_percent: String(o.discount_percent ?? ""),
    start_at: toLocalInput(o.start_at),
    end_at: toLocalInput(o.end_at),
    is_active: o.is_active,
    product_ids: o.product_ids,
    bannerFile: null,
    bannerPreview: null,
    existingBannerUrl: o.banner_url,
  };
}

export function OfferManager({
  initial,
  products,
}: {
  initial: Offer[];
  products: Product[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Offer | null>(null);

  function openCreate() {
    setError(null);
    setDraft(emptyDraft());
  }

  function openEdit(o: Offer) {
    setError(null);
    setDraft(offerToDraft(o));
  }

  function closeDraft() {
    if (draft?.bannerPreview) URL.revokeObjectURL(draft.bannerPreview);
    setDraft(null);
    setError(null);
  }

  function toggleProduct(id: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      product_ids: draft.product_ids.includes(id)
        ? draft.product_ids.filter((x) => x !== id)
        : [...draft.product_ids, id],
    });
  }

  function pickBanner(file: File | null) {
    if (!draft) return;
    if (draft.bannerPreview) URL.revokeObjectURL(draft.bannerPreview);
    setDraft({
      ...draft,
      bannerFile: file,
      bannerPreview: file ? URL.createObjectURL(file) : null,
    });
  }

  async function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError("Offer name is required.");
    if (!draft.start_at || !draft.end_at)
      return setError("Start and end dates are required.");
    if (new Date(draft.end_at) <= new Date(draft.start_at))
      return setError("End date must be after the start date.");

    setBusy(true);
    setError(null);

    const payload: OfferInput = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      banner_url: draft.existingBannerUrl, // for now, banner uploads handled separately
      discount_percent: draft.discount_percent
        ? Number(draft.discount_percent)
        : null,
      start_at: new Date(draft.start_at).toISOString(),
      end_at: new Date(draft.end_at).toISOString(),
      product_ids: draft.product_ids,
      is_active: draft.is_active,
    };

    try {
      if (draft.id) {
        await updateOffer(draft.id, payload);
        toast.success("Offer updated");
      } else {
        await createOffer(payload);
        toast.success("Offer created");
      }
      closeDraft();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteOffer(toDelete.id);
      toast.success("Offer deleted");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not delete offer.";
      toast.error(message);
    }
  }

  function offerStatus(o: Offer): { label: string; className: string } {
    const now = new Date();
    const start = new Date(o.start_at);
    const end = new Date(o.end_at);

    if (!o.is_active) return { label: "Disabled", className: "badge-grey" };
    if (now < start) return { label: "Scheduled", className: "badge-blue" };
    if (now > end) return { label: "Ended", className: "badge-grey" };
    return { label: "Live", className: "badge-green" };
  }

  function productLabel(id: string) {
    const p = products.find((x) => x.id === id);
    return p ? p.name : id.slice(-6);
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button onClick={openCreate} className="btn-primary">
          Create offer
        </button>
      </div>

      {initial.length === 0 ? (
        <EmptyState
          title="No offers yet"
          description="Create a campaign to apply a discount to selected products for a set period."
          action={
            <button onClick={openCreate} className="btn-primary">
              Create your first offer
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {initial.map((o) => {
            const status = offerStatus(o);
            return (
              <div key={o.id} className="card relative overflow-hidden p-5">
                <div
                  className={
                    "absolute left-0 top-0 h-full w-[3px] " +
                    (status.label === "Live"
                      ? "bg-accent-500"
                      : status.label === "Scheduled"
                        ? "bg-brand-500"
                        : "bg-ink-300")
                  }
                />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="heading-3 truncate">{o.name}</h3>
                      <span className={status.className}>{status.label}</span>
                    </div>
                    {o.description && (
                      <p className="muted mt-1 max-w-2xl">{o.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-500">
                      <span>
                        <strong className="text-ink-700">
                          {o.discount_percent ?? 0}%
                        </strong>{" "}
                        off
                      </span>
                      <span>
                        {new Date(o.start_at).toLocaleString("en-KE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        →{" "}
                        {new Date(o.end_at).toLocaleString("en-KE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span>
                        <strong className="text-ink-700">
                          {o.product_ids.length}
                        </strong>{" "}
                        product{o.product_ids.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {o.product_ids.length > 0 && o.product_ids.length <= 4 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {o.product_ids.map((id) => (
                          <span
                            key={id}
                            className="rounded-full bg-surface-subtle px-3 py-1 text-xs text-ink-600"
                          >
                            {productLabel(id)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => openEdit(o)}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setToDelete(o)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={draft !== null}
        onClose={closeDraft}
        title={draft?.id ? "Edit offer" : "Create offer"}
        description="A campaign that applies a discount to selected products."
        size="lg"
      >
        {draft && (
          <div className="space-y-5">
            <div>
              <label className="label">Offer name *</label>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. December Sale"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[70px] resize-y"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                placeholder="Short text shown alongside the offer"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Discount %</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="input"
                  value={draft.discount_percent}
                  onChange={(e) =>
                    setDraft({ ...draft, discount_percent: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="label">Status</label>
                <select
                  className="input"
                  value={draft.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setDraft({ ...draft, is_active: e.target.value === "true" })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Starts *</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={draft.start_at}
                  onChange={(e) =>
                    setDraft({ ...draft, start_at: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Ends *</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={draft.end_at}
                  onChange={(e) =>
                    setDraft({ ...draft, end_at: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="label mb-0">
                  Products in this offer ({draft.product_ids.length} selected)
                </label>
                {draft.product_ids.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, product_ids: [] })}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-ink-300/40">
                {products.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-ink-500">
                    No products yet. Create products first.
                  </p>
                ) : (
                  products.map((p) => {
                    const checked = draft.product_ids.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={
                          "flex cursor-pointer items-center gap-3 border-b border-ink-300/30 px-4 py-2.5 last:border-b-0 transition " +
                          (checked ? "bg-brand-50/50" : "hover:bg-surface-subtle")
                        }
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(p.id)}
                          className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-ink-900">
                            {p.name}
                          </div>
                          <div className="text-xs tabular-nums text-ink-500">
                            {p.sku} · KES {p.price.toLocaleString()}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeDraft} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="btn-primary"
              >
                {busy ? "Saving…" : draft.id ? "Save changes" : "Create offer"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete offer?"
        description={
          toDelete
            ? `"${toDelete.name}" will be permanently removed. Products will revert to their regular prices.`
            : ""
        }
        confirmLabel="Delete offer"
      />
    </>
  );
}