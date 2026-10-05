"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
  type TestimonialInput,
} from "@/lib/api/testimonials";
import { ApiError } from "@/lib/api/browser";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type Draft = {
  id?: string;
  name: string;
  text: string;
  rating: number;
  approved: boolean;
  source: "manual" | "google";
};

type SourceFilter = "all" | "manual" | "google";

function emptyDraft(): Draft {
  return {
    name: "",
    text: "",
    rating: 5,
    approved: false,
    source: "manual",
  };
}

export function TestimonialManager({ initial }: { initial: Testimonial[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const counts = useMemo(() => {
    return {
      all: initial.length,
      manual: initial.filter((t) => t.source === "manual").length,
      google: initial.filter((t) => t.source === "google").length,
    };
  }, [initial]);

  const visible = useMemo(() => {
    if (sourceFilter === "all") return initial;
    return initial.filter((t) => t.source === sourceFilter);
  }, [initial, sourceFilter]);

  function openCreate() {
    setError(null);
    setDraft(emptyDraft());
  }

  function openEdit(t: Testimonial) {
    setError(null);
    setDraft({
      id: t.id,
      name: t.name,
      text: t.text,
      rating: t.rating,
      approved: t.approved,
      source: t.source,
    });
  }

  function close() {
    setDraft(null);
    setError(null);
  }

  async function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError("Name is required.");
    if (!draft.text.trim()) return setError("Review text is required.");

    setBusy(true);
    setError(null);

    const payload: TestimonialInput = {
      name: draft.name.trim(),
      text: draft.text.trim(),
      rating: draft.rating,
      approved: draft.approved,
      source: draft.source,
    };

    try {
      if (draft.id) {
        await updateTestimonial(draft.id, payload);
        toast.success("Testimonial updated");
      } else {
        await createTestimonial(payload);
        toast.success("Testimonial added");
      }
      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleApprove(t: Testimonial) {
    try {
      await updateTestimonial(t.id, {
        name: t.name,
        text: t.text,
        rating: t.rating,
        approved: !t.approved,
        source: t.source,
      });
      toast.success(t.approved ? "Unapproved" : "Approved");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not update";
      toast.error(message);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteTestimonial(toDelete.id);
      toast.success("Testimonial deleted");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not delete";
      toast.error(message);
    }
  }

  const TABS: { value: SourceFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "manual", label: "Manual", count: counts.manual },
    { value: "google", label: "Google", count: counts.google },
  ];

  return (
    <>
      {/* Header row: tabs left, action right */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg border border-ink-300/40 bg-white p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSourceFilter(tab.value)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition",
                sourceFilter === tab.value
                  ? "bg-navy text-cream"
                  : "text-ink-600 hover:bg-surface-subtle",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 text-xs tabular-nums",
                  sourceFilter === tab.value
                    ? "text-cream/70"
                    : "text-ink-400",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button onClick={openCreate} className="btn-primary">
          Add testimonial
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={
            sourceFilter === "all"
              ? "No testimonials yet"
              : `No ${sourceFilter} testimonials`
          }
          description={
            sourceFilter === "all"
              ? "Add client reviews to build trust on your storefront."
              : `You don't have any ${sourceFilter} testimonials. Switch tabs or add a new one.`
          }
          action={
            <button onClick={openCreate} className="btn-primary">
              Add a testimonial
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((t, i) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="mt-1 text-[11px] font-semibold tracking-widest text-ink-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* Top row: name + source + rating + approval */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-ink-900">
                        {t.name}
                      </span>

                      {/* Source badge — the key visual separator */}
                      <span
                        className={
                          t.source === "google"
                            ? "badge-green"
                            : "badge-grey"
                        }
                      >
                        {t.source === "google" ? "Google" : "Manual"}
                      </span>

                      <span className="text-xs text-ink-400">·</span>

                      <span className="text-xs tabular-nums text-ink-500">
                        {t.rating} / 5
                      </span>

                      {t.approved ? (
                        <span className="badge-blue">Live</span>
                      ) : (
                        <span className="badge-outline">Pending</span>
                      )}
                    </div>

                    <p className="muted mt-2 leading-relaxed">{t.text}</p>

                    <p className="mt-2 text-xs text-ink-400">
                      {new Date(t.created_at).toLocaleDateString("en-KE", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    onClick={() => toggleApprove(t)}
                    className={
                      t.approved
                        ? "text-sm font-medium text-ink-600 hover:text-ink-900"
                        : "text-sm font-medium text-accent-600 hover:text-accent-700"
                    }
                  >
                    {t.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setToDelete(t)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={draft !== null}
        onClose={close}
        title={draft?.id ? "Edit testimonial" : "Add testimonial"}
        size="md"
      >
        {draft && (
          <div className="space-y-5">
            <div>
              <label className="label">Client name *</label>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                autoFocus
              />
            </div>

            <div>
              <label className="label">Review text *</label>
              <textarea
                className="input min-h-[120px] resize-y"
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Rating</label>
                <select
                  className="input"
                  value={draft.rating}
                  onChange={(e) =>
                    setDraft({ ...draft, rating: Number(e.target.value) })
                  }
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} / 5
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Source</label>
                <select
                  className="input"
                  value={draft.source}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      source: e.target.value as "manual" | "google",
                    })
                  }
                >
                  <option value="manual">Manual — added by you</option>
                  <option value="google">Google — from Google Reviews</option>
                </select>
                <p className="hint">
                  {draft.source === "google"
                    ? "Shows a small Google Review tag on the storefront."
                    : "No source label is shown to customers."}
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={draft.approved}
                onChange={(e) =>
                  setDraft({ ...draft, approved: e.target.checked })
                }
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-ink-700">
                Approve for display on the storefront
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={close} className="btn-secondary">
                Cancel
              </button>
              <button onClick={save} disabled={busy} className="btn-primary">
                {busy ? "Saving…" : draft.id ? "Save changes" : "Add"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete testimonial?"
        description={
          toDelete ? `"${toDelete.name}"'s review will be removed.` : ""
        }
        confirmLabel="Delete"
      />
    </>
  );
}