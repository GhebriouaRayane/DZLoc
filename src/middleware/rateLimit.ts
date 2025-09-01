const buckets = new Map<string, { tokens: number; ts: number }>();

export function rateLimit(key: string, limit = 30, refillMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: limit, ts: now };
  const elapsed = now - bucket.ts;
  const refills = Math.floor(elapsed / refillMs);
  const tokens = Math.min(limit, bucket.tokens + refills * limit);
  if (tokens <= 0) return false;
  buckets.set(key, { tokens: tokens - 1, ts: now });
  return true;
}
