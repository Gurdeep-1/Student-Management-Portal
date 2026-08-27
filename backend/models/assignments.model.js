import { query, queryOne, execute } from "../db/pool.js";

export async function findAll() {
  return query("SELECT * FROM assignments ORDER BY id");
}

export async function findById(id) {
  return queryOne("SELECT * FROM assignments WHERE id = $1", [id]);
}

export async function create({ student_name, student_id, title, course, due, status }) {
  const result = await execute(
    `INSERT INTO assignments (student_name, student_id, title, course, due, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [student_name || "Aarav Mehta", student_id || "STU-2048", title, course, due || "Next Monday", status || "Pending"]
  );
  return result.rows[0];
}

export async function update(id, { student_name, student_id, title, course, due, status }) {
  const result = await execute(
    `UPDATE assignments
     SET student_name = COALESCE($1, student_name),
         student_id = COALESCE($2, student_id),
         title = COALESCE($3, title),
         course = COALESCE($4, course),
         due = COALESCE($5, due),
         status = COALESCE($6, status),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [student_name, student_id, title, course, due, status, id]
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  const result = await execute("DELETE FROM assignments WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
