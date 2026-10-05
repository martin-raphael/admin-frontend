import { apiBrowser } from "./browser";

export type ProductImage = {
  url: string;
  public_id: string;
  alt: string | null;
  is_primary: boolean;
  order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  short_description: string | null;
  description: string | null;
  price: number;
  offer_price: number | null;
  effective_price: number;
  discount_percent: number;
  currency: string;
  specs: Record<string, string>;
  images: ProductImage[];
  stock_status: "in_stock" | "made_to_order" | "out_of_stock";
  is_featured: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export async function listProducts(params: {
  page?: number;
  page_size?: number;
  q?: string;
  category_id?: string;
  status?: string;
} = {}): Promise<PaginatedProducts> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const qs = sp.toString();
  return apiBrowser<PaginatedProducts>(
    `/api/v1/products${qs ? `?${qs}` : ""}`,
  );
}

export async function getProduct(id: string): Promise<Product> {
  return apiBrowser<Product>(`/api/v1/products/${id}`);
}

export async function createProduct(form: FormData): Promise<Product> {
  return apiBrowser<Product>("/api/v1/products", {
    method: "POST",
    body: form,
  });
}

export async function updateProduct(
  id: string,
  form: FormData,
): Promise<Product> {
  return apiBrowser<Product>(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: form,
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiBrowser(`/api/v1/products/${id}`, { method: "DELETE" });
}