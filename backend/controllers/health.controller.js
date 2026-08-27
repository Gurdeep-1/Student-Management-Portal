import { queryOne } from "../db/pool.js";

export async function check(_req, res) {
  try {
    await queryOne("SELECT 1 AS ok");
    res.json({ status: "ok", database: "postgres" });
  } catch (err) {
    res
      .status(503)
      .json({ status: "error", database: "postgres", error: err.message });
  }
}
