import { query, queryOne, execute } from "../db/pool.js";

export async function findAll() {
  return query("SELECT * FROM notifications ORDER BY id DESC");
}

export async function findById(id) {
  return queryOne("SELECT * FROM notifications WHERE id = $1", [id]);
}

export async function create({ message }) {
  const result = await execute(
    "INSERT INTO notifications (message) VALUES ($1) RETURNING *",
    [message]
  );
  return result.rows[0];
}

export async function remove(id) {
  const result = await execute("DELETE FROM notifications WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
