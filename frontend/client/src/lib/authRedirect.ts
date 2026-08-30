const isSafeInternalPath = (value: string) =>
  value.startsWith("/") && !value.startsWith("//");

export const safeRedirect = (
  value: string | null | undefined,
  fallback = "/",
) => {
  if (!value || !isSafeInternalPath(value)) return fallback;
  return value;
};

export const loginRedirect = (path: string) =>
  `/login?redirect=${encodeURIComponent(safeRedirect(path))}`;
