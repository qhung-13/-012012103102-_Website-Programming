const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string> | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string> | null;

  constructor(message: string, status: number, errors?: Record<string, string> | null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

/**
 * Thin wrapper around fetch() for calling the PHP backend.
 * - Serializes plain objects to JSON automatically.
 * - Attaches the Bearer token when provided.
 * - Throws ApiError with a readable message on failure, so callers can
 *   just `try/catch` instead of checking `res.ok` everywhere.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { body, token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: options.cache ?? "no-store",
  });

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Unexpected server response.", res.status);
  }

  if (!res.ok || !json.success) {
    throw new ApiError(json.message || "Something went wrong.", res.status, json.errors);
  }

  return json;
}

export function getApiUrl() {
  return API_URL;
}

/** Resolves an uploaded-image path returned by the backend into a full URL. */
export function resolveImageUrl(path?: string | null): string {
  if (!path) return "/products/placeholder.png";
  if (path.startsWith("http")) return path;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
