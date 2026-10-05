"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ExistingImage = {
  url: string;
  public_id: string;
  is_primary: boolean;
};

export type NewImage = {
  file: File;
  previewUrl: string;
};

export function ImageUploader({
  existing = [],
  onRemoveExisting,
  newImages,
  onAddNew,
  onRemoveNew,
}: {
  existing?: ExistingImage[];
  onRemoveExisting?: (publicId: string) => void;
  newImages: NewImage[];
  onAddNew: (files: File[]) => void;
  onRemoveNew: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(files: FileList | null) {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (accepted.length) onAddNew(accepted);
  }

  return (
    <div>
      {/* Existing images (edit mode) */}
      {existing.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Current images
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {existing.map((img) => (
              <div
                key={img.public_id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-ink-300/40 bg-surface-subtle"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {img.is_primary && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Primary
                  </span>
                )}
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(img.public_id)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 opacity-0 transition group-hover:opacity-100"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New image previews */}
      {newImages.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-700">
            New images to upload
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {newImages.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg border border-accent-200 bg-surface-subtle"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveNew(i)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 opacity-0 transition group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition",
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-ink-300 hover:border-brand-400 hover:bg-surface-subtle",
        )}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-sm font-medium text-ink-900">
          Drop images here, or click to browse
        </div>
        <div className="mt-1 text-xs text-ink-500">
          PNG, JPG, WebP · Original quality preserved · Stored on Cloudinary
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            pick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}