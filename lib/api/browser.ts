const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

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

function readTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)pf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setTokenCookie(token: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `pf_token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "pf_token=; Path=/; Max-Age=0; SameSite=Lax";
}

export async function apiBrowser<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, ...rest } = init;

  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string> | undefined),
  };

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = readTokenCookie();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    ...rest,
    credentials: "include",
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.error ?? "ERROR",
      res.status,
      body.message ?? "Request failed",
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}