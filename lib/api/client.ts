import "server-only";

import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL!;
const COOKIE = "pf_session";
const TOKEN_COOKIE = "pf_token";

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();

  // Prefer the cross-origin token cookie (readable by the Vercel server),
  // fall back to the same-origin session cookie for local dev.
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  const session = cookieStore.get(COOKIE)?.value;

  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : session
      ? { Cookie: `${COOKIE}=${session}` }
      : {};

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? "UNAUTHORIZED", 401, body.message);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    let message: string | undefined = body.message;
    if (!message && Array.isArray(body.detail)) {
      message = body.detail
        .map((d: { loc?: string[]; msg?: string }) => d.msg)
        .filter(Boolean)
        .join(" · ");
    }
    throw new ApiError(
      body.error ?? "ERROR",
      res.status,
      message ?? `Request failed (${res.status})`,
    );
  }

  return res.json() as Promise<T>;
}