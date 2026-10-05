"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createProduct,
  updateProduct,
  type Product,
} from "@/lib/api/products";
import type { Category } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/browser";
import { ImageUploader, type NewImage } from "@/components/ui/ImageUploader";
import { SpecsEditor, type Spec } from "@/components/ui/SpecsEditor";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Props = {
  categories: Category[];
  product?: Product;
};

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(
    product?.price !== undefined ? String(product.price) : "",
  );
  const [offerPrice, setOfferPrice] = useState(
    product?.offer_price !== undefined && product.offer_price !== null
      ? String(product.offer_price)
      : "",
  );
  const [shortDescription, setShortDescription] = useState(
    product?.short_description ?? "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [stockStatus, setStockStatus] = useState(
    product?.stock_status ?? "in_stock",
  );
  const [status, setStatus] = useState<"draft" | "published">(
    product?.status ?? "draft",
  );
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [specs, setSpecs] = useState<Spec[]>(
    product
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
      : [],
  );

  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const existingImages = (product?.images ?? []).filter(
    (img) => !removedImageIds.includes(img.public_id),
  );

  function addNewImages(files: File[]) {
    setNewImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function removeNewImage(i: number) {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, idx) => idx !== i);
    });
  }

  function removeExisting(publicId: string) {
    setRemovedImageIds((prev) => [...prev, publicId]);
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("category_id", categoryId);
    fd.append("price", price);
    fd.append("offer_price", offerPrice);
    fd.append("short_description", shortDescription);
    fd.append("description", description);
    fd.append("stock_status", stockStatus);
    fd.append("status", status);
    fd.append("is_featured", isFeatured ? "true" : "false");

    const specsObj = Object.fromEntries(
      specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]),
    );
    fd.append("specs", JSON.stringify(specsObj));

    if (isEdit && removedImageIds.length > 0) {
      fd.append("remove_image_ids", removedImageIds.join(","));
    }

    newImages.forEach((img) => fd.append("new_images", img.file));
    return fd;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Product name is required.");
    if (!categoryId) return setError("Please choose a category.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");
    if (offerPrice && Number(offerPrice) >= Number(price)) {
      return setError("Offer price must be less than the regular price.");
    }

    setBusy(true);
    try {
      const fd = buildFormData();
      if (isEdit && product) {
        await updateProduct(product.id, fd);
        toast.success("Product updated");
      } else {
        await createProduct(fd);
        toast.success("Product created");
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong.";
      setError(message);
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!product) return;
    try {
      const { deleteProduct } = await import("@/lib/api/products");
      await deleteProduct(product.id);
      toast.success("Product deleted");
      router.push("/products");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not delete product.";
      toast.error(message);
    }
  }

  if (categories.length === 0) {
    return (
      <div className="card p-8 text-center">
        <h3 className="heading-3 mb-2">Create a category first</h3>
        <p className="muted mb-5">
          Every product must belong to a category. Add at least one before
          creating products.
        </p>
        <button
          onClick={() => router.push("/categories")}
          className="btn-primary"
        >
          Go to categories
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Identity */}
        <section className="card-padded">
          <SectionHeading index="01" title="Identity" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Product name *</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 3-Seater Fabric Sofa"
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select a category…</option>
                {categories
                  .filter((c) => c.is_active)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label">SKU</label>
              <input
                className="input"
                value={product?.sku ?? ""}
                placeholder="Auto-generated if left blank"
                disabled
              />
              <p className="hint">
                {isEdit
                  ? "SKU cannot be changed after creation."
                  : "Leave blank — the system assigns one automatically."}
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="card-padded">
          <SectionHeading index="02" title="Pricing" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Regular price (KES) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Offer price (KES)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Leave blank for no offer"
              />
              <p className="hint">
                If set and lower than the regular price, the discount badge
                shows automatically.
              </p>
            </div>
          </div>
          {offerPrice && Number(offerPrice) < Number(price) && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-accent-200 bg-accent-50 px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-600" />
              <span className="text-sm text-accent-800">
                Offer active ·{" "}
                <strong>
                  {Math.round(
                    (1 - Number(offerPrice) / Number(price)) * 100,
                  )}
                  % off
                </strong>{" "}
                · Customers pay KES {Number(offerPrice).toLocaleString()}
              </span>
            </div>
          )}
        </section>

        {/* Content */}
        <section className="card-padded">
          <SectionHeading index="03" title="Content" />
          <div className="space-y-5">
            <div>
              <label className="label">Short description</label>
              <input
                className="input"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One line for cards and previews"
              />
            </div>
            <div>
              <label className="label">Full description</label>
              <textarea
                className="input min-h-[140px] resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description, materials, comfort, warranty…"
              />
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="card-padded">
          <SectionHeading index="04" title="Specifications" />
          <SpecsEditor specs={specs} onChange={setSpecs} />
        </section>

        {/* Images */}
        <section className="card-padded">
          <SectionHeading index="05" title="Images" />
          <ImageUploader
            existing={existingImages.map((img) => ({
              url: img.url,
              public_id: img.public_id,
              is_primary: img.is_primary,
            }))}
            onRemoveExisting={isEdit ? removeExisting : undefined}
            newImages={newImages}
            onAddNew={addNewImages}
            onRemoveNew={removeNewImage}
          />
          {removedImageIds.length > 0 && (
            <p className="hint mt-3 text-red-600">
              {removedImageIds.length} image
              {removedImageIds.length > 1 ? "s" : ""} marked for removal on save.
            </p>
          )}
        </section>

        {/* Visibility */}
        <section className="card-padded">
          <SectionHeading index="06" title="Visibility" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">Stock status</label>
              <select
                className="input"
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as typeof stockStatus)}
              >
                <option value="in_stock">In stock</option>
                <option value="made_to_order">Made to order</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>
            <div>
              <label className="label">Publish status</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              >
                <option value="draft">Draft — hidden</option>
                <option value="published">Published — visible</option>
              </select>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              <span className="block text-sm font-medium text-ink-900">
                Feature on homepage
              </span>
              <span className="block text-xs text-ink-500">
                Featured products appear in the &ldquo;Trending Now&rdquo; section.
              </span>
            </span>
          </label>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn-danger"
              >
                Delete product
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="btn-secondary"
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete this product?"
        description={`"${product?.name}" will be permanently removed, including its images on Cloudinary. This cannot be undone.`}
        confirmLabel="Delete product"
      />
    </>
  );
}

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="text-[11px] font-semibold tracking-widest text-brand-600">
        {index}
      </span>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-700">
        {title}
      </h2>
      <span className="h-px flex-1 bg-ink-300/50" />
    </div>
  );
}