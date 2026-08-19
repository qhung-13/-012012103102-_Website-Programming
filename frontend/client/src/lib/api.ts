const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

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

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string> | null,
  ) {
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
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { body, token, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: options.cache ?? "no-store",
    });
  } catch {
    throw new ApiError("Không thể kết nối máy chủ. Vui lòng thử lại sau.", 0);
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Máy chủ trả về dữ liệu không hợp lệ.", res.status);
  }

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.message || "Đã xảy ra lỗi.",
      res.status,
      json.errors,
    );
  }

  return json;
}

export async function apiFetchAll<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const first = await apiFetch<T[]>(`${path}${separator}page=1`, options);
  const rows = [...first.data];
  const totalPages = Math.max(1, Number(first.meta?.totalPages ?? 1));

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await apiFetch<T[]>(
      `${path}${separator}page=${page}`,
      options,
    );
    rows.push(...response.data);
  }

  return rows;
}

export function getApiUrl() {
  return API_URL;
}

/** Resolves an uploaded-image path returned by the backend into a full URL. */
export function resolveImageUrl(path?: string | null): string {
  if (!path) return "/products/placeholder.svg";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/products/")) return path;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
