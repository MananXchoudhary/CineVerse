/**
 * ============================================================
 *  redisCache.js — Frontend Redis Simulation (Day 7)
 * ============================================================
 *
 *  Simulates Redis in-memory data store using localStorage.
 *  Implements TTL (Time-To-Live) expiry, exactly as Redis
 *  handles it. In a real Spring Boot app, this is replaced by:
 *
 *    @Cacheable(value = "movies", key = "\"all\"")
 *    public List<Movie> getAllMovies() { ... }
 *
 *  Key Characteristics (matching lecture slides):
 *  - In-memory-managed (RAM-based) → localStorage simulates RAM
 *  - Key-value data model
 *  - Extremely low latency
 *  - Supports TTL (expiry of data)
 *  - Ideal for caching and locking
 *
 *  Cache Key Format used across the app:
 *    movies:all           → cached movie list (TTL: 300s)
 *    seat:<show>:<seat>   → seat lock (TTL: 300s)
 * ============================================================
 */

const REDIS_STORE_KEY = 'cineverse_redis_store';

/**
 * Load the entire simulated Redis store from localStorage.
 * @returns {Object} key → { value, expiresAt } map
 */
const loadStore = () => {
  try {
    const raw = localStorage.getItem(REDIS_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Persist the entire simulated Redis store to localStorage.
 * @param {Object} store
 */
const saveStore = (store) => {
  localStorage.setItem(REDIS_STORE_KEY, JSON.stringify(store));
};

/**
 * GET a value from the Redis cache.
 * Returns null on cache MISS (expired or not found).
 *
 * Academic Insight (Cache-Aside / Lazy Loading):
 *   1. Check cache → if HIT, return value
 *   2. If MISS → fetch from DB → store in cache → return value
 *
 * @param {string} key
 * @returns {{ value: any, hit: boolean }}
 */
export const redisGet = (key) => {
  const store = loadStore();
  const entry = store[key];
  if (!entry) return { value: null, hit: false };

  const now = Date.now();
  if (entry.expiresAt && now > entry.expiresAt) {
    // TTL expired — delete from store (like Redis passive eviction)
    delete store[key];
    saveStore(store);
    console.log(`[Redis] EXPIRED key: "${key}"`);
    return { value: null, hit: false };
  }

  console.log(`[Redis] HIT key: "${key}" (TTL remaining: ${Math.round((entry.expiresAt - now) / 1000)}s)`);
  return { value: entry.value, hit: true };
};

/**
 * SET a key-value pair in the Redis cache with optional TTL.
 *
 * Matches Spring Boot RedisTemplate usage:
 *   redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttl));
 *
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds — seconds until expiry (default: 300)
 */
export const redisSet = (key, value, ttlSeconds = 300) => {
  const store = loadStore();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  store[key] = { value, expiresAt, createdAt: Date.now() };
  saveStore(store);
  console.log(`[Redis] SET key: "${key}" (TTL: ${ttlSeconds}s, expires at: ${new Date(expiresAt).toLocaleTimeString()})`);
};

/**
 * SET only if key does NOT exist (simulates Redis SET NX).
 * This is the foundation of the Seat Locking mechanism!
 *
 * Matches Spring Boot:
 *   Boolean locked = redisTemplate.opsForValue()
 *       .setIfAbsent(key, "LOCKED", Duration.ofSeconds(300));
 *
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 * @returns {boolean} true if key was set, false if already existed
 */
export const redisSetNX = (key, value, ttlSeconds = 300) => {
  const existing = redisGet(key);
  if (existing.hit) {
    console.log(`[Redis] SET NX FAILED — key "${key}" already exists`);
    return false;
  }
  redisSet(key, value, ttlSeconds);
  console.log(`[Redis] SET NX SUCCESS — key "${key}" locked for ${ttlSeconds}s`);
  return true;
};

/**
 * DELETE a key from the Redis cache.
 *
 * Matches Spring Boot:
 *   redisTemplate.delete(key);
 *
 * @param {string} key
 */
export const redisDel = (key) => {
  const store = loadStore();
  if (store[key]) {
    delete store[key];
    saveStore(store);
    console.log(`[Redis] DEL key: "${key}"`);
  }
};

/**
 * Check if a key exists and is not expired (TTL-aware).
 * @param {string} key
 * @returns {boolean}
 */
export const redisExists = (key) => {
  return redisGet(key).hit;
};

/**
 * Get TTL remaining for a key in seconds.
 * Returns -1 if key does not exist or is expired.
 * @param {string} key
 * @returns {number} seconds remaining
 */
export const redisTTL = (key) => {
  const store = loadStore();
  const entry = store[key];
  if (!entry) return -1;
  const remaining = Math.round((entry.expiresAt - Date.now()) / 1000);
  return remaining > 0 ? remaining : -1;
};

/**
 * Get ALL keys currently in the Redis store (for the debug panel).
 * Filters out expired entries automatically.
 * @returns {Array<{ key: string, value: any, expiresAt: number, ttlRemaining: number }>}
 */
export const redisGetAllEntries = () => {
  const store = loadStore();
  const now = Date.now();
  const entries = [];

  for (const [key, entry] of Object.entries(store)) {
    const ttlRemaining = Math.round((entry.expiresAt - now) / 1000);
    if (ttlRemaining > 0) {
      entries.push({
        key,
        value: entry.value,
        expiresAt: entry.expiresAt,
        createdAt: entry.createdAt,
        ttlRemaining,
      });
    }
  }

  return entries;
};

/**
 * Flush all keys (simulates FLUSHALL in Redis).
 * Used for testing.
 */
export const redisFlushAll = () => {
  localStorage.removeItem(REDIS_STORE_KEY);
  console.log('[Redis] FLUSHALL — all keys cleared');
};

export default {
  get: redisGet,
  set: redisSet,
  setNX: redisSetNX,
  del: redisDel,
  exists: redisExists,
  ttl: redisTTL,
  getAllEntries: redisGetAllEntries,
  flushAll: redisFlushAll,
};
