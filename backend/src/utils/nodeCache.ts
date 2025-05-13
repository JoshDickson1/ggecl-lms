import NodeCache from "node-cache";

export const CACHE = new NodeCache({ stdTTL: 600 });

export function wildcardDeleteCache(start: string) {
  const keys = CACHE.keys();
  const startKeys = keys.filter((key) => key.startsWith(start));
  CACHE.del(startKeys);
}
