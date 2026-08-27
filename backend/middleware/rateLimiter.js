// ---------------------------------------------------------------------------
// Minimal in-memory rate limiter (per IP+email) for the login route.
//
// Good enough for a single-instance deployment; for multi-instance setups,
// back this with Redis or use a library like `express-rate-limit` + a shared
// store.
// ---------------------------------------------------------------------------

const loginAttempts = new Map(); // key → { count, firstAttemptAt }
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 50;

export function loginRateLimiter(req, res, next) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const key = `${req.ip}:${email}`;
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return next();
  }

  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (entry.firstAttemptAt + LOGIN_WINDOW_MS - now) / 1000
    );
    res.set("Retry-After", String(retryAfterSeconds));
    return res
      .status(429)
      .json({ message: "Too many login attempts. Please try again later." });
  }

  entry.count += 1;
  return next();
}

/**
 * Clear the rate-limit counter for a specific IP+email after successful login.
 */
export function clearLoginAttempts(ip, email) {
  loginAttempts.delete(`${ip}:${email}`);
}

// Periodically clear stale rate-limit entries so the Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts.entries()) {
    if (now - entry.firstAttemptAt > LOGIN_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, LOGIN_WINDOW_MS).unref();
