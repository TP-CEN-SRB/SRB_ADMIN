import { redis } from "@/lib/redis"

export const CATALOG_TTL = 300 // 5 min - admin-managed catalog data (bin materials, quests, events, rewards, templates)
export const DASHBOARD_TTL = 60 // 1 min - dashboard chart/aggregate reads with no natural mutation trigger

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = await redis.get<T>(key)
  if (hit !== null && hit !== undefined) return hit
  const value = await fetcher()
  await redis.set(key, value, { ex: ttlSeconds })
  return value
}

// Mirrors the scan+match pattern already used in src/app/api/uptime/route.ts
export async function invalidateByPrefix(prefix: string) {
  let cursor = 0
  do {
    const [next, keys] = await redis.scan(cursor, { match: `${prefix}*`, count: 200 })
    if (keys.length) await redis.del(...keys)
    cursor = Number(next)
  } while (cursor !== 0)
}
