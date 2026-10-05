import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import type { Category } from "@/lib/api/categories";
import type { Product } from "@/lib/api/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: Product;
  try {
    product = await apiFetch<Product>(`/api/v1/products/${id}`);
  } catch {
    notFound();
  }

  const categories = await apiFetch<Category[]>("/api/v1/categories");

  return (
    <>
      <PageHeader
        eyebrow={`Catalog · ${product.sku}`}
        title={product.name}
        description="Update the details, pricing, images, or visibility of this product."
      />
      <div className="mx-auto max-w-3xl">
        <ProductForm categories={categories} product={product} />
      </div>
    </>
  );
}