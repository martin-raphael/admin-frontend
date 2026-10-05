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

export async function apiBrowser<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, ...rest } = init;

  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string> | undefined),
  };

  // Only set JSON content-type when we're actually sending JSON.
  // FormData must set its own multipart boundary — never override it.
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
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

  // Some endpoints return 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}