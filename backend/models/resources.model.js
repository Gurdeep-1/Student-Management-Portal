import { query, queryOne, execute } from "../db/pool.js";

export async function findAll() {
  return query("SELECT * FROM resources ORDER BY id");
}

export async function findById(id) {
  return queryOne("SELECT * FROM resources WHERE id = $1", [id]);
}

export async function create({ title, type, updated, fileUrl }) {
  const result = await execute(
    `INSERT INTO resources (title, type, updated, file_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, type, updated || "Just now", fileUrl || "/uploads/new-resource.pdf"]
  );
  return result.rows[0];
}

export async function update(id, { title, type, updated, fileUrl }) {
  const result = await execute(
    `UPDATE resources
     SET title = COALESCE($1, title),
         type = COALESCE($2, type),
         updated = COALESCE($3, updated),
         file_url = COALESCE($4, file_url),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [title, type, updated, fileUrl, id]
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  const result = await execute("DELETE FROM resources WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
