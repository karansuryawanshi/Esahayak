// src/utils/rateLimit.ts
type Key = string;
const LIMIT = 10; // operations per minute
const WINDOW_MS = 60_000;

const store = new Map<Key, { count: number; expiresAt: number }>();

export function isRateLimited(key: Key) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > LIMIT) {
    return true;
  }
  return false;
}
