import { query, queryOne, execute } from "../db/pool.js";

export async function findAll() {
  return query("SELECT * FROM syllabus ORDER BY id");
}

export async function findById(id) {
  return queryOne("SELECT * FROM syllabus WHERE id = $1", [id]);
}

export async function create({ item }) {
  const result = await execute(
    "INSERT INTO syllabus (item) VALUES ($1) RETURNING *",
    [item]
  );
  return result.rows[0];
}

export async function update(id, { item }) {
  const result = await execute(
    `UPDATE syllabus SET item = COALESCE($1, item), updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [item, id]
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  const result = await execute("DELETE FROM syllabus WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
