import jwt from "jsonwebtoken";
import config from "../config/env.js";

/**
 * In-memory blocklist for revoked tokens, keyed by JWT `jti`.
 *
 * Tokens are short-lived (7d), so an in-memory set is acceptable for a
 * single-instance deployment. Swap for Redis / a DB table if you run
 * multiple instances, since this set won't survive a restart or replicate.
 */
export const revokedTokenIds = new Set();

/**
 * Create a signed JWT for the given user.
 */
export function makeToken(user) {
  const jti = `${user.id}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, jti },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

/**
 * Verify and decode a JWT string.  Throws on invalid / expired tokens.
 */
export function verifyTokenString(tokenString) {
  return jwt.verify(tokenString, config.jwtSecret);
}
