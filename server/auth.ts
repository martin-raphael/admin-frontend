import { cache } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

export type Admin = {
  id: string;
  name: string;
  email: string;
  email_display: string;
  role: "admin" | "editor";
  last_login_at: string | null;
};

/**
 * Fetches the current admin, memoized per request.
 *
 * Because it's wrapped in React's cache(), the layout and any page that
 * call getCurrentAdmin() share a single fetch — no parallel duplicates,
 * no race conditions where one throws while the other redirects.
 */
export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  try {
    return await apiFetch<Admin>("/api/v1/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
});