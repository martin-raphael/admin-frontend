import "server-only";

import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL!;
const COOKIE = "pf_session";

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
  const session = cookieStore.get(COOKIE)?.value;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Cookie: `${COOKIE}=${session}` } : {}),
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
    throw new ApiError(
      body.error ?? "ERROR",
      res.status,
      body.message ?? "Request failed",
    );
  }

  return res.json() as Promise<T>;
}