"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  listMedia,
  listFolders,
  uploadMedia,
  deleteMedia,
  type Media,
  type PaginatedMedia,
  type FolderCount,
} from "@/lib/api/media";
import { ApiError } from "@/lib/api/browser";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

function formatBytes(b: number | null): string {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({
  initial,
  initialFolders,
}: {
  initial: PaginatedMedia;
  initialFolders: FolderCount[];
}) {
  const [data, setData] = useState(initial);
  const [folders, setFolders] = useState(initialFolders);
  const [page, setPage] = useState(1);
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toDelete, setToDelete] = useState<Media | null>(null);
  const [preview, setPreview] = useState<Media | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(
    async (opts?: { page?: number; folder?: string; q?: string }) => {
      const p = opts?.page ?? page;
      const f = opts?.folder ?? folderFilter;
      const q = opts?.q ?? search;
      try {
        const [next, nextFolders] = await Promise.all([
          listMedia({
            page: p,
            page_size: 40,
            folder: f === "all" ? undefined : f,
            q: q || undefined,
          }),
          listFolders(),
        ]);
        setData(next);
        setFolders(nextFolders);
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "Could not load media",
        );
      }
    },
    [page, folderFilter, search],
  );

  async function handleUpload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    const targetFolder = folderFilter === "all" ? "general" : folderFilter;
    let succeeded = 0;

    try {
      for (const file of files) {
        try {
          await uploadMedia(file, targetFolder);
          succeeded += 1;
        } catch (err) {
          toast.error(
            `${file.name}: ${
              err instanceof ApiError ? err.message : "upload failed"
            }`,
          );
        }
      }
      if (succeeded) {
        toast.success(
          `${succeeded} image${succeeded === 1 ? "" : "s"} uploaded`,
        );
        setPage(1);
        await refresh({ page: 1 });
      }
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteMedia(toDelete.public_id);
      toast.success("Image deleted");
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not delete image",
      );
    }
  }

  async function copyUrl(m: Media) {
    try {
      await navigator.clipboard.writeText(m.url);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Could not copy URL");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) handleUpload(files);
  }

  const totalBytes = data.items.reduce((sum, m) => sum + (m.bytes ?? 0), 0);

  return (
    <>
      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-ink-300 bg-white hover:border-brand-400 hover:bg-surface-subtle",
        )}
      >
        <div className="text-sm font-medium text-ink-900">
          {busy
            ? "Uploading…"
            : "Drop images here, or click to browse"}
        </div>
        <div className="mt-1 text-xs text-ink-500">
          PNG, JPG, WebP · Original quality preserved · Saved to{" "}
          <span className="font-medium text-ink-700">
            {folderFilter === "all" ? "general" : folderFilter}
          </span>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-secondary mt-4"
        >
          Choose images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) handleUpload(files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="label">Search by filename</label>
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                refresh({ page: 1, q: search });
              }
            }}
            placeholder="e.g. sofa-side"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="label">Folder</label>
          <select
            className="input"
            value={folderFilter}
            onChange={(e) => {
              setFolderFilter(e.target.value);
              setPage(1);
              refresh({ page: 1, folder: e.target.value });
            }}
          >
            <option value="all">All folders</option>
            {folders.map((f) => (
              <option key={f.folder} value={f.folder}>
                {f.folder} ({f.count})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setPage(1);
            refresh({ page: 1 });
          }}
          className="btn-secondary"
        >
          Apply
        </button>
      </div>

      {/* Meta line */}
      <div className="mb-4 flex items-center justify-between text-xs text-ink-500">
        <span>
          {data.total} image{data.total === 1 ? "" : "s"}
          {folderFilter !== "all" && ` in ${folderFilter}`}
        </span>
        <span>Total size this page: {formatBytes(totalBytes)}</span>
      </div>

      {/* Grid */}
      {data.items.length === 0 ? (
        <EmptyState
          title="No media yet"
          description="Upload product photos, category covers, or branding images to reuse across the site."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-ink-300/40 bg-white shadow-card"
            >
              <button
                onClick={() => setPreview(m)}
                className="block aspect-square w-full overflow-hidden bg-surface-subtle"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.filename}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                />
              </button>

              <div className="px-3 py-3">
                <div className="truncate text-xs font-medium text-ink-900">
                  {m.filename}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-400">
                  <span>{m.folder}</span>
                  <span>·</span>
                  <span>{formatBytes(m.bytes)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => copyUrl(m)}
                    className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                  >
                    {copiedId === m.id ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    onClick={() => setToDelete(m)}
                    className="text-[11px] font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-xs text-ink-500">
            Page {data.page} of {data.pages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => {
                const p = data.page - 1;
                setPage(p);
                refresh({ page: p });
              }}
              className="btn-secondary disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={data.page >= data.pages}
              onClick={() => {
                const p = data.page + 1;
                setPage(p);
                refresh({ page: p });
              }}
              className="btn-secondary disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Preview overlay */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-6 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="max-h-full w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink-300/40 px-6 py-4">
              <div className="min-w-0">
                <div className="truncate font-medium text-ink-900">
                  {preview.filename}
                </div>
                <div className="mt-0.5 text-xs text-ink-500">
                  {preview.folder} · {preview.width}×{preview.height} ·{" "}
                  {formatBytes(preview.bytes)}
                </div>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="text-sm font-medium text-ink-500 hover:text-ink-900"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-surface-subtle p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.filename}
                className="mx-auto max-h-full"
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-ink-300/40 px-6 py-4">
              <button
                onClick={() => copyUrl(preview)}
                className="btn-secondary"
              >
                {copiedId === preview.id ? "Copied" : "Copy URL"}
              </button>
              <button
                onClick={() => {
                  setToDelete(preview);
                  setPreview(null);
                }}
                className="btn-danger"
              >
                Delete image
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this image?"
        description={
          toDelete
            ? `"${toDelete.filename}" will be removed from Cloudinary and any product using it will show a broken image. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete image"
      />
    </>
  );
}