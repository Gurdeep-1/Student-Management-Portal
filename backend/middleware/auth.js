import { verifyTokenString, revokedTokenIds } from "../utils/token.js";

/**
 * Middleware: verifies the Bearer token in the Authorization header.
 * Populates `req.user` with the decoded JWT payload on success.
 */
export function verifyToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = verifyTokenString(token);

    // Check the server-side revocation blocklist (populated on logout).
    if (decoded.jti && revokedTokenIds.has(decoded.jti)) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Middleware factory: ensures the authenticated user's role is one of
 * the supplied `roles`.
 *
 * Usage:  `requireRole("admin")` or `requireRole("faculty", "admin")`
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access restricted to: ${roles.join(", ")}` });
    }
    next();
  };
}
