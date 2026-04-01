import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://smart-inventory-server.vercel.app/api/v1";

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

    if (!res.ok) return fallback;

    const json = await res.json();
    return json.data ?? fallback;
  } catch (e) {
    console.error(`SSR fetch failed for ${path}:`, e);
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

    if (!res.ok) return fallback;
    return await res.json();
  } catch (e) {
    console.error(`SSR fetch failed for ${path}:`, e);
    return fallback;
  }
}
