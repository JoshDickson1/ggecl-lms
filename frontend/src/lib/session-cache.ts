// src/lib/session-cache.ts
//
// Thin localStorage wrapper that persists the last known session user.
// This lets AuthProvider and useDashboardUser serve a cached user immediately
// on page reload, eliminating the "Verifying session…" flash while the
// network re-validation happens silently in the background.
//
// Security note: this only caches non-sensitive profile data (id, name, email,
// role). The actual auth token/cookie is still managed by better-auth and is
// never touched here.

const KEY = "ggecl_session_user";

export interface CachedSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

export function readSessionCache(): CachedSessionUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedSessionUser;
  } catch {
    return null;
  }
}

export function writeSessionCache(user: CachedSessionUser): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // localStorage may be unavailable in private browsing — fail silently
  }
}

export function clearSessionCache(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
