import { cookies } from "next/headers";
import { BACKEND_URL } from "./constants";

/**
 * Reusable server-side fetch utility for Next.js Server Components.
 * Handles cookie extraction, auth headers, and error handling in one place.
 * Eliminates duplicated SSR fetch logic across page files.
 */
export async function serverFetch<T = unknown>(
  path: string,
  options: { fallback?: T } = {}
): Promise<T> {
  const fallback = options.fallback as T;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${BACKEND_URL}${path}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[SSR] Fetch failed for ${path} with status ${res.status}`);
      return fallback;
    }

    const json = await res.json();
    return json.data ?? fallback;
  } catch (e) {
    console.error(`[SSR] Fetch encountered an exception for ${path}:`, e);
    return fallback;
  }
}

/**
 * Variant that returns the full response (including meta for pagination).
 */
export async function serverFetchFull<T = unknown>(
  path: string,
  options: { fallback?: T } = {}
): Promise<T> {
  const fallback = options.fallback as T;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${BACKEND_URL}${path}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[SSR Full] Fetch failed for ${path} with status ${res.status}`);
      return fallback;
    }
    return await res.json();
  } catch (e) {
    console.error(`[SSR Full] Fetch encountered an exception for ${path}:`, e);
    return fallback;
  }
}
