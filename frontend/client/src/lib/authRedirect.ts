/**
 * Only allow internal application paths as post-login destinations.
 * This prevents a redirect query parameter from becoming an open redirect.
 */
export function getSafeRedirect(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export function getLoginRedirect(path: string): string {
  return `/login?redirect=${encodeURIComponent(path)}`;
}
