import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");

// Load .env first, then portal.env (portal.env values take precedence for
// anything not already set by .env, since dotenv won't overwrite).
dotenv.config({ path: path.resolve(rootDir, ".env") });
dotenv.config({ path: path.resolve(rootDir, "portal.env") });

const isProduction = process.env.NODE_ENV === "production";

// ── Fail-fast checks for production ──────────────────────────────────────────
if (isProduction && !process.env.JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET is not set. Refusing to start in production without it."
  );
  process.exit(1);
}

if (isProduction && !process.env.DATABASE_URL) {
  console.error(
    "FATAL: DATABASE_URL is not set. A PostgreSQL connection string is required."
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn(
    "JWT_SECRET missing; using an insecure fallback dev secret. Set JWT_SECRET before deploying."
  );
}

// ── Exported config object ───────────────────────────────────────────────────
const defaultOrigins =
  "http://localhost:5173,https://student-management-portal-unqf.onrender.com";

const config = {
  port: Number(process.env.PORT) || 3001,
  isProduction,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  databaseUrl: process.env.DATABASE_URL,
  pgSsl: process.env.PGSSL === "true",
  trustProxy: process.env.TRUST_PROXY === "1",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || defaultOrigins)
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  rootDir,
  dataDir: path.join(rootDir, "data"),
  uploadsDir: path.join(rootDir, "data", "uploads"),
};

export default config;
