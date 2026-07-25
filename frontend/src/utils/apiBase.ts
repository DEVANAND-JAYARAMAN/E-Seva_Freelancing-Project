/**
 * API root including `/api` (or local `/backend-api` proxy).
 * No trailing slash on the base itself.
 *
 * Localhost uses Next.js rewrite → production API (avoids CORS).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "/backend-api";
    }
  }

  const raw = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(
    /\/+$/,
    "",
  );
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

/**
 * Build a full API URL. On localhost (proxy + trailingSlash), ends with `/`
 * so Next does not 308-redirect DELETE/PUT into a broken follow-up request.
 */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  const url = `${base}/${clean}`;
  if (base.startsWith("/")) {
    return `${url}/`;
  }
  return url;
}
