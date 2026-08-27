import pg from "pg";
import config from "../config/env.js";

const { Pool } = pg;

if (!config.databaseUrl) {
  console.error(
    "FATAL: DATABASE_URL is not set. A PostgreSQL connection string is required."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.pgSsl ? { rejectUnauthorized: false } : false,
});

// Don't let idle-client errors crash the process.
pool.on("error", (err) => {
  console.error("PG_POOL_ERROR:", err);
});

// ── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Run a query and return all result rows.
 */
export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * Run a query and return the first row, or `null`.
 */
export async function queryOne(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

/**
 * Run an INSERT / UPDATE / DELETE and return `{ rowCount, rows }`.
 */
export async function execute(sql, params = []) {
  const result = await pool.query(sql, params);
  return { rowCount: result.rowCount, rows: result.rows };
}

/**
 * Run a raw SQL string (e.g. multi-statement DDL).
 */
export async function exec(sql) {
  await pool.query(sql);
}

/**
 * Gracefully drain the pool (for shutdown).
 */
export async function close() {
  await pool.end();
}

export default pool;
