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

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
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
    throw new ApiError(
      json.message || "Something went wrong.",
      res.status,
      json.errors,
    );
  }

  return json;
}

/** Uploads one or more files via multipart/form-data. Returns the array of { path, color }. */
export async function apiUpload(
  files: { file: File; color?: string }[],
  type: "products" | "blog" | "avatars",
  token: string | null,
): Promise<{ filename: string; path: string; color: string | null }[]> {
  const formData = new FormData();
  files.forEach(({ file, color }) => {
    formData.append("images[]", file);
    formData.append("colors[]", color ?? "");
  });

  const res = await fetch(`${API_URL}/upload?type=${type}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new ApiError(
      json.message || "Upload failed.",
      res.status,
      json.errors,
    );
  }
  return json.data;
}

export function getApiUrl() {
  return API_URL;
}

export function resolveImageUrl(path?: string | null): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
