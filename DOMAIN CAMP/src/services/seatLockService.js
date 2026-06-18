/**
 * ============================================================
 *  seatLockService.js — Redis Seat Locking (Day 7)
 * ============================================================
 *
 *  Implements the Seat Locking mechanism described in the
 *  lecture slides using the Redis simulation layer.
 *
 *  Spring Boot equivalent (from slides):
 *
 *    public boolean lockSeat(String showId, String seatNumber) {
 *      String key = "seat:" + showId + ":" + seatNumber;
 *      return redisTemplate.opsForValue()
 *          .setIfAbsent(key, "LOCKED", Duration.ofSeconds(300));
 *    }
 *
 *  Academic Insight — Why Seat Locking?
 *  ──────────────────────────────────────
 *  Problem: Race Condition (double-booking)
 *    - User A selects seat A1 at the same time as User B
 *    - Without control → both bookings succeed → CONFLICT!
 *
 *  Solution: TTL-based Seat Locking
 *    - Seat is temporarily locked in Redis (5 min TTL)
 *    - Other users see it as "locked" and cannot select it
 *    - If User A doesn't complete booking → lock expires → seat freed
 *    - Ensures seat availability recovery (no permanent lock-off)
 *
 *  Lock Key Format:
 *    seat:<showKey>:<seatNumber>
 *    e.g., seat:movie-1-2026-06-10-19:00:A5
 *
 *  TTL = 300 seconds (5 minutes) — defines how long a key
 *  remains in Redis before it is automatically deleted.
 * ============================================================
 */

import { redisSetNX, redisDel, redisGet, redisTTL, redisGetAllEntries } from './redisCache';

// TTL for seat locks — 5 minutes (as per lecture slides)
const SEAT_LOCK_TTL = 300;

/**
 * Build the Redis key for a seat lock.
 * Matches the Spring Boot key format from slides.
 *
 * @param {string} showKey - e.g., "movie-1-2026-06-10-19:00"
 * @param {string} seatNumber - e.g., "A5"
 * @returns {string} Redis key
 */
const buildSeatKey = (showKey, seatNumber) => `seat:${showKey}:${seatNumber}`;

/**
 * Lock a seat for the current user (SET NX with TTL).
 *
 * Simulates Redis SET NX (set if not exists):
 *   Boolean locked = redisTemplate.opsForValue()
 *       .setIfAbsent(key, "LOCKED", Duration.ofSeconds(300));
 *
 * @param {string} showKey
 * @param {string} seatNumber
 * @param {string} userId - who is locking the seat
 * @returns {boolean} true if lock acquired, false if already locked
 */
export const lockSeat = (showKey, seatNumber, userId = 'current_user') => {
  const key = buildSeatKey(showKey, seatNumber);
  const lockValue = {
    lockedBy: userId,
    lockedAt: Date.now(),
    showKey,
    seatNumber,
  };
  const acquired = redisSetNX(key, lockValue, SEAT_LOCK_TTL);
  if (acquired) {
    console.log(`[SeatLock] ✅ Seat ${seatNumber} locked for show "${showKey}" (TTL: ${SEAT_LOCK_TTL}s)`);
  } else {
    console.log(`[SeatLock] ❌ Seat ${seatNumber} already locked for show "${showKey}"`);
  }
  return acquired;
};

/**
 * Release a seat lock (DEL key).
 *
 * Simulates:
 *   redisTemplate.delete(key);
 *
 * @param {string} showKey
 * @param {string} seatNumber
 */
export const releaseSeat = (showKey, seatNumber) => {
  const key = buildSeatKey(showKey, seatNumber);
  redisDel(key);
  console.log(`[SeatLock] 🔓 Seat ${seatNumber} released for show "${showKey}"`);
};

/**
 * Release multiple seat locks at once (e.g., on booking confirm).
 *
 * @param {string} showKey
 * @param {string[]} seatNumbers
 */
export const releaseAllSeats = (showKey, seatNumbers) => {
  seatNumbers.forEach((seat) => releaseSeat(showKey, seat));
};

/**
 * Check if a seat is available (not locked in Redis).
 *
 * Simulates:
 *   return redisTemplate.hasKey(key);
 *
 * @param {string} showKey
 * @param {string} seatNumber
 * @returns {boolean} true if available
 */
export const isSeatAvailable = (showKey, seatNumber) => {
  const key = buildSeatKey(showKey, seatNumber);
  const { hit } = redisGet(key);
  return !hit;
};

/**
 * Get all currently locked seats for a show.
 * Filters Redis entries by the show-specific key prefix.
 *
 * @param {string} showKey
 * @returns {Array<{ seatNumber: string, ttlRemaining: number, lockedBy: string }>}
 */
export const getLockedSeats = (showKey) => {
  const prefix = `seat:${showKey}:`;
  const allEntries = redisGetAllEntries();
  return allEntries
    .filter((entry) => entry.key.startsWith(prefix))
    .map((entry) => ({
      seatNumber: entry.key.replace(prefix, ''),
      ttlRemaining: entry.ttlRemaining,
      lockedBy: entry.value?.lockedBy || 'unknown',
      key: entry.key,
    }));
};

/**
 * Get TTL remaining for a specific seat lock in seconds.
 * Returns -1 if the seat is not locked.
 *
 * Simulates:
 *   redisTemplate.getExpire(key, TimeUnit.SECONDS);
 *
 * @param {string} showKey
 * @param {string} seatNumber
 * @returns {number} seconds remaining or -1
 */
export const getSeatLockTTL = (showKey, seatNumber) => {
  const key = buildSeatKey(showKey, seatNumber);
  return redisTTL(key);
};

/**
 * Build a show key from movie + date + time.
 * Used to scope locks to a specific showing.
 *
 * @param {string} movieId
 * @param {string} date
 * @param {string} time
 * @returns {string}
 */
export const buildShowKey = (movieId, date, time) => {
  const sanitized = `${movieId}-${date}-${time}`.replace(/[\s,]/g, '-');
  return sanitized;
};

export default {
  lockSeat,
  releaseSeat,
  releaseAllSeats,
  isSeatAvailable,
  getLockedSeats,
  getSeatLockTTL,
  buildShowKey,
};
