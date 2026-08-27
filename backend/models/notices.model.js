import { query, queryOne, execute } from "../db/pool.js";

export async function findAll() {
  return query("SELECT * FROM notices ORDER BY id DESC");
}

export async function findById(id) {
  return queryOne("SELECT * FROM notices WHERE id = $1", [id]);
}

export async function create({ message }) {
  const result = await execute(
    "INSERT INTO notices (message) VALUES ($1) RETURNING *",
    [message]
  );
  return result.rows[0];
}

export async function update(id, { message }) {
  const result = await execute(
    `UPDATE notices SET message = COALESCE($1, message), updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [message, id]
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  const result = await execute("DELETE FROM notices WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
