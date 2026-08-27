import fs from "fs";
import config from "./config/env.js";
import { exec, close } from "./db/pool.js";
import { seedIfEmpty } from "./db/seed.js";
import app from "./app.js";

// ── Ensure data directories exist ────────────────────────────────────────────
if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
if (!fs.existsSync(config.uploadsDir)) fs.mkdirSync(config.uploadsDir, { recursive: true });

// ── Load and execute schema SQL ──────────────────────────────────────────────
async function initSchema() {
  const schemaPath = new URL("./db/schema.sql", import.meta.url);
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await exec(sql);
}

// ── Startup ──────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initSchema();
    await seedIfEmpty();

    app.listen(config.port, () => {
      console.log(
        `API listening on http://localhost:${config.port} (database: postgres)`
      );
    });
  } catch (err) {
    console.error("STARTUP_ERROR:", err);
    process.exit(1);
  }
}

start();

// ── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown() {
  try {
    await close();
  } catch (err) {
    console.error("SHUTDOWN_ERROR:", err);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
