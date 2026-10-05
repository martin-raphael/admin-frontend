import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryManager } from "@/components/categories/CategoryManager";
import type { Category } from "@/lib/api/categories";

export default async function CategoriesPage() {
  const categories = await apiFetch<Category[]>("/api/v1/categories");

  return (
    <>
      <PageHeader
        eyebrow="Catalog · 02"
        title="Categories"
        description="Group products into clear sections. Categories power filters and navigation."
      />
      <CategoryManager initial={categories} />
    </>
  );
}