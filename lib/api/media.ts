import { apiBrowser } from "./browser";

export type Media = {
  id: string;
  url: string;
  public_id: string;
  filename: string;
  folder: string;
  format: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type PaginatedMedia = {
  items: Media[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type FolderCount = { folder: string; count: number };

export async function listMedia(params: {
  page?: number;
  page_size?: number;
  folder?: string;
  q?: string;
} = {}): Promise<PaginatedMedia> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const qs = sp.toString();
  return apiBrowser<PaginatedMedia>(
    `/api/v1/media${qs ? `?${qs}` : ""}`,
  );
}

export async function listFolders(): Promise<FolderCount[]> {
  return apiBrowser<FolderCount[]>("/api/v1/media/folders");
}

export async function uploadMedia(
  file: File,
  folder = "general",
): Promise<Media> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  return apiBrowser<Media>("/api/v1/media/upload", {
    method: "POST",
    body: fd,
  });
}

export async function deleteMedia(publicId: string): Promise<void> {
  await apiBrowser(`/api/v1/media/${encodeURIComponent(publicId)}`, {
    method: "DELETE",
  });
}