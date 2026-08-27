import bcrypt from "bcryptjs";

const PASSWORD_MIN_LENGTH = 6;
const SALT_ROUNDS = 10;

/**
 * Returns a human-readable error string if the password violates policy,
 * or `null` if it passes all checks.
 */
export function getPasswordPolicyError(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  return null;
}

/**
 * Hash a plaintext password with bcrypt.
 */
export function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
