/**
 * HTTP client for the local PostgreSQL REST API (server/index.mjs).
 * In dev, Vite proxies /api → http://localhost:3333 (see vite.config.ts).
 */

export const AUTH_TOKEN_KEY = "dbms_token";

export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  const p = path.startsWith("/") ? path : `/${path}`;
  const prefixed = p.startsWith("/api") ? p : `/api${p}`;
  return base ? `${base}${prefixed}` : prefixed;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function baseHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const t = getAuthToken();
  if (t) {
    h.Authorization = `Bearer ${t}`;
  }
  return h;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(apiUrl(path), {
    ...init,
    headers: {
      ...baseHeaders(),
      ...(init?.headers as Record<string, string>),
    },
  });
  const text = await r.text();
  if (!r.ok) {
    let msg = text || `${r.status} ${r.statusText}`;
    try {
      const j = JSON.parse(text);
      if (j?.error && typeof j.error === "string") msg = j.error;
    } catch {
      if (/<!DOCTYPE\s+html/i.test(text) || /<html[\s>]/i.test(text)) {
        if (/Cannot\s+(GET|POST|PUT|PATCH|DELETE)/i.test(text)) {
          msg =
            "API route not found — start the backend on port 3333 (npm run server), or use npm run dev which starts API + Vite together.";
        } else {
          msg = `Server returned HTML instead of JSON (${r.status}). Check that the API is running and VITE_API_URL is correct.`;
        }
      }
    }
    throw new Error(msg);
  }
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
