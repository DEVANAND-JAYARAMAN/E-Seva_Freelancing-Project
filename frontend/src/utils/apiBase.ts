/**
 * API root including `/api` (or local `/backend-api` proxy).
 * No trailing slash on the base itself.
 *
 * Localhost uses Next.js rewrite → local backend by default (see next.config.mjs).
 * Production builds use NEXT_PUBLIC_API_URL from .env.production.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "/backend-api";
    }
  }

  const raw = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"}`.replace(
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

/** Authorization headers from the logged-in session token. */
export function authHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra || {});
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
}

/**
 * fetch() wrapper that always attaches Bearer token when present.
 * Use for all authenticated API calls.
 */
export function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = authHeaders(init?.headers);
  return fetch(input, { ...init, headers });
}
