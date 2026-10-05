import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { MediaLibrary } from "@/components/media/MediaLibrary";
import type { FolderCount, PaginatedMedia } from "@/lib/api/media";

export default async function MediaPage() {
  const [data, folders] = await Promise.all([
    apiFetch<PaginatedMedia>("/api/v1/media?page=1&page_size=40"),
    apiFetch<FolderCount[]>("/api/v1/media/folders"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Assets"
        title="Media library"
        description="Every image you upload — product photos, category covers, branding. Stored on Cloudinary, delivered via CDN."
      />
      <MediaLibrary initial={data} initialFolders={folders} />
    </>
  );
}