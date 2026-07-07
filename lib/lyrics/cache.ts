// Read-through cache for AI responses, backed by the lyrikko_ai_cache table.
//
// Same popular song / same tapped word gets asked over and over — without a
// cache every request pays a full Claude call (seconds of latency + API cost).
// Uses the service-role client because cache rows belong to no user; if the
// admin client isn't configured (e.g. local dev without the key), everything
// degrades to plain compute — the cache is never load-bearing.

import { createAdminClient } from "@/lib/supabase/admin";

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — song vocab doesn't change

// Normalized cache key: stable across cosmetic differences in casing/spacing.
export function cacheKey(...parts: string[]): string {
  return parts.map((p) => p.trim().toLowerCase().replace(/\s+/g, " ")).join("|");
}

/**
 * Return the cached payload for `key`, or compute it. Only results passing
 * `isCacheable` are persisted, so an "I don't know this song" answer today
 * doesn't shadow a good answer after the model can ground it tomorrow.
 */
export async function cachedJson<T>(
  key: string,
  compute: () => Promise<T>,
  isCacheable: (value: T) => boolean,
): Promise<T> {
  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch {
    return compute();
  }

  try {
    const { data } = await admin
      .from("lyrikko_ai_cache")
      .select("payload, created_at")
      .eq("key", key)
      .maybeSingle();
    if (data && Date.now() - new Date(data.created_at).getTime() < TTL_MS) {
      return data.payload as T;
    }
  } catch (err) {
    console.error("[lyrics/cache:read]", err);
  }

  const value = await compute();

  if (isCacheable(value)) {
    try {
      await admin.from("lyrikko_ai_cache").upsert({
        key,
        payload: value as unknown as Record<string, unknown>,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[lyrics/cache:write]", err);
    }
  }

  return value;
}
