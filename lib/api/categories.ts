import { apiBrowser } from "./browser";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  order: number;
  is_active: boolean;
  complementary_category_ids: string[];   // ← add this line
};

export async function listCategories(): Promise<Category[]> {
  return apiBrowser<Category[]>("/api/v1/categories");
}

export async function createCategory(form: FormData): Promise<Category> {
  return apiBrowser<Category>("/api/v1/categories", {
    method: "POST",
    body: form,
  });
}

export async function updateCategory(
  id: string,
  form: FormData,
): Promise<Category> {
  return apiBrowser<Category>(`/api/v1/categories/${id}`, {
    method: "PATCH",
    body: form,
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiBrowser(`/api/v1/categories/${id}`, { method: "DELETE" });
}