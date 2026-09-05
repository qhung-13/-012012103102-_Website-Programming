const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL = (
  configuredApiUrl ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000/api")
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

function requireApiUrl(): string {
  if (!API_URL) {
    throw new ApiError(
      "Chưa cấu hình NEXT_PUBLIC_API_URL cho ứng dụng quản trị.",
      0,
    );
  }
  return API_URL;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { body, token, headers, ...rest } = options;
  const baseUrl = requireApiUrl();

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
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

  let json: ApiResponse<T> | null = null;
  try {
    const raw = await res.text();
    json = raw ? (JSON.parse(raw) as ApiResponse<T>) : null;
  } catch {
    throw new ApiError(`Máy chủ trả về lỗi HTTP ${res.status}.`, res.status);
  }

  if (!json || !res.ok || !json.success) {
    throw new ApiError(
      json?.message || `Máy chủ trả về lỗi HTTP ${res.status}.`,
      res.status,
      json?.errors,
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

export type UploadedImage = {
  filename: string;
  path: string;
  color: string | null;
};

/** Uploads one or more files via multipart/form-data. */
export async function apiUpload(
  files: { file: File; color?: string }[],
  type: "products" | "blog" | "avatars",
  token: string | null,
): Promise<UploadedImage[]> {
  const baseUrl = requireApiUrl();
  const formData = new FormData();
  files.forEach(({ file, color }) => {
    formData.append("images[]", file);
    formData.append("colors[]", color ?? "");
  });

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/upload?type=${type}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
  } catch {
    throw new ApiError("Không thể kết nối máy chủ để tải ảnh.", 0);
  }

  let json: ApiResponse<UploadedImage[]> | null = null;
  try {
    const raw = await res.text();
    json = raw ? JSON.parse(raw) : null;
  } catch {
    throw new ApiError(`Máy chủ trả về lỗi HTTP ${res.status}.`, res.status);
  }
  if (!json || !res.ok || !json.success) {
    throw new ApiError(
      json?.message || `Máy chủ trả về lỗi HTTP ${res.status}.`,
      res.status,
      json?.errors,
    );
  }
  return json.data;
}

/** Best-effort cleanup for uploaded files when the following form request fails. */
export async function apiDeleteUploads(
  paths: string[],
  token: string | null,
): Promise<void> {
  if (paths.length === 0) return;
  await apiFetch("/upload", {
    method: "DELETE",
    token,
    body: { paths },
  });
}

export function getApiUrl() {
  return requireApiUrl();
}

export function resolveImageUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/products/") || path.startsWith("/users/")) return path;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
