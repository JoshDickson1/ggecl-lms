import { CACHE } from "./nodeCache.js";

export async function getCacheOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = CACHE.get<T>(key);
  if (cached) {
    console.debug(`[CACHE] hit ${key}`);
    return cached;
  }
  console.debug(`[CACHE] miss ${key}`);
  const data = await fetcher();
  CACHE.set(key, data);
  console.debug(`[CACHE] set ${key}`);
  return data;
}
