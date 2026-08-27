import { query, queryOne, execute } from "../db/pool.js";

export async function findAll() {
  return query("SELECT * FROM attendance ORDER BY id");
}

export async function findById(id) {
  return queryOne("SELECT * FROM attendance WHERE id = $1", [id]);
}

export async function create({ student_name, student_id, subject, attended, total, percent }) {
  const result = await execute(
    `INSERT INTO attendance (student_name, student_id, subject, attended, total, percent)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [student_name || "Aarav Mehta", student_id || "STU-2048", subject, attended, total, percent]
  );
  return result.rows[0];
}

export async function update(id, { student_name, student_id, subject, attended, total, percent }) {
  const result = await execute(
    `UPDATE attendance
     SET student_name = COALESCE($1, student_name),
         student_id = COALESCE($2, student_id),
         subject = COALESCE($3, subject),
         attended = COALESCE($4, attended),
         total = COALESCE($5, total),
         percent = COALESCE($6, percent),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [student_name, student_id, subject, attended, total, percent, id]
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  const result = await execute("DELETE FROM attendance WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
