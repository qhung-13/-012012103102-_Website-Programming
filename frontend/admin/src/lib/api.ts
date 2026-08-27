const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL = (
  configuredApiUrl ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000/api" : "")
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

function endpoint(path: string): string {
  if (!API_URL) {
    throw new ApiError(
      "Chưa cấu hình NEXT_PUBLIC_API_URL cho môi trường production.",
      0,
    );
  }
  return `${API_URL}${path}`;
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

  const url = endpoint(path);
  let res: Response;
  try {
    res = await fetch(url, {
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

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("trendlama:auth-expired"));
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

/** Đọc toàn bộ các trang API khi màn hình quản trị cần tập dữ liệu đầy đủ. */
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

  const url = endpoint(`/upload?type=${type}`);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
  } catch {
    throw new ApiError("Không thể kết nối máy chủ để tải ảnh.", 0);
  }

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("trendlama:auth-expired"));
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Máy chủ trả về dữ liệu không hợp lệ.", res.status);
  }
  if (!res.ok || !json.success) {
    throw new ApiError(
      json.message || "Không thể tải ảnh lên.",
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
  if (!path) return "/placeholder.svg";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/products/") || path.startsWith("/users/")) return path;
  if (!API_URL) return path;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
