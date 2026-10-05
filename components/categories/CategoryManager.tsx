"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/lib/api/categories";
import { ApiError } from "@/lib/api/browser";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";

type Draft = {
  id?: string;
  name: string;
  description: string;
  order: string;
  is_active: boolean;
  imageFile: File | null;
  imagePreview: string | null;
  existingImageUrl: string | null;
  complementary_category_ids: string[];
};

const emptyDraft: Draft = {
  name: "",
  description: "",
  order: "0",
  is_active: true,
  imageFile: null,
  imagePreview: null,
  existingImageUrl: null,
  complementary_category_ids: [],
};

export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  function openCreate() {
    setError(null);
    setDraft({ ...emptyDraft });
  }

  function openEdit(c: Category) {
    setError(null);
    setDraft({
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      order: String(c.order),
      is_active: c.is_active,
      imageFile: null,
      imagePreview: null,
      existingImageUrl: c.image_url,
      complementary_category_ids: c.complementary_category_ids ?? [],
    });
  }

  function closeDraft() {
    if (draft?.imagePreview) URL.revokeObjectURL(draft.imagePreview);
    setDraft(null);
    setError(null);
  }

  function pickImage(file: File | null) {
    if (!draft) return;
    if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
    setDraft({
      ...draft,
      imageFile: file,
      imagePreview: file ? URL.createObjectURL(file) : null,
    });
  }

  async function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError("Category name is required.");

    setBusy(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("name", draft.name);
      fd.append("description", draft.description);
      fd.append("order", draft.order || "0");
      if (draft.imageFile) fd.append("image", draft.imageFile);

      if (draft.id) {
        fd.append("is_active", draft.is_active ? "true" : "false");
        fd.append(
          "complementary_category_ids",
          draft.complementary_category_ids.join(","),
        );
        await updateCategory(draft.id, fd);
        toast.success("Category updated");
      } else {
        await createCategory(fd);
        toast.success("Category created");
      }

      closeDraft();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete.id);
      toast.success("Category deleted");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not delete category.";
      toast.error(message);
    }
  }

  const otherCategories = draft
    ? initial.filter((c) => c.id !== draft.id)
    : [];

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button onClick={openCreate} className="btn-primary">
          Add category
        </button>
      </div>

      {initial.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Categories group your products into sections like Sofas, Beds, or Office."
          action={
            <button onClick={openCreate} className="btn-primary">
              Create your first category
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th className="w-40"></th>
              </tr>
            </thead>
            <tbody>
              {initial.map((c, i) => (
                <tr key={c.id}>
                  <td className="text-[11px] font-semibold tracking-widest text-ink-400">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      {c.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={c.image_url}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-surface-subtle" />
                      )}
                      <span className="font-medium text-ink-900">
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-xs tabular-nums text-ink-500">
                    /{c.slug}
                  </td>
                  <td>
                    <span
                      className={c.is_active ? "badge-green" : "badge-grey"}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-4">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setToDelete(c)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={draft !== null}
        onClose={closeDraft}
        title={draft?.id ? "Edit category" : "New category"}
        description={
          draft?.id
            ? "Update the name, image, or visibility."
            : "Add a new section to your catalog."
        }
      >
        {draft && (
          <div className="space-y-5">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Sofas"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[90px] resize-y"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                placeholder="Short description shown on the storefront"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label">Display order</label>
                <input
                  type="number"
                  className="input"
                  value={draft.order}
                  onChange={(e) =>
                    setDraft({ ...draft, order: e.target.value })
                  }
                />
                <p className="hint">Lower numbers appear first.</p>
              </div>
              {draft.id && (
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={draft.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        is_active: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            {/* Cover image */}
            <div>
              <label className="label">Cover image</label>
              <div className="flex items-center gap-4">
                {(draft.imagePreview || draft.existingImageUrl) && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={draft.imagePreview ?? draft.existingImageUrl ?? ""}
                    alt=""
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <label className="btn-secondary cursor-pointer">
                  {draft.imageFile ? "Replace image" : "Choose image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
                  />
                </label>
                {(draft.imagePreview || draft.imageFile) && (
                  <button
                    onClick={() => pickImage(null)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Pairs well with — edit mode only */}
            {draft.id && (
              <div>
                <label className="label">Pairs well with</label>
                <p className="hint mb-3">
                  Categories whose products appear in the &ldquo;Pairs well
                  with&rdquo; row on the storefront. Example: TV Stands pair
                  with Bookshelves.
                </p>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-ink-300/40">
                  {otherCategories.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-ink-500">
                      No other categories to pair with yet.
                    </p>
                  ) : (
                    otherCategories.map((c) => {
                      const checked =
                        draft.complementary_category_ids.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={
                            "flex cursor-pointer items-center gap-3 border-b border-ink-300/30 px-4 py-2.5 last:border-b-0 transition " +
                            (checked
                              ? "bg-brand-50/40"
                              : "hover:bg-surface-subtle")
                          }
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setDraft({
                                ...draft,
                                complementary_category_ids: e.target.checked
                                  ? [
                                      ...draft.complementary_category_ids,
                                      c.id,
                                    ]
                                  : draft.complementary_category_ids.filter(
                                      (id) => id !== c.id,
                                    ),
                              });
                            }}
                            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-sm text-ink-900">
                            {c.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

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
                {busy ? "Saving…" : draft.id ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        description={
          toDelete
            ? `"${toDelete.name}" will be removed. If any products still use it, the deletion will be rejected — reassign them first.`
            : ""
        }
        confirmLabel="Delete category"
      />
    </>
  );
}