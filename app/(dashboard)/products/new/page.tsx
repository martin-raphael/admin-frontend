import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import type { Category } from "@/lib/api/categories";

export default async function NewProductPage() {
  const categories = await apiFetch<Category[]>("/api/v1/categories");

  return (
    <>
      <PageHeader
        eyebrow="Catalog · New"
        title="Add a product"
        description="Fill in the details below. The product starts as a draft until you publish it."
      />
      <div className="mx-auto max-w-3xl">
        <ProductForm categories={categories} />
      </div>
    </>
  );
}